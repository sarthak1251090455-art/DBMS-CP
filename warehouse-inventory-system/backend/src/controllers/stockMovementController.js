const { query } = require('../config/db');

async function getStockMovements(req, res, next) {
  try {
    const { warehouse_id, product_id, movement_type, start_date, end_date } = req.query;
    let sql = `
      SELECT 
        sm.movement_id,
        sm.product_id,
        p.sku,
        p.product_name,
        sm.warehouse_id,
        w.warehouse_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.performed_by,
        u.name AS performed_by_name,
        sm.movement_date,
        sm.remarks
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
      JOIN users u ON sm.performed_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (warehouse_id) {
      sql += ' AND sm.warehouse_id = ?';
      params.push(warehouse_id);
    }
    if (product_id) {
      sql += ' AND sm.product_id = ?';
      params.push(product_id);
    }
    if (movement_type) {
      sql += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }
    if (start_date) {
      sql += ' AND sm.movement_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND sm.movement_date <= ?';
      params.push(end_date + ' 23:59:59');
    }

    sql += ' ORDER BY sm.movement_date DESC, sm.movement_id DESC LIMIT 200';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, movements: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStockMovements
};
