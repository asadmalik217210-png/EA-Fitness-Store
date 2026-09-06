const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: String,
    size: String,
    color: String,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [returnItemSchema], required: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'received', 'refunded', 'cancelled'],
      default: 'requested',
    },
    refundAmount: { type: Number, min: 0, default: 0 },
    adminNote: String,
  },
  { timestamps: true }
);

returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ order: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Return', returnSchema);
