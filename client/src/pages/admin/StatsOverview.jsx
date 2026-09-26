import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Clock4, PackageCheck, Users, Layers, AlertTriangle, Boxes,
} from 'lucide-react';
import { statsApi } from '../../api/client.js';
import { formatETB, ORDER_STATUS_CLASS, paymentLabel } from '../../utils/format.js';

const CARD_STYLES = [
  { icon: Wallet, label: 'Total revenue', key: 'revenue', money: true, grad: 'from-cyan to-violet' },
  { icon: Clock4, label: 'Pending orders', key: 'pendingOrders', suffix: ' awaiting action', grad: 'from-amber-400 to-orange-500' },
  { icon: PackageCheck, label: 'Active products', key: 'activeProducts', suffix: ' live on store', grad: 'from-emerald-400 to-cyan' },
  { icon: Users, label: 'Customers', key: 'customers', suffix: ' accounts', grad: 'from-violet to-fuchsia-400' },
];

export default function StatsOverview({ goTo }) {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    statsApi
      .get()
      .then(({ stats }) => setStats(stats))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="glass rounded-2xl border-rose-400/30 p-8 text-center text-rose-300">
        Failed to load analytics — {err}
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const maxRevenue = Math.max(1, ...stats.last14.map((d) => Number(d.revenue)));
  const maxUnits = Math.max(1, ...stats.byCategory.map((c) => Number(c.units) || 0));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_STYLES.map((card, i) => {
          const Icon = card.icon;
          const v = stats[card.key];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="glass group relative overflow-hidden rounded-2xl p-5 transition-colors hover:border-cyan/30"
            >
              <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${card.grad} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    {card.money ? formatETB(v) : String(v)}
                    <span className="ml-1 text-xs font-normal text-slate-500">{card.suffix}</span>
                  </p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${card.grad} shadow-glowCyan`}>
                  <Icon className="h-5 w-5 text-[#04121a]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* revenue chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan" />
              <h3 className="text-sm font-semibold text-white">Revenue — last 14 days</h3>
            </div>
            <span className="chip !text-[11px]">{formatETB(stats.revenue)} lifetime*</span>
          </div>
          <div className="flex h-44 items-end gap-2">
            {stats.last14.map((d) => {
              const h = Math.max(6, (Number(d.revenue) / maxRevenue) * 100);
              return (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end self-stretch">
                  <div className="absolute -top-9 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#0b0f19] px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
                    {formatETB(d.revenue)} <span className="text-slate-500">· {d.orders} orders</span>
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan/40 to-violet/70 shadow-glowCyan"
                  />
                  <span className="mt-2 text-[10px] text-slate-600">{d.day.slice(8)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-slate-600">*excludes cancelled orders</p>
        </div>

        {/* breakdowns */}
        <div className="space-y-6 lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-violet" /> Payment methods
            </h3>
            <div className="space-y-3">
              {stats.byMethod.map((m) => {
                const pct = stats.revenue ? Math.round((Number(m.total) / stats.revenue) * 100) : 0;
                return (
                  <div key={m.payment_method}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-300">{paymentLabel(m.payment_method)}</span>
                      <span className="font-mono text-xs text-slate-400">{pct}% · {m.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan to-violet" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Boxes className="h-4 w-4 text-amber-300" /> Inventory pulse
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold text-white">{stats.totalProducts}</p>
                <p className="text-[11px] text-slate-500">Products</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold text-emerald-300">{stats.activeProducts}</p>
                <p className="text-[11px] text-slate-500">Active</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-display text-xl font-bold text-amber-300">{stats.lowStock}</p>
                <p className="text-[11px] text-slate-500">Low stock</p>
              </div>
            </div>
            {stats.lowStock > 0 && (
              <button onClick={() => goTo('products')} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 transition-colors hover:bg-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {stats.lowStock} product(s) below 10 units — restock soon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* top categories */}
      {stats.byCategory.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="h-4 w-4 text-violet" /> Top categories by units sold
          </h3>
          <div className="space-y-3.5">
            {stats.byCategory.slice(0, 6).map((c) => {
              const pct = Math.round(((Number(c.units) || 0) / maxUnits) * 100);
              return (
                <div key={c.category}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="text-slate-300">{c.category}</span>
                    <span className="font-mono text-xs text-slate-400">
                      {c.units} units · {formatETB(c.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* recent orders */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent orders</h3>
          <button onClick={() => goTo('orders')} className="text-xs font-medium text-cyan-soft hover:underline">
            View all →
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {stats.recentOrders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-cyan-soft">{o.order_no}</span>
                <span className="text-sm text-slate-400">{o.customer_name} · {paymentLabel(o.payment_method)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-bold text-white">{formatETB(o.total)}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_CLASS[o.status] || ''}`}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}