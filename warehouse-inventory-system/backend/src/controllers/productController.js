const { query } = require('../config/db');

async function getProducts(req, res, next) {
  try {
    const { category_id, status, search } = req.query;
    let sql = `
      SELECT 
        p.product_id,
        p.sku,
        p.product_name,
        p.category_id,
        c.category_name,
        p.description,
        p.unit_price,
        p.reorder_level,
        p.unit_of_measure,
        p.created_at,
        p.status,
        COALESCE(SUM(i.quantity_available), 0) AS total_available,
        COALESCE(SUM(i.quantity_reserved), 0) AS total_reserved
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (p.product_name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' GROUP BY p.product_id, c.category_name ORDER BY p.product_name ASC';

    const [rows] = await query(sql, params);
    res.json({ success: true, count: rows.length, products: rows });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await query(
      `SELECT p.*, c.category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = rows[0];

    // Get stock breakdown per warehouse
    const [invRows] = await query(
      `SELECT 
         i.inventory_id,
         w.warehouse_id,
         w.warehouse_name,
         sl.location_code,
         i.quantity_available,
         i.quantity_reserved,
         i.last_updated
       FROM inventory i
       JOIN warehouses w ON i.warehouse_id = w.warehouse_id
       LEFT JOIN storage_locations sl ON i.location_id = sl.location_id
       WHERE i.product_id = ?`,
      [id]
    );

    res.json({ success: true, product, inventory: invRows });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { sku, product_name, category_id, description, unit_price, reorder_level, unit_of_measure } = req.body;

    if (!sku || !product_name || !category_id) {
      return res.status(400).json({ success: false, message: 'SKU, product name, and category are required.' });
    }

    const [result] = await query(
      `INSERT INTO products 
       (sku, product_name, category_id, description, unit_price, reorder_level, unit_of_measure)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sku.trim().toUpperCase(),
        product_name.trim(),
        category_id,
        description || null,
        unit_price || 0.00,
        reorder_level || 10,
        unit_of_measure || 'Units'
      ]
    );

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CREATE_PRODUCT', 'products', result.insertId, `Created product ${sku}: ${product_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      productId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { product_name, category_id, description, unit_price, reorder_level, unit_of_measure, status } = req.body;

    const [existing] = await query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await query(
      `UPDATE products 
       SET product_name = COALESCE(?, product_name),
           category_id = COALESCE(?, category_id),
           description = COALESCE(?, description),
           unit_price = COALESCE(?, unit_price),
           reorder_level = COALESCE(?, reorder_level),
           unit_of_measure = COALESCE(?, unit_of_measure),
           status = COALESCE(?, status)
       WHERE product_id = ?`,
      [product_name, category_id, description, unit_price, reorder_level, unit_of_measure, status, id]
    );

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'UPDATE_PRODUCT', 'products', id, `Updated product details for ID ${id}`]
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    // Check if product is referenced in inventory or orders
    const [inv] = await query('SELECT SUM(quantity_available) as total FROM inventory WHERE product_id = ?', [id]);
    if (inv[0] && inv[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing inventory stock. Mark as discontinued instead.'
      });
    }

    await query('DELETE FROM products WHERE product_id = ?', [id]);

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'DELETE_PRODUCT', 'products', id, `Deleted product ID ${id}`]
    );

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const [rows] = await query(`
      SELECT 
        c.*,
        COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id
      ORDER BY c.category_name ASC
    `);
    res.json({ success: true, categories: rows });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [result] = await query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name.trim(), description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
};
