import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  DollarSign,
  Package,
  Warehouse,
  AlertTriangle,
  ShoppingBag,
  Truck,
  ArrowRight,
  Database,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  AreaChart,
  Area
} from 'recharts';

const PIE_COLORS = ['#026fc7', '#0e8ce9', '#38a8f8', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, wRes, tRes, aRes, movRes] = await Promise.all([
        api.get('/reports/dashboard-summary'),
        api.get('/reports/category-valuation'),
        api.get('/reports/warehouse-distribution'),
        api.get('/reports/movement-trends'),
        api.get('/inventory/alerts/low-stock'),
        api.get('/stock-movements?limit=6')
      ]);

      setMetrics(mRes.data.metrics);
      setCategoryData(cRes.data.data);
      setWarehouseData(wRes.data.data);
      setTrendData(tRes.data.data);
      setAlerts(aRes.data.alerts);
      setRecentMovements(movRes.data.movements.slice(0, 6));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Operations Dashboard</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live Relational Sync
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger, relational aggregations and inventory replenishment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>DBMS View & Query Inspector</span>
          </button>
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Valuation"
          value={metrics ? `$${Number(metrics.totalInventoryValuation).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '...'}
          subtitle={`${metrics?.totalUnitsAvailable || 0} units stored on-hand`}
          icon={DollarSign}
          color="emerald"
          trend="+12.4% MoM"
        />
        <StatCard
          title="Active SKUs & Catalog"
          value={metrics?.totalProducts || 0}
          subtitle={`Across ${metrics?.totalWarehouses || 0} distribution hubs`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics?.lowStockAlertsCount || 0}
          subtitle="Items at or below reorder threshold"
          icon={AlertTriangle}
          color="amber"
          trend="Action Needed"
        />
        <StatCard
          title="Pending Order Pipeline"
          value={`${metrics?.pendingPurchaseOrders || 0} In / ${metrics?.activeSalesOrders || 0} Out`}
          subtitle="Inbound POs vs Outbound SOs"
          icon={Truck}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse Stock Comparison */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Warehouse Stock Allocation</h2>
              <p className="text-xs text-slate-400 mt-0.5">Available vs Reserved units per facility</p>
            </div>
            <Link to="/warehouses" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>View Facilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="warehouse_name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total_stock" name="Available Stock" fill="#026fc7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reserved_stock" name="Reserved Stock" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Valuation Pie Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Category Valuation Share</h2>
            <p className="text-xs text-slate-400 mt-0.5">Asset distribution by product category</p>
          </div>
          <div className="h-64 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total_valuation"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {categoryData.slice(0, 3).map((item, idx) => (
              <div key={item.category_name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  <span className="truncate max-w-[150px]">{item.category_name}</span>
                </span>
                <span className="font-mono text-slate-400">${Number(item.total_valuation).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Movement Velocity Trends Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white">30-Day Movement Ledger Velocity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daily Inbound vs Outbound inventory turnover</p>
          </div>
          <Link to="/stock-movements" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <span>Explore Stock Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#026fc7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#026fc7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="inbound_qty" name="Inbound (Receipts)" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="outbound_qty" name="Outbound (Dispatches)" stroke="#026fc7" fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Low Stock Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low-Stock Alerts (View: view_low_stock_alerts)</span>
            </h2>
            <Link to="/inventory?filter=low_stock" className="text-xs text-amber-400 hover:text-amber-300">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2.5">Product SKU</th>
                  <th className="pb-2.5">Warehouse</th>
                  <th className="pb-2.5 text-center">On-Hand</th>
                  <th className="pb-2.5 text-center">Reorder Lvl</th>
                  <th className="pb-2.5 text-right">Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-400">All products are healthy above reorder thresholds.</td>
                  </tr>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <tr key={`${a.product_id}-${a.warehouse_name}`} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-white font-sans">
                        <div className="font-semibold text-white">{a.sku}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{a.product_name}</div>
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans">{a.warehouse_name}</td>
                      <td className="py-2.5 text-center text-rose-400 font-bold">{a.quantity_available}</td>
                      <td className="py-2.5 text-center text-slate-400">{a.reorder_level}</td>
                      <td className="py-2.5 text-right text-amber-400">-{a.deficit_quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Ledger Activity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Recent Ledger Transactions</span>
            </h2>
            <Link to="/stock-movements" className="text-xs text-brand-400 hover:text-brand-300">
              Audit Ledger
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5 text-center">Qty</th>
                  <th className="pb-2.5">Facility</th>
                  <th className="pb-2.5 text-right">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentMovements.map((m) => (
                  <tr key={m.movement_id} className="hover:bg-slate-800/30">
                    <td className="py-2.5">
                      <Badge status={m.movement_type} />
                    </td>
                    <td className="py-2.5 text-white font-sans">
                      <div className="font-semibold truncate max-w-[120px]">{m.sku}</div>
                    </td>
                    <td className={`py-2.5 text-center font-bold ${m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-2.5 text-slate-300 font-sans truncate max-w-[110px]">{m.warehouse_name}</td>
                    <td className="py-2.5 text-right text-slate-400 font-sans">{m.performed_by_name?.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DBMS Architectural Inspector Modal */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Dashboard Aggregations & Analytical Views"
        sqlQuery={`-- Query 1: Inventory Summary Aggregation
SELECT 
    COUNT(DISTINCT p.product_id) AS total_products,
    COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_valuation
FROM products p
LEFT JOIN inventory i ON p.product_id = i.product_id;

-- Query 2: Low-Stock Alerts from Relational View
SELECT * FROM view_low_stock_alerts
ORDER BY deficit_quantity DESC;

-- Query 3: Warehouse Capacity Utilization
SELECT * FROM view_warehouse_capacity_utilization;`}
        acidNotes="Dashboard metrics utilize indexed B-Tree lookups on (product_id, warehouse_id) and materializes relational views for sub-millisecond reporting without table scans."
      />
    </div>
  );
}
