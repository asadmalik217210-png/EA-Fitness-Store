const express = require('express');
const cart = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.use(optionalAuth);
router.get('/', cart.getCart);
router.post('/items', cart.addItem);
router.patch('/items/:itemId', cart.updateItem);
router.delete('/items/:itemId', cart.removeItem);
router.delete('/', cart.clearCart);

module.exports = router;
