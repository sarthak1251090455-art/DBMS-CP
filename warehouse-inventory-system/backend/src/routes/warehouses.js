const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, warehouseController.getWarehouses);
router.get('/:id', authenticateToken, warehouseController.getWarehouseById);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager'), warehouseController.createWarehouse);
router.put('/:id', authenticateToken, requireRole('admin', 'warehouse_manager'), warehouseController.updateWarehouse);

router.get('/:warehouseId/locations', authenticateToken, warehouseController.getStorageLocations);
router.post('/:warehouseId/locations', authenticateToken, requireRole('admin', 'warehouse_manager'), warehouseController.createStorageLocation);

module.exports = router;
