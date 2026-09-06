const Coupon = require('../models/Coupon');
const { AppError } = require('../utils/appError');

function unitPrice(product) {
  if (product.salePrice && product.salePrice > 0 && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
}

async function applyCoupon(code, items, subtotal) {
  if (!code) return { discount: 0, coupon: null };
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
  if (!coupon) throw new AppError('Invalid coupon code', 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Coupon has expired', 400);
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit reached', 400);
  }
  if (subtotal < coupon.minOrderValue) {
    throw new AppError(`Minimum order of $${coupon.minOrderValue} required`, 400);
  }

  const eligible = items.filter((item) => {
    const product = item.productDoc || item.product;
    if (coupon.gender !== 'all' && product.gender !== coupon.gender) return false;
    if (coupon.productIds?.length && !coupon.productIds.some((id) => String(id) === String(product._id))) {
      return false;
    }
    if (coupon.categorySlugs?.length && !coupon.categorySlugs.includes(product.categorySlug)) {
      return false;
    }
    return true;
  });

  const eligibleSubtotal = eligible.reduce((sum, item) => {
    const product = item.productDoc || item.product;
    return sum + unitPrice(product) * item.quantity;
  }, 0);

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((eligibleSubtotal * coupon.value) / 100 * 100) / 100;
  } else {
    discount = Math.min(coupon.value, eligibleSubtotal);
  }
  return { discount, coupon };
}

module.exports = { unitPrice, applyCoupon };
