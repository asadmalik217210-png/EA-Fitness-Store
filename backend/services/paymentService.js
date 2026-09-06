const crypto = require('crypto');
const Payment = require('../models/Payment');
const { AppError } = require('../utils/appError');

async function processPayment({ order, user, method = 'card', session }) {
  const mode = process.env.PAYMENT_MODE || 'mock';
  if (mode === 'mock' || method === 'cod') {
    const transactionId = `MOCK-${crypto.randomBytes(8).toString('hex')}`;
    const [payment] = await Payment.create([{
      order: order._id,
      user: user?._id,
      amount: order.total,
      method,
      status: method === 'cod' ? 'pending' : 'paid',
      provider: 'mock',
      transactionId,
    }], { session });
    return {
      status: payment.status,
      provider: 'mock',
      transactionId,
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Payment gateway is not configured', 503);
  }
  throw new AppError('Live payment gateway is not enabled yet. Set PAYMENT_MODE=mock.', 503);
}

module.exports = { processPayment };
