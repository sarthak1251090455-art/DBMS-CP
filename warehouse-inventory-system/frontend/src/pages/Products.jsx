import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Database,
  RefreshCw,
  FolderPlus
} from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  // Form State for Product
  const [formData, setFormData] = useState({
    sku: '',
    product_name: '',
    category_id: '',
    description: '',
    unit_price: '',
    reorder_level: 10,
    unit_of_measure: 'Units'
  });
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State for Category
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (status) params.status = status;

      const [pRes, cRes] = await Promise.all([
        api.get('/products', { params }),
        api.get('/products/categories')
      ]);

      setProducts(pRes.data.products);
      setCategories(cRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId, status]);

  const handleOpenCreate = () => {
    setFormData({
      sku: '',
      product_name: '',
      category_id: categories[0]?.category_id || '',
      description: '',
      unit_price: '',
      reorder_level: 10,
      unit_of_measure: 'Units'
    });
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditId(p.product_id);
    setFormData({
      sku: p.sku,
      product_name: p.product_name,
      category_id: p.category_id,
      description: p.description || '',
      unit_price: p.unit_price,
      reorder_level: p.reorder_level,
      unit_of_measure: p.unit_of_measure,
      status: p.status
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/products', formData);
      setCreateModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.put(`/products/${editId}`, formData);
      setEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', {
        category_name: newCategoryName,
        description: newCategoryDesc
      });
      setCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-cyan-400" />
            <span>Product Catalog & Master Data</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Normalized 3NF product catalog with category classification, pricing, and reorder levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Table Schema & FKs</span>
          </button>
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Add Category</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or specification..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name} ({c.product_count})</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-44">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Product Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-3 px-4 font-semibold text-center">Unit of Measure</th>
                <th className="py-3 px-4 font-semibold text-center">Reorder Threshold</th>
                <th className="py-3 px-4 font-semibold text-center">Total Stored Stock</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 font-sans">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-300">{p.sku}</td>
                    <td className="py-3 px-4 font-sans text-white font-medium">
                      <div>{p.product_name}</div>
                      {p.description && <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{p.category_name}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      ${Number(p.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-slate-300">{p.unit_of_measure}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{p.reorder_level}</td>
                    <td className="py-3 px-4 text-center text-white font-bold">{p.total_available}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Catalog Product (INSERT INTO products)"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU (Unique Key)</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. ELEC-MCU-099"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category (Foreign Key)</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g. High Torque Brushless Motor Driver"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                min="1"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit of Measure</label>
              <input
                type="text"
                required
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                placeholder="Pieces, Units, Sets"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
              placeholder="Technical specs, dimensions, compatibility..."
            ></textarea>
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
              {submitting ? 'Saving to Database...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Catalog Product (UPDATE products)"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
              {formError}
            </div>
          )}

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-400">
            SKU: <span className="text-brand-400 font-bold">{formData.sku}</span> (Immutable Unique Identifier)
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Catalog Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                min="1"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Updating Database...' : 'Update Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Add Product Category (INSERT INTO categories)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Category Name</label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Cleanroom Consumables"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows="3"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="Scope and purpose of this category..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* DBMS Schema Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Relational Entity: products & categories"
        sqlQuery={`CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 10,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'Units',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'discontinued') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_products_sku (sku),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status)
) ENGINE=InnoDB;`}
        acidNotes="Referential integrity: ON DELETE RESTRICT prevents accidental deletion of a category while products are assigned to it. B-Tree index on sku provides O(log n) lookups."
      />
    </div>
  );
}
