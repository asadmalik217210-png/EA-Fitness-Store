const mongoose = require('mongoose');
const Order = require('../models/Order');
const Return = require('../models/Return');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { createOrderNumber } = require('../utils/orderNumber');
const { unitPrice, applyCoupon } = require('../services/couponService');
const { findVariant, decreaseForOrder, restoreForOrder } = require('../services/inventoryService');
const { processPayment } = require('../services/paymentService');

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard', price: 8, eta: '5–7 business days' },
  { id: 'express', name: 'Express', price: 18, eta: '2–3 business days' },
  { id: 'overnight', name: 'Overnight', price: 32, eta: '1 business day' },
];

exports.shippingMethods = asyncHandler(async (_req, res) => {
  res.json({ success: true, methods: SHIPPING_METHODS, freeShippingMin: 100 });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let createdOrder;
  try {
    await session.withTransaction(async () => {
      const cart = req.user
        ? await Cart.findOne({ user: req.user._id }).populate('items.product').session(session)
        : await Cart.findOne({ guestId: req.headers['x-guest-id'] }).populate('items.product').session(session);
      if (!cart?.items?.length) throw new AppError('Your cart is empty', 400);

      const {
    shippingAddress,
    shippingMethodId = 'standard',
    paymentMethod = 'card',
    couponCode,
    email,
      } = req.body;

      if (!shippingAddress?.firstName || !shippingAddress?.line1 || !shippingAddress?.city) {
        throw new AppError('Complete shipping information is required', 400);
      }

      const method = SHIPPING_METHODS.find((m) => m.id === shippingMethodId) || SHIPPING_METHODS[0];
      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.items) {
    const product = item.product;
    if (!product?.isActive) throw new AppError('A product in your cart is no longer available', 400);
    const variant = findVariant(product, item.size, item.color);
    if (!variant || variant.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
    const price = unitPrice(product);
    subtotal += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      sku: variant.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price,
      productDoc: product,
    });
      }

      let shippingPrice = method.price;
      if (subtotal >= 100 && method.id === 'standard') shippingPrice = 0;

      const { discount, coupon } = await applyCoupon(couponCode, orderItems, subtotal);
      const total = Math.max(0, Math.round((subtotal - discount + shippingPrice) * 100) / 100);

      const [order] = await Order.create([{
    orderNumber: createOrderNumber(),
    user: req.user?._id,
    email: email || shippingAddress.email || req.user?.email,
    items: orderItems.map(({ productDoc, ...rest }) => rest),
    shippingAddress,
    shippingMethod: method,
    subtotal,
    discount,
    shippingPrice,
    total,
    couponCode: coupon?.code,
    status: 'Pending',
    timeline: [{ status: 'Pending', note: 'Order placed' }],
    payment: { method: paymentMethod, status: 'pending', provider: process.env.PAYMENT_MODE || 'mock' },
      }], { session });

      await decreaseForOrder(order.items, order._id, session);

      const pay = await processPayment({ order, user: req.user, method: paymentMethod, session });
      order.payment = { method: paymentMethod, ...pay };
      if (pay.status === 'paid' || paymentMethod === 'cod') {
        order.status = 'Confirmed';
        order.timeline.push({ status: 'Confirmed', note: 'Payment accepted' });
      }
      await order.save({ session });

      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save({ session });
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } }, { session });
      }

      cart.items = [];
      await cart.save({ session });
      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({ success: true, order: createdOrder });
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { email: req.user.email }],
  });
  if (!order && req.user.role !== 'admin') throw new AppError('Order not found', 404);
  const found = order || (req.user.role === 'admin' ? await Order.findById(req.params.id) : null);
  if (!found) throw new AppError('Order not found', 404);
  res.json({ success: true, order: found });
});

exports.trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    email: String(req.query.email || '').toLowerCase(),
  });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, order });
});

exports.requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'Delivered') throw new AppError('Returns can be requested after delivery', 400);
  const items = req.body.items?.length ? req.body.items : order.items.map((item) => ({
    product: item.product,
    sku: item.sku,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  }));
  if (!req.body.reason || !items.length) throw new AppError('Return reason and items are required', 400);
  const existing = await Return.findOne({ order: order._id, status: { $in: ['requested', 'approved', 'received'] } });
  if (existing) throw new AppError('A return request already exists for this order', 409);
  const returnRequest = await Return.create({ order: order._id, user: req.user._id, items, reason: req.body.reason, description: req.body.description });
  order.returnRequest = { requested: true, reason: req.body.reason, status: 'requested' };
  order.timeline.push({ status: order.status, note: 'Return requested' });
  await order.save();
  res.status(201).json({ success: true, returnRequest, order });
});

exports.myReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('order', 'orderNumber status total');
  res.json({ success: true, returns });
});

exports.adminListReturns = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const returns = await Return.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email')
    .populate('order', 'orderNumber status total');
  res.json({ success: true, returns });
});

exports.adminUpdateReturn = asyncHandler(async (req, res) => {
  const returnRequest = await Return.findById(req.params.id).populate('order');
  if (!returnRequest) throw new AppError('Return request not found', 404);
  const allowed = ['approved', 'rejected', 'received', 'refunded', 'cancelled'];
  if (!allowed.includes(req.body.status)) throw new AppError('Invalid return status', 400);
  returnRequest.status = req.body.status;
  returnRequest.adminNote = req.body.adminNote;
  if (req.body.refundAmount !== undefined) returnRequest.refundAmount = Number(req.body.refundAmount);
  await returnRequest.save();
  if (['approved', 'rejected', 'received', 'refunded'].includes(req.body.status)) {
    const order = returnRequest.order;
    order.returnRequest.status = req.body.status === 'rejected' ? 'rejected' : 'approved';
    if (req.body.status === 'refunded') {
      order.status = 'Returned';
      order.payment.status = 'refunded';
      order.timeline.push({ status: 'Returned', note: 'Return refunded' });
      await restoreForOrder(order);
    }
    await order.save();
  }
  res.json({ success: true, returnRequest });
});

exports.adminListOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    filter.$or = [
      { orderNumber: new RegExp(req.query.q, 'i') },
      { email: new RegExp(req.query.q, 'i') },
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'firstName lastName email');
  res.json({ success: true, orders });
});

exports.adminUpdateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  const { status, trackingNumber, carrier, refund } = req.body;
  if (status && status !== order.status) {
    order.status = status;
    order.timeline.push({ status, note: req.body.note || `Status updated to ${status}` });
    if (status === 'Cancelled' || status === 'Returned') {
      await restoreForOrder(order);
    }
  }
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  if (refund) {
    order.payment.status = 'refunded';
    order.timeline.push({ status: order.status, note: 'Refund recorded' });
  }
  if (req.body.returnStatus) {
    order.returnRequest.status = req.body.returnStatus;
    if (req.body.returnStatus === 'approved') {
      order.status = 'Returned';
      await restoreForOrder(order);
    }
  }
  await order.save();
  res.json({ success: true, order });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const cart = req.user
    ? await Cart.findOne({ user: req.user._id }).populate('items.product')
    : await Cart.findOne({ guestId: req.headers['x-guest-id'] }).populate('items.product');
  if (!cart?.items?.length) throw new AppError('Cart is empty', 400);
  const items = cart.items.map((i) => ({ quantity: i.quantity, productDoc: i.product, product: i.product }));
  const subtotal = items.reduce((s, i) => s + unitPrice(i.product) * i.quantity, 0);
  const { discount, coupon } = await applyCoupon(req.body.code, items, subtotal);
  res.json({ success: true, discount, code: coupon.code, type: coupon.type, value: coupon.value });
});
