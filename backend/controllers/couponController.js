const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

exports.list = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

exports.create = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: String(req.body.code || '').toUpperCase() });
  res.status(201).json({ success: true, coupon });
});

exports.update = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, coupon });
});

exports.remove = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
