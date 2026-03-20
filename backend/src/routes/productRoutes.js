const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

// Public
router.get('/public', productController.getAllProducts);
router.get('/public/:id', productController.getProductById);

// Admin
router.get('/', requireAuth, isAdmin, productController.getAllProducts);
router.get('/:id', requireAuth, isAdmin, productController.getProductById);
router.post('/', requireAuth, isAdmin, productController.createProduct);
router.put('/:id', requireAuth, isAdmin, productController.updateProduct);
router.delete('/:id', requireAuth, isAdmin, productController.deleteProduct);

module.exports = router;
