import React from 'react';

export default function Badge({ status, variant = 'default', children }) {
  const label = children || status;
  const s = String(status || '').toUpperCase();

  let colorClasses = 'bg-slate-700/60 text-slate-300 border-slate-600/50';

  if (s === 'RECEIVED' || s === 'DISPATCHED' || s === 'COMPLETED' || s === 'ACTIVE' || s === 'IN_STOCK') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (s === 'PENDING' || s === 'IN_TRANSIT' || s === 'LOW_STOCK') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (s === 'CANCELLED' || s === 'OUT_OF_STOCK' || s === 'INACTIVE' || s === 'DISCONTINUED') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (s === 'ORDERED' || s === 'CONFIRMED' || s === 'IN') {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (s === 'OUT' || s === 'TRANSFER_OUT') {
    colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  } else if (s === 'TRANSFER_IN' || s === 'ADJUSTMENT') {
    colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      {label}
    </span>
  );
}
