const { query, executeTransaction } = require('../config/db');

async function getSalesOrders(req, res, next) {
  try {
    const { status, customer_id, warehouse_id } = req.query;
    let sql = `
      SELECT 
        so.sales_order_id,
        so.so_number,
        so.customer_id,
        c.customer_name,
        so.warehouse_id,
        w.warehouse_name,
        so.created_by,
        u.name AS created_by_name,
        so.order_date,
        so.status,
        so.total_amount,
        so.created_at,
        COUNT(soi.sales_item_id) AS total_items
      FROM sales_orders so
      JOIN customers c ON so.customer_id = c.customer_id
      JOIN warehouses w ON so.warehouse_id = w.warehouse_id
      JOIN users u ON so.created_by = u.user_id
      LEFT JOIN sales_order_items soi ON so.sales_order_id = soi.sales_order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND so.status = ?';
      params.push(status);
    }
    if (customer_id) {
      sql += ' AND so.customer_id = ?';
      params.push(customer_id);
    }
    if (warehouse_id) {
      sql += ' AND so.warehouse_id = ?';
      params.push(warehouse_id);
    }

    sql += ' GROUP BY so.sales_order_id ORDER BY so.order_date DESC, so.sales_order_id DESC';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, sales_orders: rows });
  } catch (error) {
    next(error);
  }
}

async function getSalesOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const [orders] = await query(
      `SELECT 
         so.*,
         c.customer_name,
         c.email AS customer_email,
         c.phone AS customer_phone,
         c.address AS customer_address,
         w.warehouse_name,
         u.name AS created_by_name
       FROM sales_orders so
       JOIN customers c ON so.customer_id = c.customer_id
       JOIN warehouses w ON so.warehouse_id = w.warehouse_id
       JOIN users u ON so.created_by = u.user_id
       WHERE so.sales_order_id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales order not found.' });
    }

    const [items] = await query(
      `SELECT 
         soi.*,
         p.sku,
         p.product_name,
         p.unit_of_measure,
         COALESCE(inv.quantity_available, 0) AS current_warehouse_stock
       FROM sales_order_items soi
       JOIN products p ON soi.product_id = p.product_id
       LEFT JOIN inventory inv ON (p.product_id = inv.product_id AND inv.warehouse_id = ?)
       WHERE soi.sales_order_id = ?`,
      [orders[0].warehouse_id, id]
    );

    res.json({ success: true, sales_order: orders[0], items });
  } catch (error) {
    next(error);
  }
}

async function createSalesOrder(req, res, next) {
  try {
    const { customer_id, warehouse_id, order_date, items } = req.body;

    if (!customer_id || !warehouse_id || !order_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer, warehouse, order date, and items are required.'
      });
    }

    // ACID Transaction for Sales Order creation
    const result = await executeTransaction(async (conn) => {
      const soNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let totalAmount = 0;
      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        const price = parseFloat(item.unit_price);
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
          throw new Error('Invalid item quantity or price.');
        }
        totalAmount += qty * price;
      }

      const [orderRes] = await conn.query(
        `INSERT INTO sales_orders 
         (so_number, customer_id, warehouse_id, created_by, order_date, status, total_amount)
         VALUES (?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
        [soNumber, customer_id, warehouse_id, req.user.user_id, order_date, totalAmount]
      );

      const soId = orderRes.insertId;

      for (const item of items) {
        const subtotal = item.quantity * item.unit_price;
        await conn.query(
          `INSERT INTO sales_order_items 
           (sales_order_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [soId, item.product_id, item.quantity, item.unit_price, subtotal]
        );
      }

      await conn.query(
        'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'CREATE_SO', 'sales_orders', soId, `Created Sales Order ${soNumber} ($${totalAmount.toFixed(2)})`]
      );

      return { soId, soNumber, totalAmount };
    });

    res.status(201).json({
      success: true,
      message: 'Sales order created successfully with transaction.',
      salesOrder: result
    });
  } catch (error) {
    next(error);
  }
}

async function dispatchSalesOrder(req, res, next) {
  try {
    const { id } = req.params;

    // Call MySQL Stored Procedure: sp_dispatch_sales_order
    await query('CALL sp_dispatch_sales_order(?, ?)', [id, req.user.user_id]);

    res.json({
      success: true,
      message: 'Sales order dispatched and stock deducted via stored procedure sp_dispatch_sales_order.'
    });
  } catch (error) {
    next(error);
  }
}

async function cancelSalesOrder(req, res, next) {
  try {
    const { id } = req.params;
    const [so] = await query('SELECT status FROM sales_orders WHERE sales_order_id = ?', [id]);
    if (so.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales order not found.' });
    }
    if (so[0].status === 'DISPATCHED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already dispatched order.' });
    }

    await query('UPDATE sales_orders SET status = "CANCELLED" WHERE sales_order_id = ?', [id]);
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CANCEL_SO', 'sales_orders', id, `Cancelled Sales Order #${id}`]
    );

    res.json({ success: true, message: 'Sales order cancelled successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  dispatchSalesOrder,
  cancelSalesOrder
};
