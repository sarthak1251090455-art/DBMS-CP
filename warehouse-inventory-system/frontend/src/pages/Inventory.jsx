import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import { useLocation } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Database,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';

export default function Inventory() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') === 'low_stock' ? 'LOW_STOCK' : '';

  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState(initialFilter);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // DBMS Inspector Modal
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (warehouseId) params.warehouse_id = warehouseId;
      if (categoryId) params.category_id = categoryId;
      if (stockStatus) params.stock_status = stockStatus;

      const [invRes, whRes, catRes] = await Promise.all([
        api.get('/inventory', { params }),
        api.get('/warehouses'),
        api.get('/products/categories')
      ]);

      setInventory(invRes.data.inventory);
      setWarehouses(whRes.data.warehouses);
      setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [warehouseId, categoryId, stockStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity_available);
    setAdjustReason('Physical cycle count reconciliation');
    setAdjustError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');
    setAdjustSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        product_id: selectedItem.product_id,
        warehouse_id: selectedItem.warehouse_id,
        new_quantity: parseInt(newQuantity, 10),
        reason: adjustReason
      });
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust inventory stock.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Boxes className="w-7 h-7 text-brand-400" />
            <span>Live Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data sourced directly from MySQL View: <code className="text-cyan-400 font-mono">view_inventory_summary</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect View & Stored Procedure</span>
          </button>
          <button
            onClick={fetchInventory}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or warehouse..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Warehouse Filter */}
          <div className="w-full md:w-48">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (Alert)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Product SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Warehouse</th>
                <th className="py-3 px-4 font-semibold">Bin / Rack Code</th>
                <th className="py-3 px-4 font-semibold text-center">Available</th>
                <th className="py-3 px-4 font-semibold text-center">Reserved</th>
                <th className="py-3 px-4 font-semibold text-center">Net Free</th>
                <th className="py-3 px-4 font-semibold text-center">Reorder Threshold</th>
                <th className="py-3 px-4 font-semibold text-right">Valuation</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-400">
                    No inventory records match the selected criteria.
                  </td>
                </tr>
              ) : (
                inventory.map((row) => (
                  <tr key={row.inventory_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{row.sku}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{row.product_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{row.category_name}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{row.warehouse_name}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {row.location_code || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {row.quantity_available}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400">
                      {row.quantity_reserved}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-400 font-semibold">
                      {row.net_available}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {row.reorder_level}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">
                      ${Number(row.total_valuation).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={row.stock_status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenAdjust(row)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 hover:border-brand-500/40 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust Inventory Stock (sp_adjust_inventory)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          {adjustError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
              {adjustError}
            </div>
          )}

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono">
            <div className="text-slate-400">Product: <span className="text-white font-semibold">{selectedItem?.sku} - {selectedItem?.product_name}</span></div>
            <div className="text-slate-400">Warehouse: <span className="text-cyan-400 font-semibold">{selectedItem?.warehouse_name}</span></div>
            <div className="text-slate-400">Current On-Hand Stock: <span className="text-emerald-400 font-bold">{selectedItem?.quantity_available} units</span></div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">New Physical Count (Quantity Available)</label>
            <input
              type="number"
              min="0"
              required
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Audit Reconciliation Reason</label>
            <textarea
              rows="3"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Physical inventory cycle count, damage report, shrinkage..."
            ></textarea>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300/90 text-[11px] leading-relaxed">
            <strong>DBMS Transaction Note:</strong> Submitting calls the stored procedure <code className="font-mono text-white">sp_adjust_inventory</code>, locks the row with <code className="font-mono text-white">FOR UPDATE</code>, updates <code className="font-mono text-white">inventory</code>, creates an <code className="font-mono text-white">ADJUSTMENT</code> entry in <code className="font-mono text-white">stock_movements</code>, and logs to <code className="font-mono text-white">audit_logs</code>.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustSubmitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {adjustSubmitting ? 'Executing sp_adjust_inventory...' : 'Apply Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DBMS View Inspector Modal */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Relational View: view_inventory_summary"
        sqlQuery={`CREATE VIEW view_inventory_summary AS
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
LEFT JOIN storage_locations sl ON i.location_id = sl.location_id;`}
        acidNotes="This view joins 5 relational tables (inventory, products, categories, warehouses, storage_locations) and dynamically calculates net available stock and low-stock threshold state without redundant columns."
      />
    </div>
  );
}
