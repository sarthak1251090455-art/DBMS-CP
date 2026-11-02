const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, purchaseOrderController.getPurchaseOrders);
router.get('/:id', authenticateToken, purchaseOrderController.getPurchaseOrderById);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), purchaseOrderController.createPurchaseOrder);
router.post('/:id/receive', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), purchaseOrderController.receivePurchaseOrder);
router.post('/:id/cancel', authenticateToken, requireRole('admin', 'warehouse_manager'), purchaseOrderController.cancelPurchaseOrder);

module.exports = router;
