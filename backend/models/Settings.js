const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'EA Fitness Clothing' },
    supportEmail: { type: String, default: 'support@eafitness.local' },
    freeShippingMin: { type: Number, default: 100 },
    currency: { type: String, default: 'USD' },
    maintenanceMode: { type: Boolean, default: false },
    announcement: { type: String, default: 'FREE SHIPPING ON ORDERS OVER $100' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
