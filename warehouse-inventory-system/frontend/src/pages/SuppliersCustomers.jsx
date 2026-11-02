import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  ShoppingBag,
  Truck,
  Database,
  RefreshCw
} from 'lucide-react';

export default function SuppliersCustomers() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [supplierModal, setSupplierModal] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  // Supplier Form
  const [supForm, setSupForm] = useState({
    supplier_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  // Customer Form
  const [custForm, setCustForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/customers')
      ]);
      setSuppliers(sRes.data.suppliers);
      setCustomers(cRes.data.customers);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', supForm);
      setSupplierModal(false);
      setSupForm({ supplier_name: '', contact_person: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create supplier.');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', custForm);
      setCustomerModal(false);
      setCustForm({ customer_name: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-brand-400" />
            <span>Commercial Partners: Suppliers &amp; Customers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Entities representing external supply chains and customer distribution networks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Partner Schemas &amp; FKs</span>
          </button>
          {activeTab === 'suppliers' ? (
            <button
              onClick={() => setSupplierModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          ) : (
            <button
              onClick={() => setCustomerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'suppliers' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Suppliers ({suppliers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'customers' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers ({customers.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'suppliers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s.supplier_id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{s.supplier_name}</h3>
                  <p className="text-xs text-brand-400 mt-0.5 font-medium">Contact: {s.contact_person || 'Unspecified'}</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  ID #{s.supplier_id}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-400">{s.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-400">{s.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate text-slate-400">{s.address || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total POs Fulfilled: <strong className="text-white">{s.total_orders}</strong></span>
                <span className="text-emerald-400 font-bold">${Number(s.total_spent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map((c) => (
            <div key={c.customer_id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{c.customer_name}</h3>
                  <p className="text-xs text-emerald-400 mt-0.5 font-mono">Customer Account #{c.customer_id}</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  ID #{c.customer_id}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-400">{c.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-400">{c.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate text-slate-400">{c.address || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total Sales Orders: <strong className="text-white">{c.total_orders}</strong></span>
                <span className="text-emerald-400 font-bold">${Number(c.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      <Modal
        isOpen={supplierModal}
        onClose={() => setSupplierModal(false)}
        title="Register Supplier (INSERT INTO suppliers)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Company / Supplier Name</label>
            <input
              type="text"
              required
              value={supForm.supplier_name}
              onChange={(e) => setSupForm({ ...supForm, supplier_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Contact Representative</label>
            <input
              type="text"
              value={supForm.contact_person}
              onChange={(e) => setSupForm({ ...supForm, contact_person: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email</label>
              <input
                type="email"
                value={supForm.email}
                onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone</label>
              <input
                type="text"
                value={supForm.phone}
                onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Billing / Dispatch Address</label>
            <textarea
              rows="3"
              value={supForm.address}
              onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSupplierModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={customerModal}
        onClose={() => setCustomerModal(false)}
        title="Register Customer (INSERT INTO customers)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Customer / Enterprise Name</label>
            <input
              type="text"
              required
              value={custForm.customer_name}
              onChange={(e) => setCustForm({ ...custForm, customer_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={custForm.email}
                onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={custForm.phone}
                onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Delivery / Shipping Address</label>
            <textarea
              rows="3"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCustomerModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* DBMS Schema Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Relational Tables: suppliers & customers"
        sqlQuery={`CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_suppliers_name (supplier_name)
) ENGINE=InnoDB;

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_name (customer_name)
) ENGINE=InnoDB;`}
        acidNotes="Referential integrity: purchase_orders references suppliers(supplier_id) and sales_orders references customers(customer_id) with ON DELETE RESTRICT to preserve historic order integrity."
      />
    </div>
  );
}
