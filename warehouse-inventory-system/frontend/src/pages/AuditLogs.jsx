import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import DBMSShowcaseModal from '../components/DBMSShowcaseModal';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Database,
  RefreshCw,
  User,
  Clock
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (entityFilter) params.entity_name = entityFilter;
      if (actionFilter) params.action = actionFilter;

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.audit_logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>Security &amp; Transaction Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident system activity record capturing all DML operations, logins, and stored procedure executions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDbmsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Database className="w-4 h-4 text-brand-400" />
            <span>Inspect Audit Schema</span>
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Entities</option>
            <option value="purchase_orders">Purchase Orders</option>
            <option value="sales_orders">Sales Orders</option>
            <option value="stock_transfers">Stock Transfers</option>
            <option value="inventory">Inventory</option>
            <option value="products">Products</option>
            <option value="warehouses">Warehouses</option>
            <option value="users">User Auth</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Actions</option>
            <option value="RECEIVE_PO">RECEIVE_PO</option>
            <option value="DISPATCH_SO">DISPATCH_SO</option>
            <option value="EXECUTE_TRANSFER">EXECUTE_TRANSFER</option>
            <option value="ADJUST_INVENTORY">ADJUST_INVENTORY</option>
            <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {logs.length} logged events
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Event ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Entity Target</th>
                <th className="py-3 px-4 font-semibold">Actor / User</th>
                <th className="py-3 px-4 font-semibold">Operational Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-bold">#{log.log_id}</td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-brand-300 font-semibold">{log.entity_name}</span>
                      {log.entity_id && <span className="text-slate-500"> #{log.entity_id}</span>}
                    </td>
                    <td className="py-3 px-4 font-sans text-white">
                      <div>{log.user_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.user_role || 'SYSTEM'}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Schema Inspector */}
      <DBMSShowcaseModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
        operationTitle="Audit Trail Schema: audit_logs"
        sqlQuery={`CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB;`}
        acidNotes="Audit table preserves forensic history even if a user account is deleted in the future via ON DELETE SET NULL. Compound indexes on (entity_name, entity_id) allow sub-millisecond lookup of entity history."
      />
    </div>
  );
}
