const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'This user account is inactive.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'supersecretjwtkey_warehouse_inventory_management_system_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [user.user_id, 'USER_LOGIN', 'users', user.user_id, `User ${user.email} logged in successfully.`]
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const [rows] = await query(
      'SELECT user_id, name, email, role, created_at, status FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const [rows] = await query(
      'SELECT user_id, name, email, role, created_at, status FROM users ORDER BY name ASC'
    );
    res.json({ success: true, users: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile,
  getUsers
};
