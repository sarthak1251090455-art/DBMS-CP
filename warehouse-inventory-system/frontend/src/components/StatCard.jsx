import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
