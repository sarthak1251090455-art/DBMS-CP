const { query, executeTransaction } = require('../config/db');

async function getPurchaseOrders(req, res, next) {
  try {
    const { status, supplier_id, warehouse_id } = req.query;
    let sql = `
      SELECT 
        po.purchase_order_id,
        po.po_number,
        po.supplier_id,
        s.supplier_name,
        po.warehouse_id,
        w.warehouse_name,
        po.created_by,
        u.name AS created_by_name,
        po.order_date,
        po.expected_date,
        po.status,
        po.total_amount,
        po.created_at,
        COUNT(poi.purchase_item_id) AS total_items
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.supplier_id
      JOIN warehouses w ON po.warehouse_id = w.warehouse_id
      JOIN users u ON po.created_by = u.user_id
      LEFT JOIN purchase_order_items poi ON po.purchase_order_id = poi.purchase_order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND po.status = ?';
      params.push(status);
    }
    if (supplier_id) {
      sql += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }
    if (warehouse_id) {
      sql += ' AND po.warehouse_id = ?';
      params.push(warehouse_id);
    }

    sql += ' GROUP BY po.purchase_order_id ORDER BY po.order_date DESC, po.purchase_order_id DESC';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, purchase_orders: rows });
  } catch (error) {
    next(error);
  }
}

async function getPurchaseOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const [orders] = await query(
      `SELECT 
         po.*,
         s.supplier_name,
         s.contact_person,
         s.email AS supplier_email,
         s.phone AS supplier_phone,
         w.warehouse_name,
         w.location AS warehouse_location,
         u.name AS created_by_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.supplier_id
       JOIN warehouses w ON po.warehouse_id = w.warehouse_id
       JOIN users u ON po.created_by = u.user_id
       WHERE po.purchase_order_id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const [items] = await query(
      `SELECT 
         poi.*,
         p.sku,
         p.product_name,
         p.unit_of_measure
       FROM purchase_order_items poi
       JOIN products p ON poi.product_id = p.product_id
       WHERE poi.purchase_order_id = ?`,
      [id]
    );

    res.json({ success: true, purchase_order: orders[0], items });
  } catch (error) {
    next(error);
  }
}

async function createPurchaseOrder(req, res, next) {
  try {
    const { supplier_id, warehouse_id, order_date, expected_date, items } = req.body;

    if (!supplier_id || !warehouse_id || !order_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier, warehouse, order date, and at least one order item are required.'
      });
    }

    // Execute with database transaction
    const result = await executeTransaction(async (conn) => {
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate total
      let totalAmount = 0;
      for (const item of items) {
        const qty = parseInt(item.quantity_ordered, 10);
        const cost = parseFloat(item.unit_cost);
        if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost < 0) {
          throw new Error('Invalid item quantity or unit cost.');
        }
        totalAmount += qty * cost;
      }

      const [orderRes] = await conn.query(
        `INSERT INTO purchase_orders 
         (po_number, supplier_id, warehouse_id, created_by, order_date, expected_date, status, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, 'ORDERED', ?)`,
        [poNumber, supplier_id, warehouse_id, req.user.user_id, order_date, expected_date || null, totalAmount]
      );

      const poId = orderRes.insertId;

      for (const item of items) {
        const subtotal = item.quantity_ordered * item.unit_cost;
        await conn.query(
          `INSERT INTO purchase_order_items 
           (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, subtotal)
           VALUES (?, ?, ?, 0, ?, ?)`,
          [poId, item.product_id, item.quantity_ordered, item.unit_cost, subtotal]
        );
      }

      await conn.query(
        'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'CREATE_PO', 'purchase_orders', poId, `Created Purchase Order ${poNumber} ($${totalAmount.toFixed(2)})`]
      );

      return { poId, poNumber, totalAmount };
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully with transaction.',
      purchaseOrder: result
    });
  } catch (error) {
    next(error);
  }
}

async function receivePurchaseOrder(req, res, next) {
  try {
    const { id } = req.params;

    // Call MySQL Stored Procedure: sp_receive_purchase_order
    await query('CALL sp_receive_purchase_order(?, ?)', [id, req.user.user_id]);

    res.json({
      success: true,
      message: 'Purchase order received and inventory updated via stored procedure sp_receive_purchase_order.'
    });
  } catch (error) {
    next(error);
  }
}

async function cancelPurchaseOrder(req, res, next) {
  try {
    const { id } = req.params;
    const [po] = await query('SELECT status FROM purchase_orders WHERE purchase_order_id = ?', [id]);
    if (po.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }
    if (po[0].status === 'RECEIVED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already received purchase order.' });
    }

    await query('UPDATE purchase_orders SET status = "CANCELLED" WHERE purchase_order_id = ?', [id]);
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CANCEL_PO', 'purchase_orders', id, `Cancelled Purchase Order #${id}`]
    );

    res.json({ success: true, message: 'Purchase order cancelled successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder
};
