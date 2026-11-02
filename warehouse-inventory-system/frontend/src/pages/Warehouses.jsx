import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Modal from '../components/Modal';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  Warehouse,
  Plus,
  MapPin,
  User,
  Phone,
  Package,
  Boxes,
  Database,
  RefreshCw,
  FolderTree,
  ChevronRight
} from 'lucide-react';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createWhModal, setCreateWhModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  // Selected warehouse for detail view
  const [selectedWh, setSelectedWh] = useState(null);
  const [whDetailData, setWhDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Warehouse Form State
  const [whForm, setWhForm] = useState({
    warehouse_name: '',
    location: '',
    manager_name: '',
    contact_number: ''
  });

  // Location Form State
  const [locForm, setLocForm] = useState({
    location_code: '',
    description: ''
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.warehouses);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenDetails = async (w) => {
    setSelectedWh(w);
    setDetailLoading(true);
    setDetailModal(true);
    try {
      const res = await api.get(`/warehouses/${w.warehouse_id}`);
      setWhDetailData(res.data);
    } catch (err) {
      console.error('Failed to fetch warehouse details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warehouses', whForm);
      setCreateWhModal(false);
      setWhForm({ warehouse_name: '', location: '', manager_name: '', contact_number: '' });
      fetchWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create warehouse.');
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/warehouses/${selectedWh.warehouse_id}/locations`, locForm);
      setLocationModal(false);
      setLocForm({ location_code: '', description: '' });
      handleOpenDetails(selectedWh);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add location.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Warehouse className="w-7 h-7 text-brand-400" />
            <span>Warehouses & Storage Facilities</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-facility inventory control with location hierarchy (Warehouses &rarr; Storage Locations &rarr; Bins).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Facility View & DDL</span>
          </button>
          <button
            onClick={() => setCreateWhModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((w) => (
          <div
            key={w.warehouse_id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400">
                  <Warehouse className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  ID #{w.warehouse_id}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white tracking-tight">{w.warehouse_name}</h3>
              
              <div className="mt-2 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{w.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Manager: <strong className="text-slate-300 font-medium">{w.manager_name || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{w.contact_number || 'N/A'}</span>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="mt-5 grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Stored Units</span>
                  <span className="text-white font-bold text-sm">{w.total_units_stored}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Unique SKUs</span>
                  <span className="text-cyan-400 font-bold text-sm">{w.total_unique_skus}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">Total Valuation:</span>
                  <span className="text-emerald-400 font-bold">${Number(w.total_inventory_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenDetails(w)}
              className="mt-5 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Manage Bins & Stock</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Warehouse Detail & Location Drilldown Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title={selectedWh ? `${selectedWh.warehouse_name} - Facility Architecture` : 'Facility Details'}
        maxWidth="max-w-4xl"
      >
        {detailLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading facility relational structure...</div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Top Facility Meta */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between gap-4 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Facility Location</span>
                <span className="text-white font-semibold">{whDetailData?.warehouse?.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Facility Manager</span>
                <span className="text-cyan-400 font-semibold">{whDetailData?.warehouse?.manager_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Emergency Line</span>
                <span className="text-slate-200">{whDetailData?.warehouse?.contact_number}</span>
              </div>
            </div>

            {/* Storage Locations (Aisles / Racks) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-brand-400" />
                  <span>Storage Locations &amp; Bins (storage_locations Table)</span>
                </h4>
                <button
                  onClick={() => setLocationModal(true)}
                  className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg text-[11px] font-medium"
                >
                  + Add Bin Location
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {whDetailData?.storage_locations?.map((loc) => (
                  <div key={loc.location_id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                    <div className="text-cyan-400 font-bold text-xs">{loc.location_code}</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">{loc.description || 'No description'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Stock in Facility */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Inventory Stored In This Facility</span>
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Assigned Bin</th>
                      <th className="py-2.5 px-3 text-center">Available</th>
                      <th className="py-2.5 px-3 text-center">Reserved</th>
                      <th className="py-2.5 px-3 text-right">Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {whDetailData?.inventory?.map((inv) => (
                      <tr key={inv.inventory_id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-brand-300 font-semibold">{inv.sku}</td>
                        <td className="py-2 px-3 text-white font-sans">{inv.product_name}</td>
                        <td className="py-2 px-3 text-cyan-400">{inv.location_code || 'Unassigned'}</td>
                        <td className="py-2 px-3 text-center text-emerald-400 font-bold">{inv.quantity_available}</td>
                        <td className="py-2 px-3 text-center text-amber-400">{inv.quantity_reserved}</td>
                        <td className="py-2 px-3 text-right text-slate-300">${Number(inv.valuation).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={createWhModal}
        onClose={() => setCreateWhModal(false)}
        title="Add New Warehouse Facility (INSERT INTO warehouses)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Warehouse Name</label>
            <input
              type="text"
              required
              value={whForm.warehouse_name}
              onChange={(e) => setWhForm({ ...whForm, warehouse_name: e.target.value })}
              placeholder="e.g. Great Lakes Distribution Facility"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Physical Address / Location</label>
            <input
              type="text"
              required
              value={whForm.location}
              onChange={(e) => setWhForm({ ...whForm, location: e.target.value })}
              placeholder="City, State, Zip, Street"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Facility Manager Name</label>
            <input
              type="text"
              value={whForm.manager_name}
              onChange={(e) => setWhForm({ ...whForm, manager_name: e.target.value })}
              placeholder="e.g. Sandra Bullock"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
            <input
              type="text"
              value={whForm.contact_number}
              onChange={(e) => setWhForm({ ...whForm, contact_number: e.target.value })}
              placeholder="+1 (555) 012-3456"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateWhModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
            >
              Save Warehouse
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        isOpen={locationModal}
        onClose={() => setLocationModal(false)}
        title="Add Storage Location / Bin (storage_locations)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Location Code (Unique per Warehouse)</label>
            <input
              type="text"
              required
              value={locForm.location_code}
              onChange={(e) => setLocForm({ ...locForm, location_code: e.target.value })}
              placeholder="e.g. AISLE-04-RACK-B1"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Zone / Description</label>
            <textarea
              rows="3"
              value={locForm.description}
              onChange={(e) => setLocForm({ ...locForm, description: e.target.value })}
              placeholder="e.g. Heavy equipment ground staging bay"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-brand-500 focus:outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLocationModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>

      {/* DBMS View Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Relational Aggregation: view_warehouse_capacity_utilization"
        sqlQuery={`CREATE VIEW view_warehouse_capacity_utilization AS
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    w.location,
    w.manager_name,
    COUNT(DISTINCT i.product_id) AS total_unique_skus,
    COALESCE(SUM(i.quantity_available), 0) AS total_units_stored,
    COALESCE(SUM(i.quantity_reserved), 0) AS total_units_reserved,
    COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_inventory_value
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.warehouse_name, w.location, w.manager_name;`}
        acidNotes="The view groups by warehouse primary key and aggregates live inventory across all products in real time without duplicating total quantity columns in the warehouse master table."
      />
    </div>
  );
}
