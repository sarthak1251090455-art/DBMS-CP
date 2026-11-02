const express = require('express');
const router = express.Router();
const controller = require('../controllers/stockMovementController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getStockMovements);

module.exports = router;
