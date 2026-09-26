import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Building2, Banknote, Loader2, MapPin, Phone, Mail, PackageX, FileText,
} from 'lucide-react';
import { orderApi } from '../../api/client.js';
import { formatETB, ORDER_STATUSES, ORDER_STATUS_CLASS } from '../../utils/format.js';

const STATUS_FLOW = ORDER_STATUSES.map((s) => ({ ...s, cls: ORDER_STATUS_CLASS[s.id] }));

const PAYMENT = {
  telebirr: { label: 'Telebirr', icon: Smartphone, cls: 'from-cyan/20 to-violet/20 text-cyan' },
  cbe_birr: { label: 'CBE Birr', icon: Building2, cls: 'from-violet/20 to-cyan/20 text-violet-200' },
  cod: { label: 'Cash on Delivery', icon: Banknote, cls: 'from-emerald-500/20 to-cyan/20 text-emerald-300' },
};


export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  // Fetch the full set once and filter locally — otherwise the per-status
  // counters on the chips would only reflect the active filter.
  const load = () => {
    setLoading(true);
    orderApi
      .adminList()
      .then(({ orders }) => {
        setOrders(orders);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    for (const s of STATUS_FLOW) c[s.id] = orders.filter((o) => o.status === s.id).length;
    return c;
  }, [orders]);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const setStatus = async (order, status) => {
    setUpdating(order.id);
    try {
      const { order: updated } = await orderApi.setStatus(order.id, status);
      // The status endpoint returns a bare row, so carry the line items over.
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* filter chips */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1.5">
        {[{ id: 'all', label: 'All' }, ...STATUS_FLOW].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === s.id ? 'text-[#04121a]' : 'text-slate-300 hover:text-white'
            }`}
          >
            {filter === s.id && (
              <motion.span layoutId="orderFilter" className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan to-violet shadow-glowCyan"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">
              {s.label}
              <span className="ml-1.5 text-[11px] opacity-80">({counts[s.id] ?? 0})</span>
            </span>
          </button>
        ))}
      </div>

      {/* list */}
      {error ? (
        <div className="glass rounded-2xl border-rose-400/30 p-8 text-center text-rose-300">
          Failed to load orders — {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-44 animate-pulse rounded-2xl" />)}
        </div>
      ) : !visible.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <PackageX className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">No orders in this state right now.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {visible.map((o, i) => {
              const pm = PAYMENT[o.payment_method] || PAYMENT.cod;
              const PmIcon = pm.icon;
              const current = STATUS_FLOW.find((s) => s.id === o.status) || STATUS_FLOW[0];
              const nextIdx = STATUS_FLOW.findIndex((s) => s.id === o.status);
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.2) }}
                  className="glass flex flex-col rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-cyan-soft">{o.order_no}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${current.cls}`}>
                      {current.label}
                    </span>
                  </div>

                  {/* customer */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                    <p className="font-semibold text-white">{o.customer_name}</p>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                      <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-500" /> {o.customer_phone}</p>
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-500" /> {o.customer_email}</p>
                      <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" /> {o.address}, {o.city}</p>
                    </div>
                  </div>

                  {/* items */}
                  <div className="mt-3 flex-1 space-y-1.5">
                    {o.items?.map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <span className="text-slate-300">{it.qty}× {it.product_name}</span>
                        <span className="font-mono text-xs text-slate-400">{formatETB(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* artwork / finishing brief from the print-service form */}
                  {o.notes && (
                    <div className="mt-3 rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-xs leading-relaxed text-cyan-soft">
                      <p className="mb-1 flex items-center gap-1.5 font-semibold text-cyan">
                        <FileText className="h-3.5 w-3.5" /> Print brief
                      </p>
                      {String(o.notes).split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${pm.cls}`}>
                      <PmIcon className="h-4 w-4" /> {pm.label}
                    </div>
                    <span className="font-display text-lg font-bold text-gradient">{formatETB(o.total)}</span>
                  </div>

                  {/* status control */}
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o, e.target.value)}
                      disabled={updating === o.id}
                      className="field h-10 flex-1 cursor-pointer !py-0 text-xs capitalize"
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s.id} value={s.id} className="bg-space text-slate-200">{s.label}</option>
                      ))}
                    </select>
                    {updating === o.id && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan" />}
                    {nextIdx >= 0 && nextIdx < 3 && o.status !== 'cancelled' && (
                      <button
                        onClick={() => setStatus(o, STATUS_FLOW[nextIdx + 1].id)}
                        className="btn-glow btn-primary h-10 shrink-0 !px-3.5 text-xs"
                      >
                        → {STATUS_FLOW[nextIdx + 1].label}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}