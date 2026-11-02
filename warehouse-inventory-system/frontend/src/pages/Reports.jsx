import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Warehouse,
  PieChart as PieIcon,
  Database,
  RefreshCw,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#026fc7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Reports() {
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [cRes, wRes, tRes, pRes] = await Promise.all([
        api.get('/reports/category-valuation'),
        api.get('/reports/warehouse-distribution'),
        api.get('/reports/movement-trends'),
        api.get('/reports/top-products')
      ]);

      setCategories(cRes.data.data);
      setWarehouses(wRes.data.data);
      setTrends(tRes.data.data);
      setTopProducts(pRes.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-brand-400" />
            <span>Reports &amp; Inventory Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated business intelligence queries computed directly via MySQL GROUP BY &amp; JOIN operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Analytical SQL Queries</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: Category Valuation & Warehouse Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-white mb-1">Asset Valuation by Category</h2>
          <p className="text-xs text-slate-400 mb-6">Total inventory value ($) aggregated per product category</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="category_name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  formatter={(val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="total_valuation" fill="#026fc7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Valuation Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-white mb-1">Facility Inventory Valuation Share</h2>
          <p className="text-xs text-slate-400 mb-6">Asset distribution across central and regional hubs</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warehouses}
                  dataKey="valuation"
                  nameKey="warehouse_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                >
                  {warehouses.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Inbound vs Outbound 30-Day Velocity */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-1">30-Day Stock Velocity &amp; Turnover</h2>
        <p className="text-xs text-slate-400 mb-6">Daily inbound receiving shipments vs outbound customer dispatches</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="inbound_qty" name="Inbound Units (Receipts)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="outbound_qty" name="Outbound Units (Dispatches)" stroke="#026fc7" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Top Selling Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-1">Top Products by Fulfilled Sales Revenue</h2>
        <p className="text-xs text-slate-400 mb-4">Historical demand aggregated from sales_orders with DISPATCHED status</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-4 font-semibold">SKU</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold text-center">Fulfilled Units</th>
                <th className="py-2.5 px-4 font-semibold text-right">Generated Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topProducts.map((p) => (
                <tr key={p.product_id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 text-brand-300 font-bold">{p.sku}</td>
                  <td className="py-2.5 px-4 font-sans text-white">{p.product_name}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-300">{p.category_name}</td>
                  <td className="py-2.5 px-4 text-center text-white font-bold">{p.total_dispatched_units}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                    ${Number(p.total_sales_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytical Queries Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Analytical Aggregation Queries"
        sqlQuery={`-- Query 1: Category Asset Valuation
SELECT 
    c.category_name,
    COUNT(DISTINCT p.product_id) AS product_count,
    COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_valuation
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
LEFT JOIN inventory i ON p.product_id = i.product_id
GROUP BY c.category_id, c.category_name
ORDER BY total_valuation DESC;

-- Query 2: 30-Day Movement Ledger Trends
SELECT 
    DATE(movement_date) AS date,
    SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) AS inbound_qty,
    SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) AS outbound_qty
FROM stock_movements
WHERE movement_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(movement_date)
ORDER BY date ASC;`}
        acidNotes="Complex analytical reports use relational multi-table JOINs and GROUP BY aggregations with conditional SUM(CASE ...), optimized with compound B-Tree indexes on date and foreign key columns."
      />
    </div>
  );
}
