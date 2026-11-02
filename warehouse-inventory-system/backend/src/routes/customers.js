const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierCustomerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getCustomers);
router.post('/', authenticateToken, requireRole('admin', 'warehouse_manager', 'sales_rep'), controller.createCustomer);
router.put('/:id', authenticateToken, requireRole('admin', 'warehouse_manager', 'sales_rep'), controller.updateCustomer);
router.delete('/:id', authenticateToken, requireRole('admin'), controller.deleteCustomer);

module.exports = router;
