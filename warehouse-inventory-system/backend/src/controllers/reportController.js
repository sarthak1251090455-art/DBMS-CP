const { query } = require('../config/db');

async function getDashboardSummary(req, res, next) {
  try {
    const [prodCount] = await query('SELECT COUNT(*) AS total FROM products WHERE status = "active"');
    const [whCount] = await query('SELECT COUNT(*) AS total FROM warehouses');
    const [valRes] = await query(`
      SELECT 
        COALESCE(SUM(i.quantity_available * p.unit_price), 0) AS total_valuation,
        COALESCE(SUM(i.quantity_available), 0) AS total_units_available,
        COALESCE(SUM(i.quantity_reserved), 0) AS total_units_reserved
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
    `);
    const [lowStock] = await query('SELECT COUNT(*) AS total FROM view_low_stock_alerts');
    const [pendingPO] = await query('SELECT COUNT(*) AS total FROM purchase_orders WHERE status IN ("PENDING", "ORDERED")');
    const [activeSO] = await query('SELECT COUNT(*) AS total FROM sales_orders WHERE status IN ("PENDING", "CONFIRMED")');

    res.json({
      success: true,
      metrics: {
        totalProducts: prodCount[0].total,
        totalWarehouses: whCount[0].total,
        totalInventoryValuation: parseFloat(valRes[0].total_valuation),
        totalUnitsAvailable: parseInt(valRes[0].total_units_available, 10),
        totalUnitsReserved: parseInt(valRes[0].total_units_reserved, 10),
        lowStockAlertsCount: lowStock[0].total,
        pendingPurchaseOrders: pendingPO[0].total,
        activeSalesOrders: activeSO[0].total
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCategoryValuation(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        c.category_name,
        COUNT(DISTINCT p.product_id) AS product_count,
        COALESCE(SUM(i.quantity_available), 0) AS total_quantity,
        COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_valuation
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      GROUP BY c.category_id, c.category_name
      ORDER BY total_valuation DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getWarehouseStockDistribution(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        w.warehouse_id,
        w.warehouse_name,
        COALESCE(SUM(i.quantity_available), 0) AS total_stock,
        COALESCE(SUM(i.quantity_reserved), 0) AS reserved_stock,
        COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS valuation
      FROM warehouses w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      LEFT JOIN products p ON i.product_id = p.product_id
      GROUP BY w.warehouse_id, w.warehouse_name
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getMovementTrends(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        DATE(movement_date) AS date,
        SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) AS inbound_qty,
        SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) AS outbound_qty,
        SUM(CASE WHEN movement_type IN ('TRANSFER_IN', 'TRANSFER_OUT') THEN quantity ELSE 0 END) AS transfer_qty
      FROM stock_movements
      WHERE movement_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(movement_date)
      ORDER BY date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getTopSellingProducts(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        p.product_id,
        p.sku,
        p.product_name,
        c.category_name,
        COALESCE(SUM(soi.quantity), 0) AS total_dispatched_units,
        COALESCE(SUM(soi.subtotal), 0) AS total_sales_revenue
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN sales_order_items soi ON p.product_id = soi.product_id
      LEFT JOIN sales_orders so ON soi.sales_order_id = so.sales_order_id AND so.status = 'DISPATCHED'
      GROUP BY p.product_id, p.sku, p.product_name, c.category_name
      ORDER BY total_sales_revenue DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
  getCategoryValuation,
  getWarehouseStockDistribution,
  getMovementTrends,
  getTopSellingProducts
};
