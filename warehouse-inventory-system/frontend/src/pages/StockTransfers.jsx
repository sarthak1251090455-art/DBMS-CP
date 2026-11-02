import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  Trash2,
  Database,
  RefreshCw,
  Warehouse,
  ArrowRight
} from 'lucide-react';

export default function StockTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  // Detail Transfer
  const [activeTransfer, setActiveTransfer] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [completingId, setCompletingId] = useState(null);

  // Form State
  const [sourceWh, setSourceWh] = useState('');
  const [destWh, setDestWh] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formItems, setFormItems] = useState([{ product_id: '', quantity: 10 }]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [trRes, whRes, pRes] = await Promise.all([
        api.get('/stock-transfers', { params }),
        api.get('/warehouses'),
        api.get('/products')
      ]);

      setTransfers(trRes.data.transfers);
      setWarehouses(whRes.data.warehouses);
      setProducts(pRes.data.products);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    const src = warehouses[0]?.warehouse_id || '';
    const dst = warehouses[1]?.warehouse_id || warehouses[0]?.warehouse_id || '';
    setSourceWh(src);
    setDestWh(dst);
    setRemarks('');
    setFormItems([{ product_id: products[0]?.product_id || '', quantity: 10 }]);
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleOpenDetail = async (transferId) => {
    try {
      const res = await api.get(`/stock-transfers/${transferId}`);
      setActiveTransfer(res.data.transfer);
      setActiveItems(res.data.items);
      setDetailModalOpen(true);
    } catch (err) {
      alert('Failed to load transfer details');
    }
  };

  const handleAddItemRow = () => {
    setFormItems([...formItems, { product_id: products[0]?.product_id || '', quantity: 10 }]);
  };

  const handleRemoveItemRow = (idx) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...formItems];
    updated[idx][field] = value;
    setFormItems(updated);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (sourceWh === destWh) {
      setFormError('Source and destination warehouse cannot be the same facility (chk_st_diff_wh constraint).');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/stock-transfers', {
        source_warehouse_id: sourceWh,
        destination_warehouse_id: destWh,
        remarks,
        items: formItems
      });
      setCreateModalOpen(false);
      fetchTransfers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to initiate transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransfer = async (transferId) => {
    if (!window.confirm(`Complete Stock Transfer #${transferId}? This executes stored procedure sp_execute_stock_transfer, moving inventory across warehouses.`)) {
      return;
    }
    setCompletingId(transferId);
    try {
      await api.post(`/stock-transfers/${transferId}/complete`);
      fetchTransfers();
      if (detailModalOpen && activeTransfer?.transfer_id === transferId) {
        handleOpenDetail(transferId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute transfer.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ArrowLeftRight className="w-7 h-7 text-amber-400" />
            <span>Inter-Warehouse Stock Transfers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Two-phase stock transfer protocol executed atomically via <code className="text-cyan-400 font-mono">sp_execute_stock_transfer</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect sp_execute_stock_transfer</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Transfer</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Transfers ({transfers.length})</option>
            <option value="PENDING">Pending</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          onClick={fetchTransfers}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Transfer Number</th>
                <th className="py-3 px-4 font-semibold">Source Hub</th>
                <th className="py-3 px-4 font-semibold">Destination Hub</th>
                <th className="py-3 px-4 font-semibold">Transfer Date</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-sans">
                    No stock transfers recorded.
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.transfer_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-amber-300">{tr.transfer_number}</td>
                    <td className="py-3 px-4 font-sans text-white font-medium">{tr.source_warehouse_name}</td>
                    <td className="py-3 px-4 font-sans text-cyan-300 font-medium">{tr.destination_warehouse_name}</td>
                    <td className="py-3 px-4 text-slate-400">{tr.transfer_date.split('T')[0]}</td>
                    <td className="py-3 px-4 text-center text-white">{tr.total_items} items</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <Badge status={tr.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(tr.transfer_id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          title="View Transfer Items"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(tr.status === 'PENDING' || tr.status === 'IN_TRANSIT') && (
                          <button
                            onClick={() => handleCompleteTransfer(tr.transfer_id)}
                            disabled={completingId === tr.transfer_id}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{completingId === tr.transfer_id ? 'Executing...' : 'Complete Transfer'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transfer Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initiate Stock Transfer (stock_transfers)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Source Facility (Outbound)</label>
              <select
                required
                value={sourceWh}
                onChange={(e) => setSourceWh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Destination Facility (Inbound)</label>
              <select
                required
                value={destWh}
                onChange={(e) => setDestWh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Transfer Remarks / Reason</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Regional inventory balance rebalancing"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Transfer Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-white">Transfer Items (stock_transfer_items)</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-lg text-[11px]"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    >
                      {products.map((p) => (
                        <option key={p.product_id} value={p.product_id}>{p.sku} - {p.product_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center text-xs"
                    />
                  </div>
                  {formItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Creating Transfer Order...' : 'Submit Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={activeTransfer ? `Stock Transfer ${activeTransfer.transfer_number}` : 'Transfer Details'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Source Facility</span>
              <span className="text-white font-bold">{activeTransfer?.source_warehouse_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Destination Facility</span>
              <span className="text-cyan-400 font-bold">{activeTransfer?.destination_warehouse_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Created By</span>
              <span className="text-slate-200">{activeTransfer?.created_by_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Status</span>
              <Badge status={activeTransfer?.status} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Transferred Product Items</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Transfer Qty</th>
                    <th className="py-2.5 px-3 text-center">Source Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeItems.map((item) => (
                    <tr key={item.transfer_item_id}>
                      <td className="py-2 px-3 text-amber-400 font-bold">{item.sku}</td>
                      <td className="py-2 px-3 text-white font-sans">{item.product_name}</td>
                      <td className="py-2 px-3 text-center text-white font-bold">{item.quantity}</td>
                      <td className="py-2 px-3 text-center text-cyan-400">{item.source_stock_available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {(activeTransfer?.status === 'PENDING' || activeTransfer?.status === 'IN_TRANSIT') && (
              <button
                onClick={() => handleCompleteTransfer(activeTransfer.transfer_id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Transfer Across Warehouses (sp_execute_stock_transfer)</span>
              </button>
            )}
            <button
              onClick={() => setDetailModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Stored Procedure Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Stored Procedure: sp_execute_stock_transfer"
        procedureName="sp_execute_stock_transfer"
        parameters={{ p_transfer_id: 1, p_performed_by: 2 }}
        sqlQuery={`CREATE PROCEDURE sp_execute_stock_transfer (
    IN p_transfer_id INT,
    IN p_performed_by INT
)
BEGIN
    -- 1. Checks source stock availability with FOR UPDATE
    -- 2. Deducts from source: UPDATE inventory SET quantity_available = quantity_available - qty WHERE warehouse_id = v_src_wh
    -- 3. Upserts destination: INSERT INTO inventory ... ON DUPLICATE KEY UPDATE quantity_available = quantity_available + qty
    -- 4. Inserts 'TRANSFER_OUT' into stock_movements for source warehouse
    -- 5. Inserts 'TRANSFER_IN' into stock_movements for destination warehouse
    -- 6. Updates stock_transfers status = 'COMPLETED'
    COMMIT;
END;`}
        acidNotes="Two-phase warehouse inventory ledger execution: atomically handles both outbound subtraction and inbound addition with balanced audit movements."
      />
    </div>
  );
}
