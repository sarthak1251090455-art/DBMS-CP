import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  History,
  Search,
  Filter,
  Calendar,
  Database,
  RefreshCw,
  Warehouse,
  Package
} from 'lucide-react';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [movementType, setMovementType] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // DBMS Inspector Modal
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (movementType) params.movement_type = movementType;
      if (warehouseId) params.warehouse_id = warehouseId;
      if (productId) params.product_id = productId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [mRes, wRes, pRes] = await Promise.all([
        api.get('/stock-movements', { params }),
        api.get('/warehouses'),
        api.get('/products')
      ]);

      setMovements(mRes.data.movements);
      setWarehouses(wRes.data.warehouses);
      setProducts(pRes.data.products);
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [movementType, warehouseId, productId]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Stock Ledger &amp; Movement Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable transaction ledger capturing all physical stock modifications across the enterprise.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Ledger Schema &amp; Indexes</span>
          </button>
          <button
            onClick={fetchMovements}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchMovements(); }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Movement Type */}
          <div>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Movement Types</option>
              <option value="IN">IN (Purchase Receipt)</option>
              <option value="OUT">OUT (Sales Dispatch)</option>
              <option value="TRANSFER_IN">TRANSFER_IN</option>
              <option value="TRANSFER_OUT">TRANSFER_OUT</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Cycle Count)</option>
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Facilities</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>{p.sku} - {p.product_name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Ledger</span>
          </button>
        </form>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Ledger ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">SKU &amp; Product</th>
                <th className="py-3 px-4 font-semibold">Facility</th>
                <th className="py-3 px-4 font-semibold text-center">Quantity</th>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Performed By</th>
                <th className="py-3 px-4 font-semibold">Remarks / Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 font-sans">
                    No ledger transactions found matching the specified parameters.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.movement_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-bold">#{m.movement_id}</td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                      {new Date(m.movement_date).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Badge status={m.movement_type} />
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white font-mono text-brand-300">{m.sku}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{m.product_name}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{m.warehouse_name}</td>
                    <td className={`py-3 px-4 text-center font-bold text-sm ${m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 text-[11px]">
                      {m.reference_type} {m.reference_id ? `#${m.reference_id}` : ''}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{m.performed_by_name}</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px] truncate max-w-xs">{m.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DBMS Ledger Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Relational Ledger Architecture: stock_movements"
        sqlQuery={`CREATE TABLE stock_movements (
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
    CONSTRAINT fk_sm_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_sm_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    CONSTRAINT fk_sm_user FOREIGN KEY (performed_by) REFERENCES users(user_id),
    INDEX idx_sm_product (product_id),
    INDEX idx_sm_warehouse (warehouse_id),
    INDEX idx_sm_date (movement_date),
    INDEX idx_sm_type (movement_type)
) ENGINE=InnoDB;`}
        acidNotes="The stock_movements table serves as an append-only immutable accounting ledger. No record is ever updated or deleted. Reconciliations insert new ADJUSTMENT entries with delta quantities."
      />
    </div>
  );
}
