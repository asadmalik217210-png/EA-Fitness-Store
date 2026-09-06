const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  sku: String,
  size: String,
  color: String,
  quantity: Number,
  price: Number,
});

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    items: [orderItemSchema],
    shippingAddress: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    shippingMethod: {
      id: String,
      name: String,
      price: Number,
      eta: String,
    },
    payment: {
      method: { type: String, default: 'card' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      provider: { type: String, default: 'mock' },
      transactionId: String,
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    total: Number,
    couponCode: String,
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Pending',
    },
    trackingNumber: String,
    carrier: String,
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      status: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
    },
    inventoryRestored: { type: Boolean, default: false },
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
