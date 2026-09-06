const Wishlist = require('../models/Wishlist');
const { asyncHandler } = require('../utils/asyncHandler');

async function getList(userId) {
  let list = await Wishlist.findOne({ user: userId }).populate('products');
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
}

exports.getWishlist = asyncHandler(async (req, res) => {
  const list = await getList(req.user._id);
  res.json({ success: true, products: list.products });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const list = await getList(req.user._id);
  const exists = list.products.some((p) => String(p._id || p) === String(productId));
  if (exists) list.products = list.products.filter((p) => String(p._id || p) !== String(productId));
  else list.products.push(productId);
  await list.save();
  await list.populate('products');
  res.json({ success: true, products: list.products, added: !exists });
});
