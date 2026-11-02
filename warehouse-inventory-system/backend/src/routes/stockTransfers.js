const express = require('express');
const router = express.Router();
const stockTransferController = require('../controllers/stockTransferController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, stockTransferController.getTransfers);
router.get('/:id', authenticateToken, stockTransferController.getTransferById);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), stockTransferController.createTransfer);
router.post('/:id/complete', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), stockTransferController.completeTransfer);
router.post('/:id/cancel', authenticateToken, requireRole('admin', 'warehouse_manager'), stockTransferController.cancelTransfer);

module.exports = router;
