import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import PurchaseOrders from './pages/PurchaseOrders';
import SalesOrders from './pages/SalesOrders';
import StockTransfers from './pages/StockTransfers';
import StockMovements from './pages/StockMovements';
import SuppliersCustomers from './pages/SuppliersCustomers';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import DBMSConsole from './pages/DBMSConsole';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs font-mono text-cyan-400">
        Connecting to MySQL 8.0 &amp; initializing session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedLayout>
                <Inventory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedLayout>
                <Products />
              </ProtectedLayout>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedLayout>
                <Warehouses />
              </ProtectedLayout>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedLayout>
                <PurchaseOrders />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales-orders"
            element={
              <ProtectedLayout>
                <SalesOrders />
              </ProtectedLayout>
            }
          />
          <Route
            path="/stock-transfers"
            element={
              <ProtectedLayout>
                <StockTransfers />
              </ProtectedLayout>
            }
          />
          <Route
            path="/stock-movements"
            element={
              <ProtectedLayout>
                <StockMovements />
              </ProtectedLayout>
            }
          />
          <Route
            path="/partners"
            element={
              <ProtectedLayout>
                <SuppliersCustomers />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedLayout>
                <AuditLogs />
              </ProtectedLayout>
            }
          />
          <Route
            path="/dbms-console"
            element={
              <ProtectedLayout>
                <DBMSConsole />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
