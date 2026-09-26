import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, X, CheckCircle2,
  AlertTriangle, Printer, ArrowRight, Palette,
} from 'lucide-react';
import { productApi } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { formatETB } from '../utils/format.js';
import { getProductIcon, GRADIENT_CLASS } from '../utils/productIcons.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal from './Reveal.jsx';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.ai,.eps,.svg';
const MAX_MB = 25;

/** Finishing options offered alongside the artwork. */
const FINISHING = [
  'No finishing',
  'Matte lamination',
  'Gloss lamination',
  'Spot UV',
  'Foil stamping',
  'Die-cut to shape',
  'Rounded corners',
];

const prettySize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function PrintingService() {
  const { addItem, openDrawer } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(100);
  const [finishing, setFinishing] = useState(FINISHING[1]);
  const [colorMode, setColorMode] = useState('Full colour');
  const [details, setDetails] = useState('');
  const [dragging, setDragging] = useState(false);
  const [added, setAdded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    productApi
      .list()
      .then(({ products: list }) => {
        if (!active) return;
        setProducts(list);
        setLoadError('');
        // Default to the first in-stock product.
        const first = list.find((p) => p.stock > 0) || list[0];
        if (first) {
          setProductId(String(first.id));
          setQty(Math.max(1, first.min_qty || 1));
        }
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(productId)) || null,
    [products, productId]
  );

  const Icon = product ? getProductIcon(product.icon) : Printer;

  // Object URLs must be revoked or the blob stays in memory for the session.
  const previewUrl = useMemo(
    () => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const acceptFile = (f) => {
    setFileError('');
    setAdded(false);
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`That file is ${prettySize(f.size)} — the limit is ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const selectProduct = (id) => {
    setProductId(id);
    const next = products.find((p) => String(p.id) === String(id));
    if (next) setQty(Math.max(1, next.min_qty || 1));
  };

  const effectiveQty = product
    ? Math.min(Math.max(1, Number(qty) || 1), product.stock)
    : 1;
  const estimate = product ? product.price * effectiveQty : 0;

  const brief = [
    `Artwork: ${file?.name || 'not attached'}`,
    finishing !== FINISHING[0] ? `Finish: ${finishing}` : null,
    colorMode !== 'Full colour' ? `Colour: ${colorMode}` : null,
    details.trim() ? `Notes: ${details.trim()}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const submit = (e) => {
    e.preventDefault();
    if (!product) return;
    addItem(product, effectiveQty, brief);
    setAdded(true);
    setTimeout(openDrawer, 400);
    setTimeout(() => setAdded(false), 4000);
  };

  return (
    <section id="print-service" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Printing service"
          title={
            <>
              Got a file? <span className="text-gradient">Send it straight to the press</span>
            </>
          }
          subtitle="Upload your artwork, tell us what and how many, and we'll add it to your order. Our team checks every file for bleed, resolution and colour before it hits the machine."
        />

        <Reveal className="glass overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-5">
            {/* ── Step 1: artwork ─────────────────────────────────────── */}
            <div className="border-b border-white/10 p-6 sm:p-8 lg:col-span-2 lg:border-b-0 lg:border-r">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-[11px] font-bold text-[#04121a]">
                  1
                </span>
                Your artwork
              </p>
              <p className="mb-5 text-xs text-slate-500">PDF, PNG or JPG · up to {MAX_MB} MB</p>

              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0])}
              />

              {file ? (
                <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-4">
                  <div className="flex items-start gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-violet/15">
                        <FileText className="h-6 w-6 text-violet-300" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{file.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{prettySize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                    dragging
                      ? 'border-cyan bg-cyan/10'
                      : 'border-white/15 bg-white/[0.02] hover:border-cyan/50 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/20">
                    <UploadCloud className="h-7 w-7 text-cyan" />
                  </span>
                  <span className="mt-4 text-sm font-medium text-white">
                    Drop your file here
                  </span>
                  <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                </button>
              )}

              <AnimatePresence>
                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-rose-300"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> {fileError}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mt-6 space-y-3">
                <div>
                  <label className="field-label" htmlFor="ps-finish">Finishing</label>
                  <select
                    id="ps-finish"
                    className="field cursor-pointer"
                    value={finishing}
                    onChange={(e) => setFinishing(e.target.value)}
                  >
                    {FINISHING.map((f) => (
                      <option key={f} value={f} className="bg-space text-slate-200">{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="ps-colour">Colour</label>
                  <div className="grid grid-cols-3 gap-2" id="ps-colour">
                    {['Full colour', 'Black & white', 'Spot colour'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorMode(c)}
                        className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-all ${
                          colorMode === c
                            ? 'border-cyan/70 bg-cyan/15 text-cyan'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="ps-notes">Anything else? <span className="normal-case text-slate-500">— optional</span></label>
                  <textarea
                    id="ps-notes"
                    rows={3}
                    className="field resize-none"
                    placeholder="Sizes, stock colour, delivery deadline…"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Step 2: type + quantity ─────────────────────────────── */}
            <div className="p-6 sm:p-8 lg:col-span-3">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-[11px] font-bold text-[#04121a]">
                  2
                </span>
                What and how many
              </p>
              <p className="mb-5 text-xs text-slate-500">
                Pick the print type — this sets the price and goes straight onto your order.
              </p>

              {loadError ? (
                <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  Couldn't load products ({loadError}). Is the API running on port 5000?
                </p>
              ) : loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {products.map((p) => {
                      const PIcon = getProductIcon(p.icon);
                      const active = String(p.id) === String(productId);
                      const soldOut = p.stock === 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={soldOut}
                          onClick={() => selectProduct(p.id)}
                          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all disabled:opacity-40 ${
                            active
                              ? 'border-cyan/70 bg-cyan/10 shadow-glowCyan'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${GRADIENT_CLASS[p.gradient] || GRADIENT_CLASS.cyan}`}>
                            <PIcon className="h-[18px] w-[18px] text-[#04121a]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">{p.name}</span>
                            <span className="block truncate text-[11px] text-slate-400">
                              {formatETB(p.price)} · {p.unit_label}
                            </span>
                          </span>
                          {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan" />}
                        </button>
                      );
                    })}
                  </div>

                  {product && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${GRADIENT_CLASS[product.gradient] || GRADIENT_CLASS.cyan}`}>
                            <Icon className="h-5 w-5 text-[#04121a]" />
                          </span>
                          <div>
                            <p className="font-display text-base font-semibold text-white">{product.name}</p>
                            <p className="text-xs text-slate-400">
                              {formatETB(product.price)} {product.unit_label} · {product.stock} in stock
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="field-label" htmlFor="ps-qty">Quantity</label>
                          <div className="flex items-center gap-2">
                            <input
                              id="ps-qty"
                              type="number"
                              min={Math.max(1, product.min_qty || 1)}
                              max={product.stock}
                              className="field w-28"
                              value={qty}
                              onChange={(e) => setQty(e.target.value)}
                            />
                            <span className="text-xs text-slate-500">
                              min {product.min_qty} · max {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      {Number(qty) > product.stock && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Only {product.stock} in stock — we'll cap it at {product.stock}.
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Estimate</p>
                          <p className="font-display text-2xl font-bold text-gradient">
                            {formatETB(estimate)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={submit}
                          disabled={product.stock === 0}
                          className="btn-glow btn-primary group h-12 !px-6"
                        >
                          {added ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Added to cart
                            </>
                          ) : (
                            <>
                              Add to order <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: FileText, title: 'Preflight checked', body: 'We verify bleed, resolution and colour profile before printing — and tell you if anything needs fixing.' },
            { icon: Palette, title: 'Colour matched', body: 'Profiles calibrated to our press so what you approve is what comes off the machine.' },
            { icon: Printer, title: 'Same-week turnaround', body: 'Standard jobs ship within 2–3 working days. Rush available on request.' },
          ].map(({ icon: Ico, title, body }) => (
            <div key={title} className="glass rounded-2xl p-5">
              <Ico className="h-5 w-5 text-cyan" />
              <h3 className="mt-3 font-display text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
