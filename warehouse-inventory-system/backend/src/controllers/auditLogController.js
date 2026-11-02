const { query } = require('../config/db');

async function getAuditLogs(req, res, next) {
  try {
    const { entity_name, action, user_id, limit = 100 } = req.query;
    let sql = `
      SELECT 
        al.log_id,
        al.user_id,
        COALESCE(u.name, 'System') AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        al.action,
        al.entity_name,
        al.entity_id,
        al.timestamp,
        al.details
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (entity_name) {
      sql += ' AND al.entity_name = ?';
      params.push(entity_name);
    }
    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }
    if (user_id) {
      sql += ' AND al.user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY al.timestamp DESC, al.log_id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, audit_logs: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs
};
