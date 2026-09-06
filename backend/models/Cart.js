const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: String,
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ guestId: 1 });

module.exports = mongoose.model('Cart', cartSchema);
