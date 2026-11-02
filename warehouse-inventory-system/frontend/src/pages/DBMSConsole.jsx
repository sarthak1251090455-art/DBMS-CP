import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import {
  Terminal,
  Database,
  Layers,
  Key,
  Zap,
  Eye,
  Activity,
  Search,
  CheckCircle2,
  RefreshCw,
  Cpu,
  FileCode,
  Sliders
} from 'lucide-react';

export default function DBMSConsole() {
  const [activeTab, setActiveTab] = useState('tables');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableSchema, setTableSchema] = useState(null);
  const [foreignKeys, setForeignKeys] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [views, setViews] = useState([]);
  const [queryLogs, setQueryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // EXPLAIN query runner state
  const [explainSql, setExplainSql] = useState(
    'SELECT i.inventory_id, p.sku, p.product_name, w.warehouse_name, i.quantity_available\nFROM inventory i\nJOIN products p ON i.product_id = p.product_id\nJOIN warehouses w ON i.warehouse_id = w.warehouse_id\nWHERE i.quantity_available <= p.reorder_level;'
  );
  const [explainPlan, setExplainPlan] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState('');

  const fetchDBMSData = async () => {
    setLoading(true);
    try {
      const [tRes, fkRes, procRes, vRes, qRes] = await Promise.all([
        api.get('/dbms/tables'),
        api.get('/dbms/foreign-keys'),
        api.get('/dbms/procedures'),
        api.get('/dbms/views'),
        api.get('/dbms/query-logs')
      ]);

      setTables(tRes.data.tables);
      setForeignKeys(fkRes.data.foreignKeys);
      setProcedures(tRes.data.procedures || procRes.data.procedures);
      setViews(vRes.data.views);
      setQueryLogs(qRes.data.logs);

      if (tRes.data.tables.length > 0 && !selectedTable) {
        handleSelectTable(tRes.data.tables[0].table_name);
      }
    } catch (err) {
      console.error('Failed to fetch DBMS console metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDBMSData();
    const interval = setInterval(async () => {
      try {
        const qRes = await api.get('/dbms/query-logs');
        setQueryLogs(qRes.data.logs);
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectTable = async (tableName) => {
    setSelectedTable(tableName);
    try {
      const res = await api.get(`/dbms/tables/${tableName}/schema`);
      setTableSchema(res.data);
    } catch (err) {
      console.error('Failed to load table schema:', err);
    }
  };

  const handleRunExplain = async (e) => {
    e.preventDefault();
    setExplainError('');
    setExplainLoading(true);
    try {
      const res = await api.post('/dbms/explain', { sql: explainSql });
      setExplainPlan(res.data.executionPlan);
    } catch (err) {
      setExplainError(err.response?.data?.message || 'Failed to explain query.');
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" />
              <span>Academic DBMS Course Project Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Relational Engine Live Console</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Live inspection of schema normalization (3NF), foreign key dependency graphs, stored procedures with ACID transaction guarantees, and execution query plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-emerald-400">
              <span className="text-slate-400">Engine:</span> InnoDB
            </div>
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-brand-300">
              <span className="text-slate-400">Database:</span> warehouse_db
            </div>
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-cyan-400">
              <span className="text-slate-400">Port:</span> 3307
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'tables' ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tables &amp; Column Types ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fks')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'fks' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Foreign Keys ({foreignKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('procedures')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'procedures' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Stored Procedures (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('views')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'views' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Relational Views ({views.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'logs' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Query Telemetry ({queryLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('explain')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'explain' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>SQL Query EXPLAIN Analyzer</span>
        </button>
      </div>

      {/* Tab 1: Tables & Schema Inspector */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">
              Database Base Tables (16)
            </h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {tables.map((t) => (
                <button
                  key={t.table_name}
                  onClick={() => handleSelectTable(t.table_name)}
                  className={`w-full text-left p-2.5 rounded-xl font-mono text-xs flex items-center justify-between transition-colors ${
                    selectedTable === t.table_name
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-semibold">{t.table_name}</span>
                  <span className="text-[10px] text-slate-400">{t.estimated_rows} rows</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Schema Details */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-400" />
                  <span>Table: {selectedTable}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Engine: InnoDB &bull; Collation: utf8mb4_unicode_ci
                </p>
              </div>
            </div>

            {/* Column Schema Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Column Definitions</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">Column</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-center">Nullable</th>
                      <th className="py-2.5 px-3 text-center">Key</th>
                      <th className="py-2.5 px-3">Default</th>
                      <th className="py-2.5 px-3">Extra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tableSchema?.columns?.map((col) => (
                      <tr key={col.column_name} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 text-brand-300 font-bold">{col.column_name}</td>
                        <td className="py-2 px-3 text-cyan-300">{col.column_type}</td>
                        <td className="py-2 px-3 text-center">
                          {col.is_nullable === 'YES' ? (
                            <span className="text-slate-400">YES</span>
                          ) : (
                            <span className="text-rose-400 font-semibold">NOT NULL</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {col.column_key === 'PRI' ? (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">PK</span>
                          ) : col.column_key === 'UNI' ? (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">UNIQUE</span>
                          ) : col.column_key === 'MUL' ? (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">FK/IDX</span>
                          ) : '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{col.column_default || 'NULL'}</td>
                        <td className="py-2 px-3 text-slate-400">{col.extra || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indexes Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">B-Tree Indexes</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3">Index Name</th>
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3 text-center">Unique</th>
                      <th className="py-2 px-3 text-center">Index Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tableSchema?.indexes?.map((idx, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 text-emerald-400 font-bold">{idx.Key_name}</td>
                        <td className="py-2 px-3 text-white">{idx.Column_name}</td>
                        <td className="py-2 px-3 text-center text-slate-300">{idx.Non_unique === 0 ? 'YES' : 'NO'}</td>
                        <td className="py-2 px-3 text-center text-cyan-400">{idx.Index_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Foreign Keys */}
      {activeTab === 'fks' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Relational Integrity Graph &amp; Foreign Key Constraints</h3>
            <span className="text-xs font-mono text-cyan-400">{foreignKeys.length} Active Referential Constraints</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4">Constraint Name</th>
                  <th className="py-3 px-4">Child Table</th>
                  <th className="py-3 px-4">Foreign Key Column</th>
                  <th className="py-3 px-4 text-center">&rarr;</th>
                  <th className="py-3 px-4">Parent (Referenced) Table</th>
                  <th className="py-3 px-4">Referenced PK Column</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {foreignKeys.map((fk) => (
                  <tr key={fk.constraint_name} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-amber-400 font-semibold">{fk.constraint_name}</td>
                    <td className="py-2.5 px-4 text-brand-300 font-bold">{fk.table_name}</td>
                    <td className="py-2.5 px-4 text-white">{fk.column_name}</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">&rarr;</td>
                    <td className="py-2.5 px-4 text-emerald-300 font-bold">{fk.referenced_table}</td>
                    <td className="py-2.5 px-4 text-cyan-300">{fk.referenced_column}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stored Procedures */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SP 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 font-mono">sp_receive_purchase_order</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">ACID Atomic</span>
              </div>
              <p className="text-xs text-slate-300">
                Executes inbound stock ingestion. Uses a server-side cursor to traverse order items, updates received counts, performs upsert on inventory, registers IN movement in stock ledger, and logs in audit trail.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`CALL sp_receive_purchase_order(
    IN p_purchase_order_id INT,
    IN p_performed_by INT
);`}
              </div>
            </div>

            {/* SP 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 font-mono">sp_dispatch_sales_order</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">Locking (FOR UPDATE)</span>
              </div>
              <p className="text-xs text-slate-300">
                Validates stock availability across all line items using row-level locking. If available stock &ge; ordered quantity, it executes atomic deduction, writes OUT movements, and marks order DISPATCHED.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`CALL sp_dispatch_sales_order(
    IN p_sales_order_id INT,
    IN p_performed_by INT
);`}
              </div>
            </div>

            {/* SP 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 font-mono">sp_execute_stock_transfer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">Two-Phase Facility Sync</span>
              </div>
              <p className="text-xs text-slate-300">
                Safely moves inventory across physical warehouses: verifies source quantity, deducts from source inventory, adds to destination inventory, creates dual ledger entries (TRANSFER_OUT and TRANSFER_IN).
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`CALL sp_execute_stock_transfer(
    IN p_transfer_id INT,
    IN p_performed_by INT
);`}
              </div>
            </div>

            {/* SP 4 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 font-mono">sp_adjust_inventory</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">Delta Reconciliation</span>
              </div>
              <p className="text-xs text-slate-300">
                Calculates quantity delta between recorded inventory and physical cycle count. Updates stock balance and writes an ADJUSTMENT entry in the immutable ledger with audit reconciliation notes.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`CALL sp_adjust_inventory(
    IN p_product_id INT,
    IN p_warehouse_id INT,
    IN p_new_quantity INT,
    IN p_reason VARCHAR(255),
    IN p_performed_by INT
);`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Relational Views */}
      {activeTab === 'views' && (
        <div className="space-y-4">
          {views.map((v) => (
            <div key={v.view_name} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 font-mono">{v.view_name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Updatable: {v.is_updatable}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {v.definition}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Live Query Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Parameterized Query Telemetry</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time stream of SQL statements executed against MySQL 8.0</p>
            </div>
            <button
              onClick={fetchDBMSData}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Executed SQL Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{log.durationMs}ms</td>
                    <td className="py-2.5 px-3 text-slate-200 truncate max-w-xl font-mono text-[11px]">
                      {log.sql}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: SQL EXPLAIN Analyzer */}
      {activeTab === 'explain' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">MySQL Query EXPLAIN Plan Analyzer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze index coverage, join strategies (ref, eq_ref, ALL), and estimated scanned rows.
            </p>
          </div>

          <form onSubmit={handleRunExplain} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Enter SELECT Query</label>
              <textarea
                rows="4"
                value={explainSql}
                onChange={(e) => setExplainSql(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            {explainError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
                {explainError}
              </div>
            )}

            <button
              type="submit"
              disabled={explainLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {explainLoading ? 'Analyzing Plan...' : 'Execute EXPLAIN <query>'}
            </button>
          </form>

          {explainPlan && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">MySQL Optimizer Execution Plan</h4>
              <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">id</th>
                      <th className="py-2.5 px-3">select_type</th>
                      <th className="py-2.5 px-3">table</th>
                      <th className="py-2.5 px-3">type</th>
                      <th className="py-2.5 px-3">possible_keys</th>
                      <th className="py-2.5 px-3">key</th>
                      <th className="py-2.5 px-3">rows</th>
                      <th className="py-2.5 px-3">filtered</th>
                      <th className="py-2.5 px-3">Extra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {explainPlan.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400">{row.id}</td>
                        <td className="py-2 px-3 text-white">{row.select_type}</td>
                        <td className="py-2 px-3 text-brand-300 font-bold">{row.table}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.type === 'eq_ref' || row.type === 'ref' || row.type === 'const'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{row.possible_keys || 'NULL'}</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">{row.key || 'NULL'}</td>
                        <td className="py-2 px-3 text-amber-300 font-bold">{row.rows}</td>
                        <td className="py-2 px-3 text-slate-300">{row.filtered}%</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{row.Extra || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
