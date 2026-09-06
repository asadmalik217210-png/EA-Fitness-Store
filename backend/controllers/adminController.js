const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const InventoryLog = require('../models/InventoryLog');
const Settings = require('../models/Settings');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { adjustVariantStock } = require('../services/inventoryService');

exports.overview = asyncHandler(async (_req, res) => {
  const [products, orders, customers] = await Promise.all([
    Product.find(),
    Order.find().sort({ createdAt: -1 }),
    User.countDocuments({ role: 'customer' }),
  ]);

  const paid = orders.filter((o) => o.payment?.status === 'paid' && o.status !== 'Cancelled');
  const totalSales = paid.reduce((s, o) => s + (o.total || 0), 0);
  const lowStock = [];
  const outOfStock = [];
  for (const p of products) {
    const total = p.variants.reduce((s, v) => s + v.stock, 0);
    if (total === 0) outOfStock.push(p);
    else if (p.variants.some((v) => v.stock <= p.lowStockThreshold)) lowStock.push(p);
  }

  const byDay = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay[key] = byDay[key] || { date: key, revenue: 0, orders: 0 };
    byDay[key].revenue += o.payment?.status === 'paid' && o.status !== 'Cancelled' ? o.total : 0;
    byDay[key].orders += o.status !== 'Cancelled' ? 1 : 0;
  }
  const chart = Object.values(byDay).slice(-14);

  const topMap = {};
  for (const o of orders) {
    if (o.status === 'Cancelled' || o.payment?.status !== 'paid') continue;
    for (const item of o.items) {
      topMap[item.name] = (topMap[item.name] || 0) + item.quantity;
    }
  }
  const topProducts = Object.entries(topMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  res.json({
    success: true,
    stats: {
      totalSales,
      orderCount: orders.length,
      customers,
      products: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    },
    recentOrders: orders.slice(0, 8),
    lowStockProducts: lowStock.slice(0, 10),
    outOfStockProducts: outOfStock.slice(0, 10),
    chart,
    topProducts,
  });
});

exports.inventory = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    filter.$or = [{ name: new RegExp(req.query.q, 'i') }, { sku: new RegExp(req.query.q, 'i') }];
  }
  const products = await Product.find(filter).sort({ name: 1 });
  const rows = [];
  for (const p of products) {
    for (const v of p.variants) {
      rows.push({
        productId: p._id,
        name: p.name,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stock: v.stock,
        threshold: p.lowStockThreshold,
        status: v.stock === 0 ? 'out' : v.stock <= p.lowStockThreshold ? 'low' : 'ok',
      });
    }
  }
  res.json({ success: true, rows });
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const { productId, size, color, change, note } = req.body;
  const product = await adjustVariantStock({
    productId,
    size,
    color,
    change: Number(change),
    reason: 'adjustment',
    note,
    admin: req.user._id,
  });
  res.json({ success: true, product });
});

exports.stockHistory = asyncHandler(async (req, res) => {
  const logs = await InventoryLog.find(req.query.productId ? { product: req.query.productId } : {})
    .populate('product', 'name sku')
    .populate('admin', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, logs });
});

exports.customers = asyncHandler(async (req, res) => {
  const filter = { role: 'customer' };
  if (req.query.q) {
    filter.$or = [
      { email: new RegExp(req.query.q, 'i') },
      { firstName: new RegExp(req.query.q, 'i') },
      { lastName: new RegExp(req.query.q, 'i') },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, customers: users.map((u) => u.toSafeJSON()) });
});

exports.customerDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('Customer not found', 404);
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  const spent = orders.reduce((s, o) => s + (o.status === 'Cancelled' ? 0 : o.total), 0);
  res.json({ success: true, customer: user.toSafeJSON(), orders, spent, orderCount: orders.length });
});

exports.setCustomerStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) throw new AppError('Customer not found', 404);
  res.json({ success: true, customer: user.toSafeJSON() });
});

exports.admins = asyncHandler(async (_req, res) => {
  const admins = await User.find({ role: 'admin' });
  res.json({ success: true, admins: admins.map((u) => u.toSafeJSON()) });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await User.create({ firstName, lastName, email, password, role: 'admin' });
  res.status(201).json({ success: true, admin: user.toSafeJSON() });
});

exports.getSettings = asyncHandler(async (_req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create(req.body);
  else Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, settings });
});

exports.payments = asyncHandler(async (_req, res) => {
  const Payment = require('../models/Payment');
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(100).populate('order', 'orderNumber total');
  res.json({ success: true, payments });
});
