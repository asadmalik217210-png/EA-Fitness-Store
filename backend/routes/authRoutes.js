const express = require('express');
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password/:token', auth.resetPassword);
router.get('/me', protect, auth.me);
router.patch('/me', protect, auth.updateMe);
router.get('/addresses', protect, auth.listAddresses);
router.post('/addresses', protect, auth.addAddress);
router.patch('/addresses/:addressId', protect, auth.updateAddress);
router.delete('/addresses/:addressId', protect, auth.deleteAddress);
router.patch('/addresses/:addressId/default', protect, auth.setDefaultAddress);

module.exports = router;
