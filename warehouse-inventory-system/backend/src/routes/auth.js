const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/users', authenticateToken, requireRole('admin', 'warehouse_manager'), authController.getUsers);

module.exports = router;
