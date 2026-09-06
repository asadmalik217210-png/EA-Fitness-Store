const express = require('express');
const review = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/product/:productId', review.listForProduct);
router.post('/', protect, review.createReview);

module.exports = router;
