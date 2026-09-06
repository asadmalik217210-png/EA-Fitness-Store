const express = require('express');
const admin = require('../controllers/adminController');
const product = require('../controllers/productController');
const category = require('../controllers/categoryController');
const coupon = require('../controllers/couponController');
const order = require('../controllers/orderController');
const review = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/overview', admin.overview);
router.get('/products', product.adminListProducts);
router.get('/products/:id', product.adminGetProduct);
router.post('/products', upload.array('images', 8), product.createProduct);
router.patch('/products/:id', upload.array('images', 8), product.updateProduct);
router.delete('/products/:id', product.deleteProduct);

router.post('/categories', category.create);
router.patch('/categories/:id', category.update);
router.delete('/categories/:id', category.remove);

router.get('/inventory', admin.inventory);
router.post('/inventory/adjust', admin.adjustStock);
router.get('/inventory/history', admin.stockHistory);

router.get('/orders', order.adminListOrders);
router.patch('/orders/:id', order.adminUpdateOrder);
router.get('/returns', order.adminListReturns);
router.patch('/returns/:id', order.adminUpdateReturn);

router.get('/customers', admin.customers);
router.get('/customers/:id', admin.customerDetail);
router.patch('/customers/:id', admin.setCustomerStatus);

router.get('/reviews', review.adminListReviews);
router.patch('/reviews/:id', review.moderateReview);
router.delete('/reviews/:id', review.deleteReview);

router.get('/coupons', coupon.list);
router.post('/coupons', coupon.create);
router.patch('/coupons/:id', coupon.update);
router.delete('/coupons/:id', coupon.remove);

router.get('/payments', admin.payments);
router.get('/admins', admin.admins);
router.post('/admins', admin.createAdmin);
router.get('/settings', admin.getSettings);
router.patch('/settings', admin.updateSettings);

module.exports = router;
