# Warehouse & Inventory Management System (DBMS Course Project)

A centralized, enterprise-grade **Warehouse & Inventory Management System** built for college DBMS course evaluations, project vivas, and real-world warehouse operations.

This application is architected around a normalized **MySQL 8.0 (InnoDB)** relational database, utilizing **ACID Transactions**, **Stored Procedures**, **Relational Views**, **B-Tree Indexes**, and **Foreign Key Referential Integrity Constraints**.

---

## 🏛️ System Architecture

- **Database**: MySQL 8.0+ Community Server (InnoDB Storage Engine, `utf8mb4_unicode_ci`)
- **Backend API**: Node.js & Express.js (REST API, Connection Pooling with `mysql2`, JWT Authentication, Bcrypt Password Hashing, Centralized Error Handling)
- **Frontend Dashboard**: React.js 18 + Vite, Tailwind CSS, React Router v6, Axios, Recharts Data Visualizations, Lucide React Icons

---

## 💾 Relational Database Design (DBMS Academic Focus)

### 1. Database Normalization (3NF / BCNF)
- **1NF (First Normal Form)**: All attributes are atomic (no repeating groups or multi-valued columns).
- **2NF (Second Normal Form)**: All non-key attributes are fully functionally dependent on the primary keys.
- **3NF (Third Normal Form)**: No transitive dependencies; non-key attributes depend solely on candidate keys.
- **Relational Integrity**: Enforced via cascading and restricted foreign keys (`ON DELETE RESTRICT`, `ON UPDATE CASCADE`).
- **Composite Unique Constraints**: `uq_product_warehouse UNIQUE (product_id, warehouse_id)` ensures a product is uniquely tracked per facility.
- **CHECK Constraints**: `quantity_available >= 0` ensures negative stock is physically impossible at the database level.

### 2. Schema Entities (16 Normalized Tables)
1. `users` — Enterprise user accounts and RBAC permissions.
2. `categories` — Product classifications.
3. `products` — Product catalog with SKU unique keys, pricing, and reorder levels.
4. `warehouses` — Physical distribution centers and logistics hubs.
5. `storage_locations` — Sub-zones, aisles, and rack positions within warehouses.
6. `suppliers` — Inbound vendor procurement partners.
7. `customers` — Outbound fulfillment clients.
8. `inventory` — Central stock records mapped to `(product_id, warehouse_id)`.
9. `purchase_orders` — Inbound procurement order headers.
10. `purchase_order_items` — Procurement line items with costs and quantities.
11. `sales_orders` — Customer sales order headers.
12. `sales_order_items` — Customer sales line items with prices and subtotals.
13. `stock_movements` — Append-only immutable stock ledger tracking every transaction.
14. `stock_transfers` — Inter-warehouse stock reallocation transfer headers.
15. `stock_transfer_items` — Transferred SKUs and quantities.
16. `audit_logs` — Forensic security audit trail of all database actions.

### 3. Relational Database Views
- **`view_inventory_summary`**: Joins products, categories, warehouses, and storage locations to present net free stock, reorder status, and valuation.
- **`view_low_stock_alerts`**: Computes deficit stock quantities where `quantity_available <= reorder_level`.
- **`view_warehouse_capacity_utilization`**: Aggregates unique SKUs, total stored units, reserved stock, and total asset valuation per facility.
- **`view_recent_stock_activity`**: Formatted stock movements join product SKUs, facilities, and actor user names.

### 4. Stored Procedures with ACID Transactions
- **`sp_receive_purchase_order(po_id, user_id)`**:
  Atomic inbound receipt. Uses a cursor to iterate through order items, updates `purchase_order_items.quantity_received`, upserts `inventory`, creates `IN` entries in `stock_movements`, updates status to `RECEIVED`, and logs to `audit_logs` within `START TRANSACTION / COMMIT`.
- **`sp_dispatch_sales_order(so_id, user_id)`**:
  Atomic outbound fulfillment. Uses `SELECT ... FOR UPDATE` row locks to guarantee sufficient stock before deducting inventory, prevents race conditions, registers `OUT` movements, and updates status to `DISPATCHED`.
- **`sp_execute_stock_transfer(transfer_id, user_id)`**:
  Two-phase inter-warehouse transfer protocol. Deducts stock from source warehouse, credits destination warehouse, and registers balanced `TRANSFER_OUT` and `TRANSFER_IN` ledger movements.
- **`sp_adjust_inventory(product_id, warehouse_id, new_quantity, reason, user_id)`**:
  Cycle count reconciliation. Computes delta, updates on-hand stock, and registers `ADJUSTMENT` movement.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+ and npm installed
- MySQL 8.0+ Community Server or MySQL Workbench

### 1. Database Configuration
The database connection is configured in `backend/.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=warehouse_db
JWT_SECRET=supersecretjwtkey_warehouse_inventory_management_system_2026
```
*(If connecting to your local default MySQL service on port 3306, set `DB_PORT=3306` and provide your MySQL root password).*

### 2. Initialize Database & Seed Sample Data
From the `backend` directory:
```bash
npm run db:init     # Executes database/schema.sql (16 tables, 4 views, 4 stored procedures)
npm run db:seed     # Inserts rich demo catalog, warehouses, stock, and orders
```

### 3. Start Backend Server
```bash
npm run dev         # Starts backend API on http://localhost:5000
```

### 4. Start Frontend Application
From the `frontend` directory:
```bash
npm run dev         # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Default Academic Demo User Accounts

All demo accounts share the password: `admin123`

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@warehouse.com` | `admin123` | Full system control, catalog management, audit logs, DBMS console |
| **Warehouse Manager** | `manager@warehouse.com` | `admin123` | Inventory control, inter-warehouse transfers, procurement |
| **Inventory Clerk** | `clerk@warehouse.com` | `admin123` | Physical count adjustments, PO stock receiving |
| **Sales Representative** | `sales@warehouse.com` | `admin123` | Customer sales orders creation and fulfillment dispatch |

*(Quick-switch login buttons are embedded right on the login screen for rapid presentation!)*

---

## 🖥️ Live DBMS Inspector Features

- **Live Tables Explorer**: Inspect exact column types, nullable flags, primary keys, and index structures.
- **Foreign Key Dependency Map**: View parent-child relationships and referential actions.
- **Stored Procedure Inspector**: Review complete SQL routines, cursors, exception handlers, and ACID properties.
- **Real-Time Query Telemetry**: View live SQL queries executed by the application with sub-millisecond latency tracking.
- **Interactive EXPLAIN Query Analyzer**: Run MySQL `EXPLAIN <select>` right from the UI to demonstrate query optimization.
