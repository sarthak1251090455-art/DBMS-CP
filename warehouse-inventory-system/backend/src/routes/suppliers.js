const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierCustomerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getSuppliers);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager'), controller.createSupplier);
router.put('/:id', authenticateToken, requireRole('admin', 'warehouse_manager'), controller.updateSupplier);
router.delete('/:id', authenticateToken, requireRole('admin'), controller.deleteSupplier);

module.exports = router;
