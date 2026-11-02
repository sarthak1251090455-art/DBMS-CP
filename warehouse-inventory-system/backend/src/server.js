const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Handlers
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const warehouseRoutes = require('./routes/warehouses');
const inventoryRoutes = require('./routes/inventory');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const salesOrderRoutes = require('./routes/salesOrders');
const stockTransferRoutes = require('./routes/stockTransfers');
const supplierRoutes = require('./routes/suppliers');
const customerRoutes = require('./routes/customers');
const stockMovementRoutes = require('./routes/stockMovements');
const reportRoutes = require('./routes/reports');
const auditLogRoutes = require('./routes/auditLogs');
const dbmsRoutes = require('./routes/dbms');

// API Mount Points
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/stock-transfers', stockTransferRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dbms', dbmsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Warehouse & Inventory Management System API (DBMS Course Project)'
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Warehouse & Inventory Management Backend Running!`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`DBMS Academic Exploration API mounted at /api/dbms`);
  console.log(`====================================================`);
});
