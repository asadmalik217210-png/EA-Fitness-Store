const express = require('express');
const product = require('../controllers/productController');

const router = express.Router();
router.get('/', product.listCategories);

module.exports = router;
