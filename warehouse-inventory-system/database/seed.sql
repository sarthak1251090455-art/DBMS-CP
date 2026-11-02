-- ============================================================================
-- WAREHOUSE & INVENTORY MANAGEMENT SYSTEM
-- Seed Data for Academic Demonstration & Testing
-- ============================================================================

USE warehouse_db;

-- 1. Insert Initial Users
-- Password for all accounts: 'admin123'
INSERT INTO users (user_id, name, email, password_hash, role, status) VALUES
(1, 'System Administrator', 'admin@warehouse.com', '$2b$10$bjuGdXp2DramoHJj9nMGlONkl6tuLjJbLP0Rk1BB6P/X4Jld2pYyC', 'admin', 'active'),
(2, 'Marcus Vance (Manager)', 'manager@warehouse.com', '$2b$10$bjuGdXp2DramoHJj9nMGlONkl6tuLjJbLP0Rk1BB6P/X4Jld2pYyC', 'warehouse_manager', 'active'),
(3, 'Elena Rostova (Clerk)', 'clerk@warehouse.com', '$2b$10$bjuGdXp2DramoHJj9nMGlONkl6tuLjJbLP0Rk1BB6P/X4Jld2pYyC', 'inventory_clerk', 'active'),
(4, 'David Chen (Sales)', 'sales@warehouse.com', '$2b$10$bjuGdXp2DramoHJj9nMGlONkl6tuLjJbLP0Rk1BB6P/X4Jld2pYyC', 'sales_rep', 'active');

-- 2. Insert Product Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Electronics & Components', 'Microcontrollers, sensors, ICs, power supplies and connectors'),
(2, 'Industrial Tools & Equipment', 'Heavy-duty power tools, pneumatic wrenches, drills, and hardware accessories'),
(3, 'Raw Materials & Metals', 'Aluminum sheets, copper tubing, stainless steel bolts, industrial fasteners'),
(4, 'Packaging & Logistics', 'Corrugated boxes, bubble wrap, pallet wraps, thermal shipping labels'),
(5, 'Office & Safety Gear', 'High-visibility vests, safety goggles, hard hats, ergonomic desk supplies');

-- 3. Insert Products
INSERT INTO products (product_id, sku, product_name, category_id, description, unit_price, reorder_level, unit_of_measure, status) VALUES
(1, 'ELEC-MCU-001', 'ARM Cortex-M4 Microcontroller Dev Board', 1, 'High-performance embedded 32-bit MCU board with USB-C and CAN-bus', 45.00, 25, 'Pieces', 'active'),
(2, 'ELEC-SNS-002', 'Industrial Temperature & Humidity Sensor probe', 1, 'RS485 Modbus RTU waterproof temperature and humidity transmitter', 28.50, 20, 'Pieces', 'active'),
(3, 'ELEC-PWR-003', '24V 10A DIN-Rail Industrial Power Supply', 1, 'MeanWell compatible metal casing industrial power unit', 65.00, 15, 'Units', 'active'),
(4, 'TOOL-PWR-010', 'Heavy-Duty 20V Cordless Brushless Impact Driver', 2, 'High-torque impact driver kit with two 4.0Ah Li-ion batteries', 149.99, 10, 'Sets', 'active'),
(5, 'TOOL-CAL-011', 'Precision Digital Vernier Caliper 150mm', 2, 'Stainless steel IP54 waterproof digital measuring instrument', 34.00, 15, 'Pieces', 'active'),
(6, 'TOOL-AIR-012', 'Pneumatic Brad Nailer 18 Gauge', 2, 'Industrial air-powered finish nail gun with quick-clear nose', 89.50, 8, 'Units', 'active'),
(7, 'RAW-ALU-020', '6061 Aluminum Sheet Plate 3mm x 500mm x 500mm', 3, 'High corrosion resistance aircraft-grade aluminum alloy plate', 42.00, 30, 'Sheets', 'active'),
(8, 'RAW-COP-021', 'Pure Copper Tubing Coil 1/2-inch OD x 50ft', 3, 'Seamless refrigeration and plumbing grade ASTM B280 copper coil', 115.00, 12, 'Coils', 'active'),
(9, 'RAW-FST-022', 'Grade 8.8 Galvanized Hex Bolts M10 x 50mm (Pack of 100)', 3, 'High tensile carbon steel fully threaded hexagonal fasteners', 18.25, 50, 'Packs', 'active'),
(10, 'PKG-BOX-030', 'Heavy-Duty Double-Wall Corrugated Boxes 18x14x12 (Bundle of 25)', 4, 'Heavy duty ECT-48 shipping cartons for freight distribution', 38.00, 40, 'Bundles', 'active'),
(11, 'PKG-WRP-031', 'Cast Stretch Film Pallet Wrap 18in x 1500ft 80 Gauge (Case of 4)', 4, 'Industrial strength clear hand stretch wrap puncture resistant', 52.00, 20, 'Cases', 'active'),
(12, 'PKG-LBL-032', 'Direct Thermal Shipping Labels 4x6 (Roll of 500)', 4, 'BPA-free waterproof courier labels compatible with Zebra & Rollo', 12.50, 60, 'Rolls', 'active'),
(13, 'SFT-GLV-040', 'Nitrile Coated Work Safety Gloves Cut Level 5 (Pack of 12)', 5, 'Reinforced grip breathable mechanical protection gloves', 24.00, 35, 'Packs', 'active'),
(14, 'SFT-VST-041', 'ANSI Class 2 High-Visibility Reflective Safety Vest', 5, 'Fluorescent yellow vest with multi-pocket storage and zipper', 14.50, 25, 'Pieces', 'active'),
(15, 'SFT-RES-042', 'Half-Face Industrial Respirator with Organic Vapor Cartridges', 5, 'Reusable dual filtration safety mask for dust and chemical fumes', 39.90, 15, 'Sets', 'active');

-- 4. Insert Warehouses
INSERT INTO warehouses (warehouse_id, warehouse_name, location, manager_name, contact_number) VALUES
(1, 'Central Logistics Hub', '4400 Logistics Blvd, Chicago, IL 60666', 'Marcus Vance', '+1 (312) 555-0191'),
(2, 'Pacific Coastal Depot', '1200 Terminal Way, Seattle, WA 98134', 'Sarah Jenkins', '+1 (206) 555-0144'),
(3, 'Atlantic Gateway Terminal', '850 Port Newark Blvd, Newark, NJ 07114', 'Robert Sterling', '+1 (973) 555-0182');

-- 5. Insert Storage Locations
INSERT INTO storage_locations (location_id, warehouse_id, location_code, description) VALUES
(1, 1, 'CHI-AISLE-A1-B1', 'Aisle 1, Rack Section A, Shelf 1 (Small Electronics)'),
(2, 1, 'CHI-AISLE-B2-BULK', 'Aisle 2, Pallet Staging Bay (Heavy Tools & Fasteners)'),
(3, 1, 'CHI-MEZZ-C1-PKG', 'Mezzanine Level, Packaging & Consumables Bay'),
(4, 2, 'SEA-AISLE-01-RACK', 'Pacific Bay 1, General Inventory Racks'),
(5, 2, 'SEA-AISLE-02-TEMP', 'Pacific Bay 2, Climate-Controlled Secure Enclosure'),
(6, 2, 'SEA-DOCK-STAGING', 'Pacific Inbound Receiving Staging Floor'),
(7, 3, 'NWK-ZONE-A-PALLET', 'Atlantic High-Bay Pallet Racks (Metals & Raw Materials)'),
(8, 3, 'NWK-ZONE-B-SHELF', 'Atlantic Mid-Tier Shelving (Safety & Hardware)'),
(9, 3, 'NWK-ZONE-C-RECV', 'Atlantic Inbound Dock Quarantine / Inspection Area');

-- 6. Insert Suppliers
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, email, phone, address) VALUES
(1, 'Global Semiconductor & Components Corp', 'Arthur King', 'procurement@globalsemi.com', '+1 (408) 555-8832', '350 Tech Parkway, San Jose, CA 95110'),
(2, 'Apex Industrial Tooling & Machinery', 'Brenda Myers', 'sales@apextools.com', '+1 (216) 555-4421', '8900 Industrial Ave, Cleveland, OH 44101'),
(3, 'Titan Packaging & Supply Solutions', 'Carlos Mendez', 'orders@titanpkg.com', '+1 (404) 555-7790', '1400 Logistics Way, Atlanta, GA 30303'),
(4, 'Vanguard Safety & Raw Materials LLC', 'Diane Foster', 'dfoster@vanguardsupply.com', '+1 (713) 555-1289', '2100 Ship Channel Rd, Houston, TX 77011');

-- 7. Insert Customers
INSERT INTO customers (customer_id, customer_name, email, phone, address) VALUES
(1, 'Metro Automated Manufacturing Inc', 'orders@metromfg.com', '+1 (612) 555-9011', '100 Innovation Dr, Minneapolis, MN 55401'),
(2, 'Zenith Regional Contracting Group', 'accounts@zenithcontractors.com', '+1 (303) 555-6677', '550 Summit Parkway, Denver, CO 80202'),
(3, 'Horizon Robotics & Automation Labs', 'purchasing@horizonrobotics.io', '+1 (617) 555-2244', '75 Technology Square, Cambridge, MA 02139'),
(4, 'Cascade Facilities Maintenance Services', 'info@cascadefacilities.com', '+1 (503) 555-3312', '900 Riverfront Blvd, Portland, OR 97201');

-- 8. Insert Inventory (Stock distribution across warehouses)
INSERT INTO inventory (inventory_id, product_id, warehouse_id, location_id, quantity_available, quantity_reserved) VALUES
-- Central Logistics Hub
(1, 1, 1, 1, 85, 10),
(2, 2, 1, 1, 60, 5),
(3, 3, 1, 1, 35, 0),
(4, 4, 1, 2, 22, 4),
(5, 5, 1, 2, 40, 0),
(6, 6, 1, 2, 14, 2),
(7, 7, 1, 2, 55, 0),
(8, 8, 1, 2, 8, 0), -- Low Stock Trigger! (Reorder level 12)
(9, 9, 1, 2, 120, 10),
(10, 10, 1, 3, 90, 0),
(11, 11, 1, 3, 45, 0),
(12, 12, 1, 3, 150, 0),
(13, 13, 1, 3, 80, 0),
(14, 14, 1, 3, 18, 0), -- Low Stock Trigger! (Reorder level 25)
(15, 15, 1, 3, 30, 0),

-- Pacific Coastal Depot
(16, 1, 2, 4, 40, 0),
(17, 2, 2, 5, 12, 0), -- Low Stock Trigger! (Reorder level 20)
(18, 4, 2, 4, 18, 0),
(19, 7, 2, 4, 25, 0), -- Low Stock Trigger! (Reorder level 30)
(20, 10, 2, 4, 60, 0),
(21, 12, 2, 4, 95, 0),

-- Atlantic Gateway Terminal
(22, 3, 3, 7, 20, 0),
(23, 7, 3, 7, 70, 0),
(24, 8, 3, 7, 30, 0),
(25, 9, 3, 7, 200, 0),
(26, 13, 3, 8, 65, 0),
(27, 15, 3, 8, 10, 0); -- Low Stock Trigger! (Reorder level 15)

-- 9. Insert Purchase Orders
INSERT INTO purchase_orders (purchase_order_id, po_number, supplier_id, warehouse_id, created_by, order_date, expected_date, status, total_amount) VALUES
(1, 'PO-2026-0001', 1, 1, 2, '2026-10-10', '2026-10-18', 'RECEIVED', 4375.00),
(2, 'PO-2026-0002', 2, 1, 2, '2026-10-15', '2026-10-25', 'RECEIVED', 3249.75),
(3, 'PO-2026-0003', 3, 1, 3, '2026-10-28', '2026-11-05', 'ORDERED', 2850.00),
(4, 'PO-2026-0004', 4, 3, 2, '2026-10-30', '2026-11-10', 'PENDING', 5120.00);

-- 10. Insert Purchase Order Items
INSERT INTO purchase_order_items (purchase_item_id, purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, subtotal) VALUES
-- PO 1 Items
(1, 1, 1, 50, 50, 40.00, 2000.00),
(2, 1, 2, 50, 50, 25.00, 1250.00),
(3, 1, 3, 20, 20, 56.25, 1125.00),
-- PO 2 Items
(4, 2, 4, 15, 15, 130.00, 1950.00),
(5, 2, 5, 25, 25, 28.00, 700.00),
(6, 2, 6, 8, 8, 74.97, 599.76),
-- PO 3 Items
(7, 3, 10, 50, 0, 32.00, 1600.00),
(8, 3, 11, 25, 0, 50.00, 1250.00),
-- PO 4 Items
(9, 4, 7, 40, 0, 38.00, 1520.00),
(10, 4, 8, 20, 0, 105.00, 2100.00),
(11, 4, 13, 50, 0, 30.00, 1500.00);

-- 11. Insert Sales Orders
INSERT INTO sales_orders (sales_order_id, so_number, customer_id, warehouse_id, created_by, order_date, status, total_amount) VALUES
(1, 'SO-2026-0001', 1, 1, 4, '2026-10-18', 'DISPATCHED', 2225.00),
(2, 'SO-2026-0002', 3, 1, 4, '2026-10-22', 'DISPATCHED', 3150.00),
(3, 'SO-2026-0003', 2, 1, 4, '2026-10-29', 'CONFIRMED', 1845.00),
(4, 'SO-2026-0004', 4, 2, 4, '2026-10-31', 'PENDING', 1420.00);

-- 12. Insert Sales Order Items
INSERT INTO sales_order_items (sales_item_id, sales_order_id, product_id, quantity, unit_price, subtotal) VALUES
-- SO 1 Items
(1, 1, 1, 15, 45.00, 675.00),
(2, 1, 2, 20, 28.50, 570.00),
(3, 1, 4, 4, 149.99, 599.96),
(4, 1, 12, 30, 12.50, 375.00),
-- SO 2 Items
(5, 2, 1, 30, 45.00, 1350.00),
(6, 2, 3, 15, 65.00, 975.00),
(7, 2, 5, 20, 34.00, 680.00),
(8, 2, 10, 3, 38.00, 114.00),
-- SO 3 Items
(9, 3, 4, 4, 149.99, 599.96),
(10, 3, 9, 20, 18.25, 365.00),
(11, 3, 13, 15, 24.00, 360.00),
(12, 3, 14, 10, 14.50, 145.00),
-- SO 4 Items
(13, 4, 1, 10, 45.00, 450.00),
(14, 4, 7, 10, 42.00, 420.00),
(15, 4, 10, 15, 38.00, 570.00);

-- 13. Insert Stock Movements (Audit Trail of Historical In/Out Transactions)
INSERT INTO stock_movements (movement_id, product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, performed_by, movement_date, remarks) VALUES
(1, 1, 1, 'IN', 50, 'PURCHASE_ORDER', 1, 2, '2026-10-18 10:15:00', 'Received shipment for PO-2026-0001'),
(2, 2, 1, 'IN', 50, 'PURCHASE_ORDER', 1, 2, '2026-10-18 10:15:00', 'Received shipment for PO-2026-0001'),
(3, 3, 1, 'IN', 20, 'PURCHASE_ORDER', 1, 2, '2026-10-18 10:15:00', 'Received shipment for PO-2026-0001'),
(4, 4, 1, 'IN', 15, 'PURCHASE_ORDER', 2, 2, '2026-10-25 14:30:00', 'Received shipment for PO-2026-0002'),
(5, 5, 1, 'IN', 25, 'PURCHASE_ORDER', 2, 2, '2026-10-25 14:30:00', 'Received shipment for PO-2026-0002'),
(6, 6, 1, 'IN', 8, 'PURCHASE_ORDER', 2, 2, '2026-10-25 14:30:00', 'Received shipment for PO-2026-0002'),
(7, 1, 1, 'OUT', 15, 'SALES_ORDER', 1, 3, '2026-10-19 11:20:00', 'Dispatched goods for SO-2026-0001'),
(8, 2, 1, 'OUT', 20, 'SALES_ORDER', 1, 3, '2026-10-19 11:20:00', 'Dispatched goods for SO-2026-0001'),
(9, 4, 1, 'OUT', 4, 'SALES_ORDER', 1, 3, '2026-10-19 11:20:00', 'Dispatched goods for SO-2026-0001'),
(10, 1, 1, 'OUT', 30, 'SALES_ORDER', 2, 3, '2026-10-23 16:45:00', 'Dispatched goods for SO-2026-0002'),
(11, 3, 1, 'OUT', 15, 'SALES_ORDER', 2, 3, '2026-10-23 16:45:00', 'Dispatched goods for SO-2026-0002'),
(12, 1, 1, 'TRANSFER_OUT', 20, 'STOCK_TRANSFER', 1, 2, '2026-10-26 09:00:00', 'Inter-warehouse stock transfer to Pacific Coastal Depot'),
(13, 1, 2, 'TRANSFER_IN', 20, 'STOCK_TRANSFER', 1, 2, '2026-10-27 15:30:00', 'Stock transfer arrived from Central Logistics Hub'),
(14, 8, 1, 'ADJUSTMENT', -2, 'MANUAL_ADJUSTMENT', NULL, 3, '2026-10-28 17:00:00', 'Physical cycle count discrepancy: damaged insulation casing');

-- 14. Insert Stock Transfers
INSERT INTO stock_transfers (transfer_id, transfer_number, source_warehouse_id, destination_warehouse_id, transfer_date, status, created_by, remarks) VALUES
(1, 'TR-2026-0001', 1, 2, '2026-10-26 09:00:00', 'COMPLETED', 2, 'Replenishment transfer of microcontroller units to Pacific depot'),
(2, 'TR-2026-0002', 3, 1, '2026-10-31 11:30:00', 'IN_TRANSIT', 2, 'Transfer of fasteners and aluminum sheets to Central Hub');

-- 15. Insert Stock Transfer Items
INSERT INTO stock_transfer_items (transfer_item_id, transfer_id, product_id, quantity) VALUES
(1, 1, 1, 20),
(2, 2, 7, 15),
(3, 2, 9, 50);

-- 16. Insert Audit Logs
INSERT INTO audit_logs (log_id, user_id, action, entity_name, entity_id, timestamp, details) VALUES
(1, 1, 'SYSTEM_INIT', 'database', NULL, '2026-10-01 08:00:00', 'Warehouse & Inventory Management System database initialized with schemas and constraints.'),
(2, 2, 'CREATE_PO', 'purchase_orders', 1, '2026-10-10 09:30:00', 'Created purchase order PO-2026-0001 for Global Semiconductor.'),
(3, 2, 'RECEIVE_PO', 'purchase_orders', 1, '2026-10-18 10:15:00', 'Executed stored procedure sp_receive_purchase_order: Added 120 total inventory units across 3 SKUs.'),
(4, 4, 'CREATE_SO', 'sales_orders', 1, '2026-10-18 11:00:00', 'Created sales order SO-2026-0001 for Metro Automated Manufacturing.'),
(5, 3, 'DISPATCH_SO', 'sales_orders', 1, '2026-10-19 11:20:00', 'Executed stored procedure sp_dispatch_sales_order: Dispatched items and verified non-negative stock balance.'),
(6, 2, 'EXECUTE_TRANSFER', 'stock_transfers', 1, '2026-10-27 15:30:00', 'Executed stored procedure sp_execute_stock_transfer: Moved 20 units of SKU ELEC-MCU-001 from Chicago to Seattle.');
