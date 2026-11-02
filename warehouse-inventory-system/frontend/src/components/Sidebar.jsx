import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Package,
  Warehouse,
  ShoppingBag,
  Truck,
  ArrowLeftRight,
  History,
  Users,
  BarChart3,
  ShieldCheck,
  Terminal
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Live Inventory', path: '/inventory', icon: Boxes },
  { name: 'Products & SKUs', path: '/products', icon: Package },
  { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag },
  { name: 'Sales Orders', path: '/sales-orders', icon: Truck },
  { name: 'Stock Transfers', path: '/stock-transfers', icon: ArrowLeftRight },
  { name: 'Stock Ledger', path: '/stock-movements', icon: History },
  { name: 'Partners', path: '/partners', icon: Users },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
  { name: 'DBMS Console', path: '/dbms-console', icon: Terminal, highlight: true },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operational Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : item.highlight
                    ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>DBMS Lab Project</span>
          <span className="text-emerald-400 font-semibold">MySQL 8.0</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          Relational 3NF &bull; ACID Transactions &bull; Stored Procedures &bull; Triggers
        </div>
      </div>
    </aside>
  );
}
