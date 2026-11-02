const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, salesOrderController.getSalesOrders);
router.get('/:id', authenticateToken, salesOrderController.getSalesOrderById);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager', 'sales_rep'), salesOrderController.createSalesOrder);
router.post('/:id/dispatch', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), salesOrderController.dispatchSalesOrder);
router.post('/:id/cancel', authenticateToken, requireRole('admin', 'warehouse_manager', 'sales_rep'), salesOrderController.cancelSalesOrder);

module.exports = router;
