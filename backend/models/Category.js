const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'all'], default: 'all' },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
