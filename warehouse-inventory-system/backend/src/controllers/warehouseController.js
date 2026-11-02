const { query } = require('../config/db');

async function getWarehouses(req, res, next) {
  try {
    // Uses DBMS View: view_warehouse_capacity_utilization
    const [rows] = await query('SELECT * FROM view_warehouse_capacity_utilization ORDER BY warehouse_name ASC');
    res.json({ success: true, warehouses: rows });
  } catch (error) {
    next(error);
  }
}

async function getWarehouseById(req, res, next) {
  try {
    const { id } = req.params;
    const [whRows] = await query('SELECT * FROM warehouses WHERE warehouse_id = ?', [id]);
    if (whRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    const [locations] = await query(
      'SELECT * FROM storage_locations WHERE warehouse_id = ? ORDER BY location_code ASC',
      [id]
    );

    const [stock] = await query(
      `SELECT 
         i.inventory_id,
         p.product_id,
         p.sku,
         p.product_name,
         c.category_name,
         sl.location_code,
         i.quantity_available,
         i.quantity_reserved,
         p.unit_price,
         (i.quantity_available * p.unit_price) AS valuation
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN storage_locations sl ON i.location_id = sl.location_id
       WHERE i.warehouse_id = ?
       ORDER BY p.product_name ASC`,
      [id]
    );

    res.json({
      success: true,
      warehouse: whRows[0],
      storage_locations: locations,
      inventory: stock
    });
  } catch (error) {
    next(error);
  }
}

async function createWarehouse(req, res, next) {
  try {
    const { warehouse_name, location, manager_name, contact_number } = req.body;
    if (!warehouse_name || !location) {
      return res.status(400).json({ success: false, message: 'Warehouse name and location are required.' });
    }

    const [result] = await query(
      'INSERT INTO warehouses (warehouse_name, location, manager_name, contact_number) VALUES (?, ?, ?, ?)',
      [warehouse_name.trim(), location.trim(), manager_name || null, contact_number || null]
    );

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CREATE_WAREHOUSE', 'warehouses', result.insertId, `Created warehouse ${warehouse_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully.',
      warehouseId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function updateWarehouse(req, res, next) {
  try {
    const { id } = req.params;
    const { warehouse_name, location, manager_name, contact_number } = req.body;

    await query(
      `UPDATE warehouses 
       SET warehouse_name = COALESCE(?, warehouse_name),
           location = COALESCE(?, location),
           manager_name = COALESCE(?, manager_name),
           contact_number = COALESCE(?, contact_number)
       WHERE warehouse_id = ?`,
      [warehouse_name, location, manager_name, contact_number, id]
    );

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'UPDATE_WAREHOUSE', 'warehouses', id, `Updated warehouse ${id}`]
    );

    res.json({ success: true, message: 'Warehouse updated successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getStorageLocations(req, res, next) {
  try {
    const { warehouseId } = req.params;
    const [rows] = await query(
      'SELECT * FROM storage_locations WHERE warehouse_id = ? ORDER BY location_code ASC',
      [warehouseId]
    );
    res.json({ success: true, locations: rows });
  } catch (error) {
    next(error);
  }
}

async function createStorageLocation(req, res, next) {
  try {
    const { warehouseId } = req.params;
    const { location_code, description } = req.body;

    if (!location_code) {
      return res.status(400).json({ success: false, message: 'Location code is required.' });
    }

    const [result] = await query(
      'INSERT INTO storage_locations (warehouse_id, location_code, description) VALUES (?, ?, ?)',
      [warehouseId, location_code.trim().toUpperCase(), description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Storage location created successfully.',
      locationId: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getStorageLocations,
  createStorageLocation
};
