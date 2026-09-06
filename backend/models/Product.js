const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, default: '#111111' },
    sku: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categorySlug: { type: String, required: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
    sku: { type: String, required: true, unique: true },
    brand: { type: String, default: 'EA Fitness Clothing' },
    images: [{ type: String, required: true }],
    videoUrl: String,
    variants: [variantSchema],
    material: String,
    careInstructions: String,
    shippingInfo: {
      type: String,
      default: 'Ships within 1–3 business days. Free shipping on orders over $100.',
    },
    returnsInfo: {
      type: String,
      default: 'Free returns within 30 days on unworn items with tags attached.',
    },
    tags: [String],
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 8 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });
productSchema.index({ gender: 1, categorySlug: 1, isActive: 1 });
productSchema.index({ price: 1 });

productSchema.virtual('totalStock').get(function totalStock() {
  return (this.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
