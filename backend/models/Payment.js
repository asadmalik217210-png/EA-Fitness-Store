const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    method: String,
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    provider: { type: String, default: 'mock' },
    transactionId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
