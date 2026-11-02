const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, inventoryController.getInventorySummary);
router.get('/alerts/low-stock', authenticateToken, inventoryController.getLowStockAlerts);
router.post('/adjust', authenticateToken, requireRole('admin', 'warehouse_manager', 'inventory_clerk'), inventoryController.adjustInventoryStock);

module.exports = router;
