const Category = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { toSlug } = require('../utils/slug');

exports.create = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    slug: req.body.slug || toSlug(req.body.name),
  });
  res.status(201).json({ success: true, category });
});

exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, category });
});

exports.remove = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
