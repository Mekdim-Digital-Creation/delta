import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatETB } from '../utils/format.js';

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, updateQty, removeItem, subtotal, setCheckoutOpen, count } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return createPortal(
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d1424]/95 backdrop-blur-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-glowCyan">
                  <ShoppingCart className="h-5 w-5 text-[#04121a]" />
                  {count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-[#0b0f19]">
                      {count}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-white">Your cart</h3>
              </div>
              <button onClick={closeDrawer} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-white/15 text-slate-500">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <p className="mt-5 font-display text-base font-semibold text-white">Your cart is empty</p>
                  <p className="mt-1 max-w-[220px] text-sm text-slate-500">
                    Browsing the catalog is free — shipping brilliant prints isn’t the only thing we do fast.
                  </p>
                  <button onClick={closeDrawer} className="btn-glow btn-primary mt-6 h-10 px-5 text-sm">
                    Explore products
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.3 }}
                        className="glass rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{formatETB(item.price)} · {item.unit_label}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-white/10" aria-label="Decrease">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-white">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-white/10" aria-label="Increase">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-display text-base font-bold text-gradient">{formatETB(item.price * item.qty)}</p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 py-5">
                <div className="mb-1.5 flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatETB(subtotal)}</span>
                </div>
                <div className="mb-4 flex justify-between text-sm text-slate-400">
                  <span>Delivery</span>
                  <span className="text-emerald-300">Addis Ababa · free</span>
                </div>
                <div className="mb-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <motion.span key={subtotal} initial={{ scale: 1.08, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-2xl font-bold text-gradient">
                    {formatETB(subtotal)}
                  </motion.span>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    setTimeout(() => setCheckoutOpen(true), 350);
                  }}
                  className="btn-glow btn-primary group h-12 w-full text-[15px]"
                >
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Telebirr, CBE Birr &amp; Cash on Delivery accepted
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}