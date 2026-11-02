const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.get('/dashboard-summary', authenticateToken, reportController.getDashboardSummary);
router.get('/category-valuation', authenticateToken, reportController.getCategoryValuation);
router.get('/warehouse-distribution', authenticateToken, reportController.getWarehouseStockDistribution);
router.get('/movement-trends', authenticateToken, reportController.getMovementTrends);
router.get('/top-products', authenticateToken, reportController.getTopSellingProducts);

module.exports = router;
