import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Smartphone, Building2, Banknote, CheckCircle2, Loader2, Lock, AlertTriangle,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderApi } from '../api/client.js';
import { formatETB, PAYMENT_METHODS } from '../utils/format.js';

const METHOD_ICON = { telebirr: Smartphone, cbe_birr: Building2, cod: Banknote };
const METHODS = PAYMENT_METHODS.map((m) => ({ ...m, icon: METHOD_ICON[m.id] }));

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, clear, items, subtotal } = useCart();
  const { user, openAuth } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Addis Ababa',
  });
  const [method, setMethod] = useState('telebirr');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  // min price beyond which COD is unavailable
  const COD_LIMIT = 50000;

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name }));
    }
  }, [user]);

  const close = () => {
    if (busy) return;
    setCheckoutOpen(false);
    setError('');
    setTimeout(() => setDone(null), 400);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to place your order.');
      openAuth('login');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // Per-line briefs from the "Print something custom" form ride along as
      // order notes so the press team sees the artwork reference.
      const briefs = items
        .filter((i) => i.note)
        .map((i) => `${i.name} (x${i.qty}): ${i.note}`);
      const { order } = await orderApi.create({
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
        customer: {
          name: form.name,
          email: user.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        paymentMethod: method,
        notes: briefs.join('\n'),
      });
      clear();
      setDone(order);
      setBusy(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : close}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424]/95 backdrop-blur-2xl shadow-glowViolet"
            >
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan/15 blur-[80px]" />

              {done ? (
                <div className="relative px-8 py-14 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan shadow-glowCyan"
                  >
                    <CheckCircle2 className="h-10 w-10 text-[#04121a]" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-2xl font-bold text-white">Order placed!</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Order <span className="font-mono font-semibold text-cyan-soft">{done.order_no || done.orderNo}</span> ·{' '}
                    {formatETB(done.total)}
                  </p>
                  <div className="glass mx-auto mt-6 max-w-sm rounded-2xl p-4 text-left text-sm">
                    <p className="text-slate-300">
                      Paying via <span className="font-semibold capitalize text-white">{(done.payment_method || done.paymentMethod || method).replace('_', ' ')}</span>
                      {method === 'telebirr' && ' — dial 8488 in your Telebirr app to confirm.'}
                      {method === 'cbe_birr' && ' — approve in the CBE Birr app when prompted.'}
                      {method === 'cod' && ' — our courier will collect payment on delivery.'}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      We’ll confirm your proof and production timeline by email within 2 hours.
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="btn-glow btn-primary mt-8 h-11 px-8 text-sm"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="relative flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">Secure checkout</h3>
                      <p className="text-xs text-slate-400">Enter your delivery details &amp; pay your way</p>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Close checkout"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto px-8 py-6">
                    {/* summary */}
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                        {items.map((i) => (
                          <div key={i.id} className="flex justify-between text-sm">
                            <span className="text-slate-300">{i.qty}× {i.name}</span>
                            <span className="text-slate-200">{formatETB(i.price * i.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
                        <span className="font-semibold text-white">Total</span>
                        <span className="font-display text-lg font-bold text-gradient">{formatETB(subtotal)}</span>
                      </div>
                    </div>

                    {/* contact */}
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <input className="field sm:col-span-2" placeholder="Full name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      <input className="field" placeholder="Phone (+251…)" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      <input className="field" placeholder="City" value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <textarea className="field sm:col-span-2 resize-none" placeholder="Delivery address" rows={2} value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                    </div>

                    {/* payment */}
                    <div className="mt-6">
                      <label className="field-label">Payment method</label>
                      <div className="grid gap-2.5 sm:grid-cols-3">
                        {METHODS.map((m) => {
                          const Icon = m.icon;
                          const isCod = m.id === 'cod';
                          const blocked = isCod && subtotal > COD_LIMIT;
                          return (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => !blocked && setMethod(m.id)}
                              className={`relative rounded-xl border p-3 text-left transition-all duration-200 ${
                                blocked
                                  ? 'border-white/5 bg-white/[0.02] opacity-50'
                                  : method === m.id
                                    ? 'border-cyan/60 bg-cyan/10 shadow-glowCyan'
                                    : 'border-white/10 bg-white/5 hover:border-white/25'
                              }`}
                            >
                              <Icon className={`h-5 w-5 ${method === m.id && !blocked ? 'text-cyan' : 'text-slate-400'}`} />
                              <p className="mt-2 text-sm font-semibold text-white">{m.label}</p>
                              <p className="mt-0.5 text-[11px] text-slate-400">{m.hint}</p>
                              {blocked && (
                                <p className="mt-1 text-[10px] text-slate-500">Not available over {formatETB(COD_LIMIT)}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && (
                      <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 px-8 py-5">
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn-glow btn-primary h-12 w-full text-[15px] disabled:opacity-70"
                    >
                      {busy ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Processing order…</>
                      ) : (
                        <>Place order · {formatETB(subtotal)}</>
                      )}
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                      <Lock className="h-3.5 w-3.5" />
                      Encrypted checkout · Prices confirmed by our team before production
                      {!user && (
                        <button type="button" onClick={() => openAuth('login')} className="font-semibold text-cyan hover:underline">
                          Sign in first
                        </button>
                      )}
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}