const express = require('express');
const order = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/shipping-methods', order.shippingMethods);
router.post('/validate-coupon', optionalAuth, order.validateCoupon);
router.get('/track/:orderNumber', order.trackOrder);
router.post('/', optionalAuth, order.createOrder);
router.get('/mine', protect, order.myOrders);
router.get('/returns', protect, order.myReturns);
router.get('/:id', protect, order.getOrder);
router.post('/:id/return', protect, order.requestReturn);

module.exports = router;
