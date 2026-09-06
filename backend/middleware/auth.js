const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/appError');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(process.env.COOKIE_NAME || 'ea_token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(process.env.COOKIE_NAME || 'ea_token');
}

function getToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[process.env.COOKIE_NAME || 'ea_token'];
}

async function protect(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) throw new AppError('Please log in to continue', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new AppError('Account is not available', 401);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user?.isActive) req.user = user;
  } catch {
    /* guest */
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, protect, optionalAuth, adminOnly };
