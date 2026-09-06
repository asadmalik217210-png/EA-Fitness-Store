const express = require('express');
const product = require('../controllers/productController');

const router = express.Router();
router.get('/', product.listProducts);
router.get('/search', product.searchSuggest);
router.get('/categories', product.listCategories);
router.get('/slug/:slug/related', product.relatedProducts);
router.get('/slug/:slug', product.getProduct);

module.exports = router;
