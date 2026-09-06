const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    expiresAt: Date,
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categorySlugs: [String],
    gender: { type: String, enum: ['men', 'women', 'all'], default: 'all' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
