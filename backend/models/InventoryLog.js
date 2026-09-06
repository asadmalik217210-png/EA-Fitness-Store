const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: String,
    size: String,
    color: String,
    change: { type: Number, required: true },
    reason: {
      type: String,
      enum: ['adjustment', 'order', 'cancel', 'return', 'restock', 'seed'],
      default: 'adjustment',
    },
    note: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    resultingStock: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
