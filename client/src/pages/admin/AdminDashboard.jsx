import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBasket, Printer, LogOut, ExternalLink, Menu, X, Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import StatsOverview from './StatsOverview.jsx';
import ProductsPanel from './ProductsPanel.jsx';
import OrdersPanel from './OrdersPanel.jsx';
import MessagesPanel from './MessagesPanel.jsx';
import Backdrop from '../../components/Backdrop.jsx';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBasket },
    { id: 'messages', label: 'Messages', icon: Inbox },
  ];

  const select = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  const Nav = (
    <div className="flex h-full flex-col">
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 px-5 pt-6 pb-8">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-glowCyan">
          <Printer className="h-5 w-5 text-[#04121a]" strokeWidth={2.4} />
        </span>
        <span className="font-display text-base font-bold text-white">
          Delta<span className="text-gradient">Print</span><span className="text-cyan">.</span>
          <span className="ml-1.5 rounded-md border border-cyan/30 bg-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-soft">Admin</span>
        </span>
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => select(t.id)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'text-[#04121a]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab === t.id && (
                <motion.span layoutId="adminTab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan to-violet shadow-glowCyan"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon className="relative h-[18px] w-[18px]" />
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="glass mb-3 rounded-xl p-3">
          <p className="text-xs font-semibold text-white">{user?.name}</p>
          <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/')} className="btn-glow btn-ghost h-10 text-xs !px-2">
            <ExternalLink className="h-3.5 w-3.5" /> Storefront
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn-glow h-10 border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Backdrop />
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl lg:block">
        {Nav}
      </aside>

      {/* mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0b0f19]/95 backdrop-blur-xl lg:hidden">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
            {Nav}
          </aside>
        </>
      )}

      {/* main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0b0f19]/80 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-white capitalize">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-xs text-slate-500">Delta Print House · control room</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 sm:inline-flex">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live sync
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet font-display text-sm font-bold text-[#04121a] shadow-glowCyan">
              {(user?.name || 'A').split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8">
          {tab === 'overview' && <StatsOverview goTo={(t) => setTab(t)} />}
          {tab === 'products' && <ProductsPanel />}
          {tab === 'orders' && <OrdersPanel />}
          {tab === 'messages' && <MessagesPanel />}
        </main>
      </div>
    </div>
  );
}