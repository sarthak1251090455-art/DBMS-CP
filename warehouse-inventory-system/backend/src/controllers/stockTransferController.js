const { query, executeTransaction } = require('../config/db');

async function getTransfers(req, res, next) {
  try {
    const { status, source_warehouse_id, destination_warehouse_id } = req.query;
    let sql = `
      SELECT 
        st.transfer_id,
        st.transfer_number,
        st.source_warehouse_id,
        sw.warehouse_name AS source_warehouse_name,
        st.destination_warehouse_id,
        dw.warehouse_name AS destination_warehouse_name,
        st.transfer_date,
        st.status,
        st.created_by,
        u.name AS created_by_name,
        st.remarks,
        COUNT(sti.transfer_item_id) AS total_items
      FROM stock_transfers st
      JOIN warehouses sw ON st.source_warehouse_id = sw.warehouse_id
      JOIN warehouses dw ON st.destination_warehouse_id = dw.warehouse_id
      JOIN users u ON st.created_by = u.user_id
      LEFT JOIN stock_transfer_items sti ON st.transfer_id = sti.transfer_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND st.status = ?';
      params.push(status);
    }
    if (source_warehouse_id) {
      sql += ' AND st.source_warehouse_id = ?';
      params.push(source_warehouse_id);
    }
    if (destination_warehouse_id) {
      sql += ' AND st.destination_warehouse_id = ?';
      params.push(destination_warehouse_id);
    }

    sql += ' GROUP BY st.transfer_id ORDER BY st.transfer_date DESC, st.transfer_id DESC';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, transfers: rows });
  } catch (error) {
    next(error);
  }
}

async function getTransferById(req, res, next) {
  try {
    const { id } = req.params;
    const [transfers] = await query(
      `SELECT 
         st.*,
         sw.warehouse_name AS source_warehouse_name,
         sw.location AS source_location,
         dw.warehouse_name AS destination_warehouse_name,
         dw.location AS destination_location,
         u.name AS created_by_name
       FROM stock_transfers st
       JOIN warehouses sw ON st.source_warehouse_id = sw.warehouse_id
       JOIN warehouses dw ON st.destination_warehouse_id = dw.warehouse_id
       JOIN users u ON st.created_by = u.user_id
       WHERE st.transfer_id = ?`,
      [id]
    );

    if (transfers.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock transfer not found.' });
    }

    const [items] = await query(
      `SELECT 
         sti.*,
         p.sku,
         p.product_name,
         p.unit_of_measure,
         COALESCE(inv.quantity_available, 0) AS source_stock_available
       FROM stock_transfer_items sti
       JOIN products p ON sti.product_id = p.product_id
       LEFT JOIN inventory inv ON (p.product_id = inv.product_id AND inv.warehouse_id = ?)
       WHERE sti.transfer_id = ?`,
      [transfers[0].source_warehouse_id, id]
    );

    res.json({ success: true, transfer: transfers[0], items });
  } catch (error) {
    next(error);
  }
}

async function createTransfer(req, res, next) {
  try {
    const { source_warehouse_id, destination_warehouse_id, remarks, items } = req.body;

    if (!source_warehouse_id || !destination_warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Source warehouse, destination warehouse, and at least one item are required.'
      });
    }

    if (source_warehouse_id === destination_warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination warehouses cannot be identical.'
      });
    }

    const result = await executeTransaction(async (conn) => {
      const transferNumber = `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const [trRes] = await conn.query(
        `INSERT INTO stock_transfers 
         (transfer_number, source_warehouse_id, destination_warehouse_id, status, created_by, remarks)
         VALUES (?, ?, ?, 'PENDING', ?, ?)`,
        [transferNumber, source_warehouse_id, destination_warehouse_id, req.user.user_id, remarks || null]
      );

      const transferId = trRes.insertId;

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          throw new Error('Transfer quantity must be positive.');
        }

        // Check availability at source
        const [inv] = await conn.query(
          'SELECT quantity_available FROM inventory WHERE product_id = ? AND warehouse_id = ?',
          [item.product_id, source_warehouse_id]
        );

        if (inv.length === 0 || inv[0].quantity_available < qty) {
          throw new Error(`Insufficient source stock for product ID ${item.product_id}`);
        }

        await conn.query(
          'INSERT INTO stock_transfer_items (transfer_id, product_id, quantity) VALUES (?, ?, ?)',
          [transferId, item.product_id, qty]
        );
      }

      await conn.query(
        'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, 'CREATE_TRANSFER', 'stock_transfers', transferId, `Created Transfer ${transferNumber}`]
      );

      return { transferId, transferNumber };
    });

    res.status(201).json({
      success: true,
      message: 'Stock transfer initiated successfully.',
      transfer: result
    });
  } catch (error) {
    next(error);
  }
}

async function completeTransfer(req, res, next) {
  try {
    const { id } = req.params;

    // Call MySQL Stored Procedure: sp_execute_stock_transfer
    await query('CALL sp_execute_stock_transfer(?, ?)', [id, req.user.user_id]);

    res.json({
      success: true,
      message: 'Stock transfer executed successfully via stored procedure sp_execute_stock_transfer.'
    });
  } catch (error) {
    next(error);
  }
}

async function cancelTransfer(req, res, next) {
  try {
    const { id } = req.params;
    const [tr] = await query('SELECT status FROM stock_transfers WHERE transfer_id = ?', [id]);
    if (tr.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock transfer not found.' });
    }
    if (tr[0].status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed stock transfer.' });
    }

    await query('UPDATE stock_transfers SET status = "CANCELLED" WHERE transfer_id = ?', [id]);
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CANCEL_TRANSFER', 'stock_transfers', id, `Cancelled Transfer #${id}`]
    );

    res.json({ success: true, message: 'Stock transfer cancelled successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  completeTransfer,
  cancelTransfer
};
