const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('admin', 'warehouse_manager'), auditLogController.getAuditLogs);

module.exports = router;
