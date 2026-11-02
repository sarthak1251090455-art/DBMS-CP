const { query } = require('../config/db');

async function getInventorySummary(req, res, next) {
  try {
    const { warehouse_id, category_id, stock_status, search } = req.query;
    let sql = 'SELECT * FROM view_inventory_summary WHERE 1=1';
    const params = [];

    if (warehouse_id) {
      sql += ' AND warehouse_id = ?';
      params.push(warehouse_id);
    }
    if (category_id) {
      sql += ' AND category_id = ?';
      params.push(category_id);
    }
    if (stock_status) {
      sql += ' AND stock_status = ?';
      params.push(stock_status);
    }
    if (search) {
      sql += ' AND (product_name LIKE ? OR sku LIKE ? OR warehouse_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY warehouse_name ASC, product_name ASC';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, inventory: rows });
  } catch (error) {
    next(error);
  }
}

async function getLowStockAlerts(req, res, next) {
  try {
    // Queries DBMS View: view_low_stock_alerts
    const [rows] = await query('SELECT * FROM view_low_stock_alerts ORDER BY deficit_quantity DESC');
    res.json({ success: true, count: rows.length, alerts: rows });
  } catch (error) {
    next(error);
  }
}

async function adjustInventoryStock(req, res, next) {
  try {
    const { product_id, warehouse_id, new_quantity, reason } = req.body;

    if (product_id === undefined || warehouse_id === undefined || new_quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product, warehouse, and new quantity are required.'
      });
    }

    if (new_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative.'
      });
    }

    // Call MySQL Stored Procedure: sp_adjust_inventory
    await query(
      'CALL sp_adjust_inventory(?, ?, ?, ?, ?)',
      [product_id, warehouse_id, new_quantity, reason || 'Physical inventory audit', req.user.user_id]
    );

    res.json({
      success: true,
      message: 'Inventory adjusted successfully via stored procedure sp_adjust_inventory.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventorySummary,
  getLowStockAlerts,
  adjustInventoryStock
};
