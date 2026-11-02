const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, productController.getProducts);
router.get('/categories', authenticateToken, productController.getCategories);
router.post('/categories', authenticateToken, requireRole('admin', 'warehouse_manager'), productController.createCategory);
router.get('/:id', authenticateToken, productController.getProductById);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager'), productController.createProduct);
router.put('/:id', authenticateToken, requireRole('admin', 'warehouse_manager'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('admin'), productController.deleteProduct);

module.exports = router;
