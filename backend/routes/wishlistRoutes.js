const express = require('express');
const wishlist = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/', wishlist.getWishlist);
router.post('/toggle', wishlist.toggleWishlist);

module.exports = router;
