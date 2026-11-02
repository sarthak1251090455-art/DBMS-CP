import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Database, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@warehouse.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 shadow-xl shadow-brand-500/20 mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Warehouse & Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">DBMS Academic Course Project System</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">User Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="name@warehouse.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating with MySQL...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Role Switcher (Academic Demo)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('admin@warehouse.com')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left transition-colors"
              >
                <div className="font-semibold text-white">Administrator</div>
                <div className="text-[10px] text-brand-400">Full System Control</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('manager@warehouse.com')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left transition-colors"
              >
                <div className="font-semibold text-white">Warehouse Manager</div>
                <div className="text-[10px] text-cyan-400">Inventory & Transfers</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('clerk@warehouse.com')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left transition-colors"
              >
                <div className="font-semibold text-white">Inventory Clerk</div>
                <div className="text-[10px] text-amber-400">Stock Receiving & Count</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('sales@warehouse.com')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left transition-colors"
              >
                <div className="font-semibold text-white">Sales Representative</div>
                <div className="text-[10px] text-emerald-400">Orders & Dispatches</div>
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">Default password for demo accounts: <code className="text-slate-300">admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
