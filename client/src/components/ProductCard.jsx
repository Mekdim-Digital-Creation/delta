import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatETB, badgeForStock } from '../utils/format.js';
import { getProductIcon, GRADIENT_CLASS } from '../utils/productIcons.js';

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  const Icon = getProductIcon(product.icon);

  // Fall back to the branded gradient tile if there's no image, or it 404s.
  if (!product.image || failed) {
    return (
      <div
        className={`grid h-full w-full place-items-center bg-gradient-to-br ${
          GRADIENT_CLASS[product.gradient] || GRADIENT_CLASS.cyan
        }`}
      >
        <Icon className="h-12 w-12 text-[#04121a]" strokeWidth={1.9} />
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
    />
  );
}

export default function ProductCard({ product, index = 0, onAdd }) {
  const [qty, setQty] = useState(Math.max(1, product.min_qty || 1));
  const stockBadge = badgeForStock(product.stock);
  const atStockCeiling = product.stock > 0 && qty >= product.stock;

  const step = (delta) => {
    const next = qty + delta;
    if (next < 1) return;
    if (product.stock > 0 && next > product.stock) return;
    setQty(next);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group glass relative flex flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-cyan/30 hover:shadow-glowCyan"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <ProductImage product={product} />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/15 bg-[#0b0f19]/75 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
          {stockBadge.text}
        </span>
        <span className="chip absolute right-3 top-3 !text-[11px]">{product.category}</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-white">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-gradient">{formatETB(product.price)}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{product.unit_label}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-1 py-1">
            <button
              onClick={() => step(-1)}
              disabled={qty <= 1}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-semibold text-white">{qty}</span>
            <button
              onClick={() => step(1)}
              disabled={atStockCeiling}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => product.stock > 0 && onAdd(product, qty)}
            disabled={product.stock === 0}
            className={`btn-glow h-[42px] flex-1 text-sm ${product.stock === 0 ? 'pointer-events-none !border-white/5 !bg-white/5 opacity-50' : 'btn-primary'}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock === 0 ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
