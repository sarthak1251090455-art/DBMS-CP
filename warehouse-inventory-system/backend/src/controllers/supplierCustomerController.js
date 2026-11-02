const { query } = require('../config/db');

// Suppliers
async function getSuppliers(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        s.*,
        COUNT(po.purchase_order_id) AS total_orders,
        COALESCE(SUM(po.total_amount), 0) AS total_spent
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.supplier_id = po.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.supplier_name ASC
    `);
    res.json({ success: true, count: rows.length, suppliers: rows });
  } catch (error) {
    next(error);
  }
}

async function createSupplier(req, res, next) {
  try {
    const { supplier_name, contact_person, email, phone, address } = req.body;
    if (!supplier_name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required.' });
    }

    const [result] = await query(
      'INSERT INTO suppliers (supplier_name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [supplier_name.trim(), contact_person || null, email || null, phone || null, address || null]
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully.',
      supplierId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function updateSupplier(req, res, next) {
  try {
    const { id } = req.params;
    const { supplier_name, contact_person, email, phone, address } = req.body;

    await query(
      `UPDATE suppliers 
       SET supplier_name = COALESCE(?, supplier_name),
           contact_person = COALESCE(?, contact_person),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address)
       WHERE supplier_id = ?`,
      [supplier_name, contact_person, email, phone, address, id]
    );

    res.json({ success: true, message: 'Supplier updated successfully.' });
  } catch (error) {
    next(error);
  }
}

async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params;
    await query('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
    res.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// Customers
async function getCustomers(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        c.*,
        COUNT(so.sales_order_id) AS total_orders,
        COALESCE(SUM(so.total_amount), 0) AS total_revenue
      FROM customers c
      LEFT JOIN sales_orders so ON c.customer_id = so.customer_id
      GROUP BY c.customer_id
      ORDER BY c.customer_name ASC
    `);
    res.json({ success: true, count: rows.length, customers: rows });
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { customer_name, email, phone, address } = req.body;
    if (!customer_name) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    const [result] = await query(
      'INSERT INTO customers (customer_name, email, phone, address) VALUES (?, ?, ?, ?)',
      [customer_name.trim(), email || null, phone || null, address || null]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      customerId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { customer_name, email, phone, address } = req.body;

    await query(
      `UPDATE customers 
       SET customer_name = COALESCE(?, customer_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address)
       WHERE customer_id = ?`,
      [customer_name, email, phone, address, id]
    );

    res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    await query('DELETE FROM customers WHERE customer_id = ?', [id]);
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
