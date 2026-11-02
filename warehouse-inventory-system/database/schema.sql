-- ============================================================================
-- WAREHOUSE & INVENTORY MANAGEMENT SYSTEM
-- DBMS Course Project Database Schema
-- RDBMS: MySQL 8.0+ | Engine: InnoDB | Character Set: utf8mb4
-- ============================================================================

CREATE DATABASE IF NOT EXISTS warehouse_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE warehouse_db;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables, views, procedures, and triggers if any
DROP VIEW IF EXISTS view_recent_stock_activity;
DROP VIEW IF EXISTS view_warehouse_capacity_utilization;
DROP VIEW IF EXISTS view_low_stock_alerts;
DROP VIEW IF EXISTS view_inventory_summary;

DROP PROCEDURE IF EXISTS sp_adjust_inventory;
DROP PROCEDURE IF EXISTS sp_execute_stock_transfer;
DROP PROCEDURE IF EXISTS sp_dispatch_sales_order;
DROP PROCEDURE IF EXISTS sp_receive_purchase_order;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS stock_transfer_items;
DROP TABLE IF EXISTS stock_transfers;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS sales_order_items;
DROP TABLE IF EXISTS sales_orders;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS storage_locations;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USERS & ROLES
-- ============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'warehouse_manager', 'inventory_clerk', 'sales_rep') NOT NULL DEFAULT 'inventory_clerk',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PRODUCT CATEGORIES
-- ============================================================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. PRODUCTS
-- ============================================================================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 10,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'Units',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'discontinued') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_products_sku (sku),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. WAREHOUSES
-- ============================================================================
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    manager_name VARCHAR(100),
    contact_number VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. STORAGE LOCATIONS (Within Warehouses)
-- ============================================================================
CREATE TABLE storage_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT fk_locations_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_warehouse_location (warehouse_id, location_code),
    INDEX idx_locations_warehouse (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. SUPPLIERS
-- ============================================================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_suppliers_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. CUSTOMERS
-- ============================================================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_name (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. INVENTORY
-- ============================================================================
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inventory_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inventory_location
        FOREIGN KEY (location_id) REFERENCES storage_locations(location_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_product_warehouse UNIQUE (product_id, warehouse_id),
    CONSTRAINT chk_inventory_qty_avail CHECK (quantity_available >= 0),
    CONSTRAINT chk_inventory_qty_res CHECK (quantity_reserved >= 0),
    INDEX idx_inventory_lookup (warehouse_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. PURCHASE ORDERS
-- ============================================================================
CREATE TABLE purchase_orders (
    purchase_order_id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    created_by INT NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    status ENUM('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_po_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_po_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_po_status (status),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. PURCHASE ORDER ITEMS
-- ============================================================================
CREATE TABLE purchase_order_items (
    purchase_item_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_poi_order
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_poi_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_poi_qty_ord CHECK (quantity_ordered > 0),
    CONSTRAINT chk_poi_qty_rec CHECK (quantity_received >= 0),
    INDEX idx_poi_order (purchase_order_id),
    INDEX idx_poi_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. SALES ORDERS
-- ============================================================================
CREATE TABLE sales_orders (
    sales_order_id INT AUTO_INCREMENT PRIMARY KEY,
    so_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    created_by INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'DISPATCHED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_so_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_so_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_so_status (status),
    INDEX idx_so_customer (customer_id),
    INDEX idx_so_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. SALES ORDER ITEMS
-- ============================================================================
CREATE TABLE sales_order_items (
    sales_item_id INT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_soi_order
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(sales_order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_soi_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_soi_qty CHECK (quantity > 0),
    INDEX idx_soi_order (sales_order_id),
    INDEX idx_soi_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. STOCK MOVEMENTS (Immutable Ledger)
-- ============================================================================
CREATE TABLE stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    movement_type ENUM('IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id INT NULL,
    performed_by INT NOT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    CONSTRAINT fk_sm_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sm_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sm_user
        FOREIGN KEY (performed_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sm_product (product_id),
    INDEX idx_sm_warehouse (warehouse_id),
    INDEX idx_sm_date (movement_date),
    INDEX idx_sm_type (movement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. STOCK TRANSFERS
-- ============================================================================
CREATE TABLE stock_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    source_warehouse_id INT NOT NULL,
    destination_warehouse_id INT NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_by INT NOT NULL,
    remarks TEXT,
    CONSTRAINT fk_st_source_wh
        FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_st_dest_wh
        FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_st_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_st_diff_wh CHECK (source_warehouse_id <> destination_warehouse_id),
    INDEX idx_st_status (status),
    INDEX idx_st_source (source_warehouse_id),
    INDEX idx_st_dest (destination_warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. STOCK TRANSFER ITEMS
-- ============================================================================
CREATE TABLE stock_transfer_items (
    transfer_item_id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_sti_transfer
        FOREIGN KEY (transfer_id) REFERENCES stock_transfers(transfer_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sti_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_sti_qty CHECK (quantity > 0),
    INDEX idx_sti_transfer (transfer_id),
    INDEX idx_sti_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. AUDIT LOGS
-- ============================================================================
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RELATIONAL DATABASE VIEWS (Academic DBMS showcase)
-- ============================================================================

-- View 1: Inventory Summary with Product details, Category, Reorder Status & Valuation
CREATE VIEW view_inventory_summary AS
SELECT 
    i.inventory_id,
    p.product_id,
    p.sku,
    p.product_name,
    c.category_id,
    c.category_name,
    w.warehouse_id,
    w.warehouse_name,
    sl.location_code,
    i.quantity_available,
    i.quantity_reserved,
    (i.quantity_available - i.quantity_reserved) AS net_available,
    p.reorder_level,
    p.unit_price,
    (i.quantity_available * p.unit_price) AS total_valuation,
    CASE 
        WHEN i.quantity_available <= 0 THEN 'OUT_OF_STOCK'
        WHEN i.quantity_available <= p.reorder_level THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN storage_locations sl ON i.location_id = sl.location_id;

-- View 2: Low-Stock Alerts for Reordering
CREATE VIEW view_low_stock_alerts AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    c.category_name,
    w.warehouse_name,
    i.quantity_available,
    p.reorder_level,
    (p.reorder_level - i.quantity_available) AS deficit_quantity,
    p.unit_price
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity_available <= p.reorder_level AND p.status = 'active';

-- View 3: Warehouse Capacity & Inventory Utilization
CREATE VIEW view_warehouse_capacity_utilization AS
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    w.location,
    w.manager_name,
    COUNT(DISTINCT i.product_id) AS total_unique_skus,
    COALESCE(SUM(i.quantity_available), 0) AS total_units_stored,
    COALESCE(SUM(i.quantity_reserved), 0) AS total_units_reserved,
    COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_inventory_value
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.warehouse_name, w.location, w.manager_name;

-- View 4: Recent Stock Activity Ledger
CREATE VIEW view_recent_stock_activity AS
SELECT 
    sm.movement_id,
    sm.movement_date,
    sm.movement_type,
    p.sku,
    p.product_name,
    w.warehouse_name,
    sm.quantity,
    sm.reference_type,
    sm.reference_id,
    u.name AS performed_by_user,
    sm.remarks
FROM stock_movements sm
JOIN products p ON sm.product_id = p.product_id
JOIN warehouses w ON sm.warehouse_id = w.warehouse_id
JOIN users u ON sm.performed_by = u.user_id;

-- ============================================================================
-- STORED PROCEDURES (ACID Transaction Management)
-- ============================================================================

DELIMITER $$

-- Procedure 1: Receive Purchase Order (Updates Stock IN + Inventory + Audit Log in single ACID transaction)
CREATE PROCEDURE sp_receive_purchase_order (
    IN p_purchase_order_id INT,
    IN p_performed_by INT
)
proc_label: BEGIN
    DECLARE v_po_status VARCHAR(20);
    DECLARE v_warehouse_id INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_prod_id INT;
    DECLARE v_qty_ord INT;

    -- Cursor to iterate over items in the purchase order
    DECLARE cur_items CURSOR FOR 
        SELECT product_id, quantity_ordered 
        FROM purchase_order_items 
        WHERE purchase_order_id = p_purchase_order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Error handler for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Check PO status
    SELECT status, warehouse_id INTO v_po_status, v_warehouse_id
    FROM purchase_orders 
    WHERE purchase_order_id = p_purchase_order_id
    FOR UPDATE;

    IF v_po_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase order not found.';
    END IF;

    IF v_po_status <> 'ORDERED' AND v_po_status <> 'PENDING' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase order is already processed or cancelled.';
    END IF;

    -- Open cursor and update inventory + stock movements
    OPEN cur_items;
    read_loop: LOOP
        FETCH cur_items INTO v_prod_id, v_qty_ord;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Update PO Item received count
        UPDATE purchase_order_items 
        SET quantity_received = v_qty_ord 
        WHERE purchase_order_id = p_purchase_order_id AND product_id = v_prod_id;

        -- Upsert into inventory
        INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
        VALUES (v_prod_id, v_warehouse_id, v_qty_ord, 0)
        ON DUPLICATE KEY UPDATE 
            quantity_available = quantity_available + VALUES(quantity_available),
            last_updated = CURRENT_TIMESTAMP;

        -- Record stock movement (IN)
        INSERT INTO stock_movements (
            product_id, warehouse_id, movement_type, quantity, 
            reference_type, reference_id, performed_by, remarks
        ) VALUES (
            v_prod_id, v_warehouse_id, 'IN', v_qty_ord,
            'PURCHASE_ORDER', p_purchase_order_id, p_performed_by,
            CONCAT('Received PO #', p_purchase_order_id)
        );
    END LOOP;
    CLOSE cur_items;

    -- Mark PO as RECEIVED
    UPDATE purchase_orders 
    SET status = 'RECEIVED' 
    WHERE purchase_order_id = p_purchase_order_id;

    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (p_performed_by, 'RECEIVE_PO', 'purchase_orders', p_purchase_order_id, 'Purchase order received and stock added to inventory.');

    COMMIT;
END$$

-- Procedure 2: Dispatch Sales Order (Deducts Stock OUT + Inventory + Checks Availability)
CREATE PROCEDURE sp_dispatch_sales_order (
    IN p_sales_order_id INT,
    IN p_performed_by INT
)
proc_label: BEGIN
    DECLARE v_so_status VARCHAR(20);
    DECLARE v_warehouse_id INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_prod_id INT;
    DECLARE v_qty INT;
    DECLARE v_avail INT;

    DECLARE cur_items CURSOR FOR 
        SELECT product_id, quantity 
        FROM sales_order_items 
        WHERE sales_order_id = p_sales_order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status, warehouse_id INTO v_so_status, v_warehouse_id
    FROM sales_orders 
    WHERE sales_order_id = p_sales_order_id
    FOR UPDATE;

    IF v_so_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sales order not found.';
    END IF;

    IF v_so_status = 'DISPATCHED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sales order has already been dispatched.';
    END IF;

    IF v_so_status = 'CANCELLED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot dispatch a cancelled sales order.';
    END IF;

    -- Check stock availability for all items first
    OPEN cur_items;
    check_loop: LOOP
        FETCH cur_items INTO v_prod_id, v_qty;
        IF done THEN
            LEAVE check_loop;
        END IF;

        SELECT quantity_available INTO v_avail
        FROM inventory
        WHERE product_id = v_prod_id AND warehouse_id = v_warehouse_id
        FOR UPDATE;

        IF v_avail IS NULL OR v_avail < v_qty THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Insufficient stock available in warehouse to dispatch order.';
        END IF;
    END LOOP;
    CLOSE cur_items;

    -- Reset cursor flag and deduct inventory
    SET done = FALSE;
    OPEN cur_items;
    deduct_loop: LOOP
        FETCH cur_items INTO v_prod_id, v_qty;
        IF done THEN
            LEAVE deduct_loop;
        END IF;

        UPDATE inventory 
        SET quantity_available = quantity_available - v_qty,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = v_prod_id AND warehouse_id = v_warehouse_id;

        -- Record stock movement (OUT)
        INSERT INTO stock_movements (
            product_id, warehouse_id, movement_type, quantity, 
            reference_type, reference_id, performed_by, remarks
        ) VALUES (
            v_prod_id, v_warehouse_id, 'OUT', v_qty,
            'SALES_ORDER', p_sales_order_id, p_performed_by,
            CONCAT('Dispatched Sales Order #', p_sales_order_id)
        );
    END LOOP;
    CLOSE cur_items;

    -- Update SO status
    UPDATE sales_orders 
    SET status = 'DISPATCHED' 
    WHERE sales_order_id = p_sales_order_id;

    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (p_performed_by, 'DISPATCH_SO', 'sales_orders', p_sales_order_id, 'Sales order dispatched and inventory deducted.');

    COMMIT;
END$$

-- Procedure 3: Complete Stock Transfer (Deducts Source, Adds Destination in ACID Transaction)
CREATE PROCEDURE sp_execute_stock_transfer (
    IN p_transfer_id INT,
    IN p_performed_by INT
)
proc_label: BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_src_wh INT;
    DECLARE v_dst_wh INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_prod_id INT;
    DECLARE v_qty INT;
    DECLARE v_avail INT;

    DECLARE cur_items CURSOR FOR 
        SELECT product_id, quantity 
        FROM stock_transfer_items 
        WHERE transfer_id = p_transfer_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status, source_warehouse_id, destination_warehouse_id 
    INTO v_status, v_src_wh, v_dst_wh
    FROM stock_transfers 
    WHERE transfer_id = p_transfer_id
    FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock transfer not found.';
    END IF;

    IF v_status = 'COMPLETED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transfer is already marked completed.';
    END IF;

    IF v_status = 'CANCELLED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot execute a cancelled transfer.';
    END IF;

    -- Verify stock at source
    OPEN cur_items;
    check_stock_loop: LOOP
        FETCH cur_items INTO v_prod_id, v_qty;
        IF done THEN
            LEAVE check_stock_loop;
        END IF;

        SELECT quantity_available INTO v_avail
        FROM inventory
        WHERE product_id = v_prod_id AND warehouse_id = v_src_wh
        FOR UPDATE;

        IF v_avail IS NULL OR v_avail < v_qty THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Insufficient source warehouse stock for transfer.';
        END IF;
    END LOOP;
    CLOSE cur_items;

    -- Execute transfer items
    SET done = FALSE;
    OPEN cur_items;
    transfer_loop: LOOP
        FETCH cur_items INTO v_prod_id, v_qty;
        IF done THEN
            LEAVE transfer_loop;
        END IF;

        -- Deduct from source
        UPDATE inventory 
        SET quantity_available = quantity_available - v_qty,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = v_prod_id AND warehouse_id = v_src_wh;

        -- Add to destination
        INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
        VALUES (v_prod_id, v_dst_wh, v_qty, 0)
        ON DUPLICATE KEY UPDATE 
            quantity_available = quantity_available + VALUES(quantity_available),
            last_updated = CURRENT_TIMESTAMP;

        -- Record TRANSFER_OUT movement
        INSERT INTO stock_movements (
            product_id, warehouse_id, movement_type, quantity, 
            reference_type, reference_id, performed_by, remarks
        ) VALUES (
            v_prod_id, v_src_wh, 'TRANSFER_OUT', v_qty,
            'STOCK_TRANSFER', p_transfer_id, p_performed_by,
            CONCAT('Transfer OUT to Warehouse #', v_dst_wh)
        );

        -- Record TRANSFER_IN movement
        INSERT INTO stock_movements (
            product_id, warehouse_id, movement_type, quantity, 
            reference_type, reference_id, performed_by, remarks
        ) VALUES (
            v_prod_id, v_dst_wh, 'TRANSFER_IN', v_qty,
            'STOCK_TRANSFER', p_transfer_id, p_performed_by,
            CONCAT('Transfer IN from Warehouse #', v_src_wh)
        );
    END LOOP;
    CLOSE cur_items;

    -- Mark transfer COMPLETED
    UPDATE stock_transfers 
    SET status = 'COMPLETED' 
    WHERE transfer_id = p_transfer_id;

    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (p_performed_by, 'COMPLETE_TRANSFER', 'stock_transfers', p_transfer_id, 'Stock transfer completed across warehouses.');

    COMMIT;
END$$

-- Procedure 4: Manual Inventory Stock Adjustment
CREATE PROCEDURE sp_adjust_inventory (
    IN p_product_id INT,
    IN p_warehouse_id INT,
    IN p_new_quantity INT,
    IN p_reason VARCHAR(255),
    IN p_performed_by INT
)
proc_label: BEGIN
    DECLARE v_current_qty INT DEFAULT 0;
    DECLARE v_diff INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_new_quantity < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Inventory quantity cannot be negative.';
    END IF;

    START TRANSACTION;

    SELECT quantity_available INTO v_current_qty
    FROM inventory
    WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id
    FOR UPDATE;

    IF v_current_qty IS NULL THEN
        -- Insert new inventory record
        INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
        VALUES (p_product_id, p_warehouse_id, p_new_quantity, 0);
        SET v_diff = p_new_quantity;
    ELSE
        SET v_diff = p_new_quantity - v_current_qty;
        UPDATE inventory 
        SET quantity_available = p_new_quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
    END IF;

    -- Record in stock movements ledger
    INSERT INTO stock_movements (
        product_id, warehouse_id, movement_type, quantity,
        reference_type, reference_id, performed_by, remarks
    ) VALUES (
        p_product_id, p_warehouse_id, 'ADJUSTMENT', v_diff,
        'MANUAL_ADJUSTMENT', NULL, p_performed_by,
        CONCAT('Inventory adjusted from ', v_current_qty, ' to ', p_new_quantity, '. Reason: ', p_reason)
    );

    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (
        p_performed_by, 'ADJUST_INVENTORY', 'inventory', p_product_id, 
        CONCAT('Stock adjusted for Product #', p_product_id, ' in Warehouse #', p_warehouse_id, ' (', v_current_qty, ' -> ', p_new_quantity, ')')
    );

    COMMIT;
END$$

DELIMITER ;
