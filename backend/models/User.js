const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    firstName: String,
    lastName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'United States' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: String,
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    avatar: String,
    addresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    addresses: this.addresses,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
