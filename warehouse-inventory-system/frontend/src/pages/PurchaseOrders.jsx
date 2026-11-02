import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Database,
  RefreshCw,
  Truck,
  ArrowRight
} from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  // Detail Order
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [receivingId, setReceivingId] = useState(null);

  // Create Form State
  const [formSupplier, setFormSupplier] = useState('');
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formOrderDate, setFormOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [formExpectedDate, setFormExpectedDate] = useState('');
  const [formItems, setFormItems] = useState([
    { product_id: '', quantity_ordered: 10, unit_cost: 0.00 }
  ]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [poRes, sRes, wRes, pRes] = await Promise.all([
        api.get('/purchase-orders', { params }),
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/products')
      ]);

      setOrders(poRes.data.purchase_orders);
      setSuppliers(sRes.data.suppliers);
      setWarehouses(wRes.data.warehouses);
      setProducts(pRes.data.products);
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await api.get(`/purchase-orders/${orderId}`);
      setActiveOrder(res.data.purchase_order);
      setActiveItems(res.data.items);
      setDetailModalOpen(true);
    } catch (err) {
      alert('Failed to load order details');
    }
  };

  const handleOpenCreate = () => {
    setFormSupplier(suppliers[0]?.supplier_id || '');
    setFormWarehouse(warehouses[0]?.warehouse_id || '');
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormExpectedDate('');
    setFormItems([{ product_id: products[0]?.product_id || '', quantity_ordered: 20, unit_cost: products[0]?.unit_price || 10.00 }]);
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    setFormItems([
      ...formItems,
      { product_id: products[0]?.product_id || '', quantity_ordered: 10, unit_cost: products[0]?.unit_price || 10.00 }
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...formItems];
    updated[idx][field] = value;
    if (field === 'product_id') {
      const prod = products.find((p) => p.product_id === parseInt(value, 10));
      if (prod) {
        updated[idx].unit_cost = prod.unit_price;
      }
    }
    setFormItems(updated);
  };

  const calculateFormTotal = () => {
    return formItems.reduce((acc, it) => acc + (Number(it.quantity_ordered) || 0) * (Number(it.unit_cost) || 0), 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/purchase-orders', {
        supplier_id: formSupplier,
        warehouse_id: formWarehouse,
        order_date: formOrderDate,
        expected_date: formExpectedDate || null,
        items: formItems
      });
      setCreateModalOpen(false);
      fetchOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm(`Receive and ingest stock for Purchase Order #${orderId}? This executes stored procedure sp_receive_purchase_order and adds units to inventory.`)) {
      return;
    }
    setReceivingId(orderId);
    try {
      await api.post(`/purchase-orders/${orderId}/receive`);
      fetchOrders();
      if (detailModalOpen && activeOrder?.purchase_order_id === orderId) {
        handleOpenDetail(orderId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to receive purchase order.');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-emerald-400" />
            <span>Procurement &amp; Purchase Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inbound purchasing pipeline with automated receipt ingestion via MySQL Stored Procedure <code className="text-cyan-400 font-mono">sp_receive_purchase_order</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect sp_receive_purchase_order</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
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
            <option value="">All Orders ({orders.length})</option>
            <option value="PENDING">Pending</option>
            <option value="ORDERED">Ordered</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">PO Number</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Destination Facility</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-right">Total Cost</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    No purchase orders found matching this criteria.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.purchase_order_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-300">{po.po_number}</td>
                    <td className="py-3 px-4 font-sans text-white font-medium">{po.supplier_name}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{po.warehouse_name}</td>
                    <td className="py-3 px-4 text-slate-400">{po.order_date.split('T')[0]}</td>
                    <td className="py-3 px-4 text-center text-white">{po.total_items} items</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      ${Number(po.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <Badge status={po.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(po.purchase_order_id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          title="View Order Items"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(po.status === 'ORDERED' || po.status === 'PENDING') && (
                          <button
                            onClick={() => handleReceiveOrder(po.purchase_order_id)}
                            disabled={receivingId === po.purchase_order_id}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{receivingId === po.purchase_order_id ? 'Receiving...' : 'Receive Stock'}</span>
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

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Purchase Order (ACID Multi-Item Transaction)"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Supplier (FK: supplier_id)</label>
              <select
                required
                value={formSupplier}
                onChange={(e) => setFormSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Destination Facility (FK: warehouse_id)</label>
              <select
                required
                value={formWarehouse}
                onChange={(e) => setFormWarehouse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Order Date</label>
              <input
                type="date"
                required
                value={formOrderDate}
                onChange={(e) => setFormOrderDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={formExpectedDate}
                onChange={(e) => setFormExpectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-white">Purchase Order Items (purchase_order_items)</label>
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
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity_ordered}
                      onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center text-xs"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Unit Cost"
                      value={item.unit_cost}
                      onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-right text-xs"
                    />
                  </div>
                  <div className="w-24 font-mono text-right text-emerald-400 font-bold text-xs pr-1">
                    ${((Number(item.quantity_ordered) || 0) * (Number(item.unit_cost) || 0)).toFixed(2)}
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

            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center font-mono">
              <span className="text-slate-400 text-xs">Total Order Commitment:</span>
              <span className="text-emerald-400 font-bold text-base">${calculateFormTotal().toFixed(2)}</span>
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
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Creating Order in Transaction...' : 'Submit Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={activeOrder ? `Purchase Order ${activeOrder.po_number}` : 'Order Details'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Supplier</span>
              <span className="text-white font-bold">{activeOrder?.supplier_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Destination Hub</span>
              <span className="text-cyan-400 font-bold">{activeOrder?.warehouse_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Created By</span>
              <span className="text-slate-200">{activeOrder?.created_by_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Status</span>
              <Badge status={activeOrder?.status} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Order Line Items</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Ordered</th>
                    <th className="py-2.5 px-3 text-center">Received</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeItems.map((item) => (
                    <tr key={item.purchase_item_id}>
                      <td className="py-2 px-3 text-brand-400 font-bold">{item.sku}</td>
                      <td className="py-2 px-3 text-white font-sans">{item.product_name}</td>
                      <td className="py-2 px-3 text-center text-white">{item.quantity_ordered}</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold">{item.quantity_received}</td>
                      <td className="py-2 px-3 text-right text-slate-300">${Number(item.unit_cost).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right font-mono text-sm">
              <span className="text-slate-400 mr-2">Order Total:</span>
              <span className="text-emerald-400 font-bold">${Number(activeOrder?.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {(activeOrder?.status === 'ORDERED' || activeOrder?.status === 'PENDING') && (
              <button
                onClick={() => handleReceiveOrder(activeOrder.purchase_order_id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Receipt Ingestion (sp_receive_purchase_order)</span>
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
        operationTitle="Stored Procedure: sp_receive_purchase_order"
        procedureName="sp_receive_purchase_order"
        parameters={{ p_purchase_order_id: 1, p_performed_by: 2 }}
        sqlQuery={`CREATE PROCEDURE sp_receive_purchase_order (
    IN p_purchase_order_id INT,
    IN p_performed_by INT
)
BEGIN
    -- ACID Transaction with FOR UPDATE lock on purchase_orders
    START TRANSACTION;
    -- Reads all purchase_order_items via CURSOR
    -- Upserts inventory table with ON DUPLICATE KEY UPDATE quantity_available = quantity_available + qty
    -- Inserts immutable ledger entry into stock_movements (movement_type = 'IN')
    -- Updates purchase_orders status = 'RECEIVED'
    -- Inserts into audit_logs
    COMMIT;
END;`}
        acidNotes="Using a server-side cursor ensures every line item is ingested atomically. If any error or constraint violation occurs mid-process, the entire transaction is rolled back, preventing orphaned inventory."
      />
    </div>
  );
}
