const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { toSlug } = require('../utils/slug');

function parseMultipartFields(body) {
  const parsed = { ...body };
  for (const key of ['variants', 'tags', 'images']) {
    if (typeof parsed[key] === 'string') {
      try { parsed[key] = JSON.parse(parsed[key]); } catch {}
    }
  }
  for (const key of ['featured', 'bestseller', 'newArrival', 'isActive']) {
    if (typeof parsed[key] === 'string') parsed[key] = parsed[key] === 'true';
  }
  for (const key of ['price', 'salePrice', 'lowStockThreshold']) {
    if (parsed[key] === '') delete parsed[key];
    else if (parsed[key] !== undefined) parsed[key] = Number(parsed[key]);
  }
  return parsed;
}

function buildFilter(query) {
  const filter = { isActive: true };
  if (query.gender && query.gender !== 'all') filter.gender = query.gender;
  if (query.category) filter.categorySlug = query.category;
  if (query.sale === 'true') filter.onSale = true;
  if (query.new === 'true') filter.newArrival = true;
  if (query.bestseller === 'true') filter.bestseller = true;
  if (query.featured === 'true') filter.featured = true;
  if (query.q) filter.$text = { $search: query.q };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.size || query.color) {
    filter.variants = { $elemMatch: {} };
    if (query.size) filter.variants.$elemMatch.size = query.size;
    if (query.color) filter.variants.$elemMatch.color = new RegExp(`^${query.color}$`, 'i');
    if (query.inStock === 'true') filter.variants.$elemMatch.stock = { $gt: 0 };
  } else if (query.inStock === 'true') {
    filter['variants.stock'] = { $gt: 0 };
  }
  return filter;
}

function sortFromQuery(query) {
  switch (query.sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'popularity':
      return { soldCount: -1, ratingAvg: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

exports.listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Number(req.query.limit) || 12);
  const filter = buildFilter(req.query);
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug gender')
      .sort(sortFromQuery(req.query))
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({
    success: true,
    products: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.searchSuggest = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, products: [] });
  const products = await Product.find({
    isActive: true,
    $or: [
      { name: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') },
      { sku: new RegExp(q, 'i') },
    ],
  })
    .select('name slug price salePrice images gender')
    .limit(8);
  res.json({ success: true, products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'category',
    'name slug gender'
  );
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.relatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new AppError('Product not found', 404);
  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ categorySlug: product.categorySlug }, { gender: product.gender }],
  }).limit(8);
  res.json({ success: true, products: related });
});

exports.listCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.gender) filter.gender = { $in: [req.query.gender, 'all', 'unisex'] };
  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const body = parseMultipartFields(req.body);
  body.slug = body.slug || toSlug(body.name);
  body.onSale = Boolean(body.salePrice && body.salePrice < body.price);
  if (req.files?.length) body.images = req.files.map((f) => `/uploads/${f.filename}`);
  const product = await Product.create(body);
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const body = parseMultipartFields(req.body);
  if (body.name && !body.slug) body.slug = toSlug(body.name);
  if (body.price || body.salePrice) {
    body.onSale = Boolean(body.salePrice && body.salePrice < (body.price ?? 0));
  }
  if (req.files?.length) {
    const existingImages = Array.isArray(body.images)
      ? body.images
      : body.images
        ? [body.images]
        : [];
    body.images = [...existingImages, ...req.files.map((f) => `/uploads/${f.filename}`)];
  }
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});

exports.adminGetProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.adminListProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.q) {
    filter.$or = [
      { name: new RegExp(req.query.q, 'i') },
      { sku: new RegExp(req.query.q, 'i') },
    ];
  }
  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.category) filter.categorySlug = req.query.category;
  if (req.query.tag) filter.tags = new RegExp(`^${req.query.tag}$`, 'i');
  if (req.query.collection === 'new') filter.newArrival = true;
  if (req.query.collection === 'bestseller') filter.bestseller = true;
  if (req.query.collection === 'sale') filter.onSale = true;
  if (req.query.collection === 'featured') filter.featured = true;
  if (req.query.active === 'true') filter.isActive = true;
  if (req.query.active === 'false') filter.isActive = false;
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, products: items, pagination: { page, limit, total } });
});
