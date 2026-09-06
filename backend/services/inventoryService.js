const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { AppError } = require('../utils/appError');

function findVariant(product, size, color) {
  return product.variants.find(
    (v) => v.size === size && v.color.toLowerCase() === String(color).toLowerCase()
  );
}

async function adjustVariantStock({ productId, size, color, change, reason, note, admin, order, session }) {
  const product = await Product.findById(productId).session(session || null);
  if (!product) throw new AppError('Product not found', 404);
  const variant = findVariant(product, size, color);
  if (!variant) throw new AppError('Variant not found', 404);
  const next = variant.stock + change;
  if (next < 0) throw new AppError(`Insufficient stock for ${product.name} (${size} / ${color})`, 400);
  variant.stock = next;
  await product.save({ session });
  await InventoryLog.create([{
    product: product._id,
    sku: variant.sku,
    size,
    color,
    change,
    reason,
    note,
    admin,
    order,
    resultingStock: variant.stock,
  }], { session });
  return product;
}

async function decreaseForOrder(items, orderId, session) {
  for (const item of items) {
    await adjustVariantStock({
      productId: item.product,
      size: item.size,
      color: item.color,
      change: -item.quantity,
      reason: 'order',
      order: orderId,
      session,
    });
  }
}

async function restoreForOrder(order, session) {
  if (order.inventoryRestored) return;
  for (const item of order.items) {
    await adjustVariantStock({
      productId: item.product,
      size: item.size,
      color: item.color,
      change: item.quantity,
      reason: order.status === 'Returned' ? 'return' : 'cancel',
      order: order._id,
      session,
    });
  }
  order.inventoryRestored = true;
  await order.save({ session });
}

module.exports = { findVariant, adjustVariantStock, decreaseForOrder, restoreForOrder };
