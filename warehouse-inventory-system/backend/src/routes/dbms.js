const express = require('express');
const router = express.Router();
const dbmsController = require('../controllers/dbmsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/tables', authenticateToken, dbmsController.getTableStats);
router.get('/tables/:tableName/schema', authenticateToken, dbmsController.getTableSchema);
router.get('/foreign-keys', authenticateToken, dbmsController.getForeignKeys);
router.get('/procedures', authenticateToken, dbmsController.getStoredProcedures);
router.get('/views', authenticateToken, dbmsController.getViews);
router.get('/query-logs', authenticateToken, dbmsController.getQueryLog);
router.post('/explain', authenticateToken, dbmsController.explainQuery);

module.exports = router;
