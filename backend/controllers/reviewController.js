const Review = require('../models/Review');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

async function recalc(productId) {
  const approved = await Review.find({ product: productId, status: 'approved' });
  const count = approved.length;
  const avg = count ? approved.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Product.findByIdAndUpdate(productId, { ratingCount: count, ratingAvg: Math.round(avg * 10) / 10 });
}

exports.listForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new AppError('Product not found', 404);
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    throw new AppError('Rating must be an integer from 1 to 5', 400);
  }
  if (!String(comment || '').trim() || String(comment).trim().length > 2000) {
    throw new AppError('Review comment is required and must be under 2000 characters', 400);
  }
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: Number(rating),
    comment: String(comment).trim(),
    status: 'pending',
  });
  res.status(201).json({ success: true, review, message: 'Review submitted for approval' });
});

exports.adminListReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const reviews = await Review.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

exports.moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  review.status = req.body.status;
  await review.save();
  await recalc(review.product);
  res.json({ success: true, review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  await recalc(review.product);
  res.json({ success: true, message: 'Review deleted' });
});
