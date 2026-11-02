import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, AlertTriangle, LogOut, User, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    api.get('/inventory/alerts/low-stock')
      .then((res) => {
        if (res.data.success) {
          setLowStockCount(res.data.count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left: System Branding */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block">Warehouse & Inventory</span>
            <span className="text-[11px] font-mono text-cyan-400 block -mt-0.5">DBMS Academic Project Suite</span>
          </div>
        </Link>

        {/* Database Live Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Server className="w-3.5 h-3.5" />
          <span>MySQL 8.0 InnoDB (Port 3307)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Low Stock Alert Pill */}
        {lowStockCount > 0 && (
          <Link
            to="/inventory?filter=low_stock"
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-xs font-medium text-amber-300 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{lowStockCount} Low Stock Alerts</span>
          </Link>
        )}

        {/* DBMS Console Shortcut */}
        <Link
          to="/dbms-console"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
        >
          <Database className="w-4 h-4 text-brand-400" />
          <span>DBMS Live Console</span>
        </Link>

        {/* User Info & Role */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <span className="block text-xs font-semibold text-white">{user.name}</span>
              <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">{user.role}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
