import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Database,
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
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
  const [dispatchingId, setDispatchingId] = useState(null);

  // Create Form State
  const [formCustomer, setFormCustomer] = useState('');
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formOrderDate, setFormOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [formItems, setFormItems] = useState([
    { product_id: '', quantity: 5, unit_price: 0.00 }
  ]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [soRes, cRes, wRes, pRes] = await Promise.all([
        api.get('/sales-orders', { params }),
        api.get('/customers'),
        api.get('/warehouses'),
        api.get('/products')
      ]);

      setOrders(soRes.data.sales_orders);
      setCustomers(cRes.data.customers);
      setWarehouses(wRes.data.warehouses);
      setProducts(pRes.data.products);
    } catch (err) {
      console.error('Failed to fetch sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await api.get(`/sales-orders/${orderId}`);
      setActiveOrder(res.data.sales_order);
      setActiveItems(res.data.items);
      setDetailModalOpen(true);
    } catch (err) {
      alert('Failed to load order details');
    }
  };

  const handleOpenCreate = () => {
    setFormCustomer(customers[0]?.customer_id || '');
    setFormWarehouse(warehouses[0]?.warehouse_id || '');
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormItems([{ product_id: products[0]?.product_id || '', quantity: 5, unit_price: products[0]?.unit_price || 20.00 }]);
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    setFormItems([
      ...formItems,
      { product_id: products[0]?.product_id || '', quantity: 5, unit_price: products[0]?.unit_price || 20.00 }
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
        updated[idx].unit_price = prod.unit_price;
      }
    }
    setFormItems(updated);
  };

  const calculateFormTotal = () => {
    return formItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/sales-orders', {
        customer_id: formCustomer,
        warehouse_id: formWarehouse,
        order_date: formOrderDate,
        items: formItems
      });
      setCreateModalOpen(false);
      fetchOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create sales order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchOrder = async (orderId) => {
    if (!window.confirm(`Dispatch and deduct inventory for Sales Order #${orderId}? This executes stored procedure sp_dispatch_sales_order with ACID validation.`)) {
      return;
    }
    setDispatchingId(orderId);
    try {
      await api.post(`/sales-orders/${orderId}/dispatch`);
      fetchOrders();
      if (detailModalOpen && activeOrder?.sales_order_id === orderId) {
        handleOpenDetail(orderId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch sales order.');
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-cyan-400" />
            <span>Sales Orders &amp; Fulfillment</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Outbound fulfillment pipeline executing atomic stock deductions via <code className="text-cyan-400 font-mono">sp_dispatch_sales_order</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect sp_dispatch_sales_order</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Order</span>
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
            <option value="CONFIRMED">Confirmed</option>
            <option value="DISPATCHED">Dispatched</option>
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

      {/* Sales Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">SO Number</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Origin Warehouse</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-right">Order Revenue</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    No sales orders found matching this criteria.
                  </td>
                </tr>
              ) : (
                orders.map((so) => (
                  <tr key={so.sales_order_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-cyan-300">{so.so_number}</td>
                    <td className="py-3 px-4 font-sans text-white font-medium">{so.customer_name}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{so.warehouse_name}</td>
                    <td className="py-3 px-4 text-slate-400">{so.order_date.split('T')[0]}</td>
                    <td className="py-3 px-4 text-center text-white">{so.total_items} items</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      ${Number(so.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <Badge status={so.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(so.sales_order_id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(so.status === 'CONFIRMED' || so.status === 'PENDING') && (
                          <button
                            onClick={() => handleDispatchOrder(so.sales_order_id)}
                            disabled={dispatchingId === so.sales_order_id}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{dispatchingId === so.sales_order_id ? 'Dispatching...' : 'Dispatch'}</span>
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

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Customer Sales Order (sales_orders)"
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
              <label className="block text-slate-300 font-medium mb-1">Customer (FK: customer_id)</label>
              <select
                required
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Fulfillment Origin (FK: warehouse_id)</label>
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

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-white">Sales Order Items (sales_order_items)</label>
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
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center text-xs"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-right text-xs"
                    />
                  </div>
                  <div className="w-24 font-mono text-right text-emerald-400 font-bold text-xs pr-1">
                    ${((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}
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
              <span className="text-slate-400 text-xs">Total Sales Invoice:</span>
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Creating Sales Order...' : 'Confirm Sales Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={activeOrder ? `Sales Order ${activeOrder.so_number}` : 'Order Details'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Customer</span>
              <span className="text-white font-bold">{activeOrder?.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Dispatch Facility</span>
              <span className="text-cyan-400 font-bold">{activeOrder?.warehouse_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Order Date</span>
              <span className="text-slate-200">{activeOrder?.order_date?.split('T')[0]}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Status</span>
              <Badge status={activeOrder?.status} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Order Line Items &amp; Stock Availability</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Ordered</th>
                    <th className="py-2.5 px-3 text-center">Facility Stock</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeItems.map((item) => (
                    <tr key={item.sales_item_id}>
                      <td className="py-2 px-3 text-brand-400 font-bold">{item.sku}</td>
                      <td className="py-2 px-3 text-white font-sans">{item.product_name}</td>
                      <td className="py-2 px-3 text-center text-white">{item.quantity}</td>
                      <td className={`py-2 px-3 text-center font-bold ${item.current_warehouse_stock >= item.quantity ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.current_warehouse_stock}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right font-mono text-sm">
              <span className="text-slate-400 mr-2">Total Amount:</span>
              <span className="text-emerald-400 font-bold">${Number(activeOrder?.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {(activeOrder?.status === 'CONFIRMED' || activeOrder?.status === 'PENDING') && (
              <button
                onClick={() => handleDispatchOrder(activeOrder.sales_order_id)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Execute Dispatch (sp_dispatch_sales_order)</span>
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
        operationTitle="Stored Procedure: sp_dispatch_sales_order"
        procedureName="sp_dispatch_sales_order"
        parameters={{ p_sales_order_id: 1, p_performed_by: 3 }}
        sqlQuery={`CREATE PROCEDURE sp_dispatch_sales_order (
    IN p_sales_order_id INT,
    IN p_performed_by INT
)
BEGIN
    -- 1. Locks sales_order row with FOR UPDATE
    -- 2. Checks inventory availability for ALL items first; raises SQLSTATE '45000' if stock is insufficient
    -- 3. Atomic deduction: UPDATE inventory SET quantity_available = quantity_available - qty
    -- 4. Inserts into stock_movements (movement_type = 'OUT')
    -- 5. Updates sales_orders status = 'DISPATCHED'
    -- 6. Logs event in audit_logs
    COMMIT;
END;`}
        acidNotes="Pre-verifies inventory sufficiency using SELECT ... FOR UPDATE locks to prevent negative inventory balances and concurrent race conditions."
      />
    </div>
  );
}
