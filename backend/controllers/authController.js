const crypto = require('crypto');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const { signToken, setAuthCookie, clearAuthCookie } = require('../middleware/auth');

async function mergeGuestIntoUser(user, guestId) {
  if (!guestId || !user) return;
  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart?.items?.length) return;
  let userCart = await Cart.findOne({ user: user._id });
  if (!userCart) userCart = await Cart.create({ user: user._id, items: [] });
  for (const item of guestCart.items) {
    const existing = userCart.items.find(
      (i) => String(i.product) === String(item.product) && i.size === item.size && i.color === item.color
    );
    if (existing) existing.quantity += item.quantity;
    else userCart.items.push(item);
  }
  await userCart.save();
  await guestCart.deleteOne();
}

function sendAuth(res, user, status = 200) {
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.status(status).json({ success: true, token, user: user.toSafeJSON() });
}

exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, acceptedTerms } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new AppError('All fields are required', 400);
  }
  if (password !== confirmPassword) throw new AppError('Passwords do not match', 400);
  if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);
  if (!acceptedTerms) throw new AppError('Please accept the terms to continue', 400);
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError('An account with this email already exists', 409);
  const user = await User.create({ firstName, lastName, email, password });
  await mergeGuestIntoUser(user, req.body.guestId || req.headers['x-guest-id']);
  sendAuth(res, user, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('This account has been disabled', 403);
  await mergeGuestIntoUser(user, req.body.guestId || req.headers['x-guest-id']);
  sendAuth(res, user);
});

exports.logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }
  const raw = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const payload = { success: true, message: 'If that email exists, a reset link has been sent.' };
  if (process.env.NODE_ENV !== 'production') {
    payload.devResetToken = raw;
    payload.devResetUrl = `${process.env.CLIENT_URL}/reset-password/${raw}`;
    console.log('Password reset token:', raw);
  }
  res.json(payload);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user) throw new AppError('Reset token is invalid or expired', 400);
  if (!req.body.password || req.body.password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendAuth(res, user);
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = { ...req.body };
  if (address.isDefault) user.addresses.forEach((item) => { item.isDefault = false; });
  user.addresses.push(address);
  await user.save();
  res.status(201).json({ success: true, user: user.toSafeJSON() });
});

exports.listAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.json({ success: true, addresses: user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);
  if (req.body.isDefault) user.addresses.forEach((item) => { item.isDefault = false; });
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, address, user: user.toSafeJSON() });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);
  address.deleteOne();
  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);
  user.addresses.forEach((item) => { item.isDefault = String(item._id) === String(address._id); });
  await user.save();
  res.json({ success: true, address, user: user.toSafeJSON() });
});

