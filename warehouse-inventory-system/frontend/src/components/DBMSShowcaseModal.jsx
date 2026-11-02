import React from 'react';
import Modal from './Modal';
import { Database, ShieldCheck, Zap, Server } from 'lucide-react';

export default function DBMSShowcaseModal({ isOpen, onClose, operationTitle, sqlQuery, procedureName, parameters = {}, acidNotes }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`DBMS Architecture Details: ${operationTitle}`} maxWidth="max-w-3xl">
      <div className="space-y-6 text-sm">
        {/* Academic Note Banner */}
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 flex gap-3 text-brand-200">
          <Database className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white">Relational Database & Transaction Blueprint</h4>
            <p className="text-xs text-brand-300/90 mt-1">
              This academic inspector demonstrates how the business logic is mapped directly to MySQL 8.0 InnoDB engine operations, enforcing ACID compliance and schema-level relational constraints.
            </p>
          </div>
        </div>

        {/* Stored Procedure or SQL Query */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            {procedureName ? 'Invoked Stored Procedure' : 'Executed Parameterized Query'}
          </label>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {procedureName ? `CALL ${procedureName}(${Object.values(parameters).join(', ')});` : sqlQuery}
          </div>
        </div>

        {/* Parameters */}
        {parameters && Object.keys(parameters).length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Bound Parameters (Prepared Statement)
            </label>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-2">Parameter</th>
                    <th className="pb-2">Value</th>
                    <th className="pb-2">Type / Constraint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(parameters).map(([key, val]) => (
                    <tr key={key} className="text-slate-300">
                      <td className="py-2 text-brand-400 font-semibold">{key}</td>
                      <td className="py-2 text-white">{String(val)}</td>
                      <td className="py-2 text-slate-400">Foreign Key / Constraint Verified</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACID Guarantee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              ACID Guarantees
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
              <li><strong className="text-white">Atomicity:</strong> Encapsulated in <code className="text-emerald-300">START TRANSACTION / COMMIT</code>. Automatically executes <code className="text-rose-300">ROLLBACK</code> on any SQLEXCEPTION.</li>
              <li><strong className="text-white">Consistency:</strong> Enforces FOREIGN KEY, CHECK constraints (<code className="text-emerald-300">quantity &gt;= 0</code>), and composite UNIQUE constraints.</li>
              <li><strong className="text-white">Isolation:</strong> InnoDB row-level locking via <code className="text-emerald-300">SELECT ... FOR UPDATE</code> prevents race conditions.</li>
              <li><strong className="text-white">Durability:</strong> Transaction write-ahead redo logs (WAL) guarantee persistence on disk.</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4" />
              Referential Integrity & Ledger
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {acidNotes || 'Every change updates the central inventory state, registers an immutable transaction in stock_movements, and adds an entry to audit_logs for system forensics.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </Modal>
  );
}
