const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { findVariant } = require('../services/inventoryService');
const { unitPrice } = require('../services/couponService');

async function getOrCreateCart(req) {
  if (req.user) {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    return cart;
  }
  const guestId = req.headers['x-guest-id'] || req.body.guestId;
  if (!guestId) throw new AppError('Guest cart id is required', 400);
  let cart = await Cart.findOne({ guestId });
  if (!cart) cart = await Cart.create({ guestId, items: [] });
  return cart;
}

async function populatedCart(cart) {
  await cart.populate('items.product');
  const items = [];
  let subtotal = 0;
  for (const item of cart.items) {
    if (!item.product) continue;
    const price = unitPrice(item.product);
    const line = price * item.quantity;
    subtotal += line;
    const variant = findVariant(item.product, item.size, item.color);
    items.push({
      _id: item._id,
      product: item.product,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price,
      lineTotal: line,
      inStock: Boolean(variant && variant.stock >= item.quantity),
      stock: variant?.stock ?? 0,
    });
  }
  return { cartId: cart._id, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) };
}

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  res.json({ success: true, ...(await populatedCart(cart)) });
});

exports.addItem = asyncHandler(async (req, res) => {
  const { productId, size, color, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not available', 404);
  const variant = findVariant(product, size, color);
  if (!variant) throw new AppError('Select a valid size and color', 400);
  if (variant.stock < quantity) throw new AppError('Not enough stock for this variant', 400);
  const cart = await getOrCreateCart(req);
  const existing = cart.items.find(
    (i) => String(i.product) === String(productId) && i.size === size && i.color === color
  );
  if (existing) {
    if (variant.stock < existing.quantity + quantity) throw new AppError('Not enough stock', 400);
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, size, color, quantity });
  }
  await cart.save();
  res.status(201).json({ success: true, ...(await populatedCart(cart)) });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);
  if (quantity < 1) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    const variant = findVariant(product, item.size, item.color);
    if (!variant || variant.stock < quantity) throw new AppError('Not enough stock', 400);
    item.quantity = quantity;
  }
  await cart.save();
  res.json({ success: true, ...(await populatedCart(cart)) });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  const item = cart.items.id(req.params.itemId);
  if (item) item.deleteOne();
  await cart.save();
  res.json({ success: true, ...(await populatedCart(cart)) });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  cart.items = [];
  await cart.save();
  res.json({ success: true, ...(await populatedCart(cart)) });
});
