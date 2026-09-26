import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { productApi } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from './ProductCard.jsx';
import SectionHeading from './SectionHeading.jsx';

function Skeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="aspect-[4/3] w-full animate-pulse bg-white/10" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-7 w-24 rounded bg-white/10" />
          <div className="h-7 w-16 rounded bg-white/5" />
        </div>
        <div className="h-10 w-full rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  const { addItem, openDrawer } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  // Debounce keystrokes so we don't hammer the API on every character.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Category tabs are owned by the database, not derived from the filtered page.
  useEffect(() => {
    let active = true;
    productApi
      .categories()
      .then(({ categories }) => {
        if (active && categories.length) setCategories(['All', ...categories]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    productApi
      .list({ category: category === 'All' ? undefined : category, q: query || undefined })
      .then(({ products }) => {
        if (!active) return;
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, query]);

  // If the active category disappears (admin deleted/renamed it), fall back to All.
  useEffect(() => {
    if (category !== 'All' && !categories.includes(category)) setCategory('All');
  }, [categories, category]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading catalog…';
    if (!products.length) return 'No matches';
    const n = products.length;
    return `${n} ${n === 1 ? 'product' : 'products'}${category !== 'All' ? ` in ${category}` : ''}`;
  }, [loading, products.length, category]);

  const handleAdd = (product, qty) => {
    addItem(product, qty);
    setTimeout(openDrawer, 250);
  };

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="Product catalog"
        title={
          <>
            Everything your brand needs, <span className="text-gradient">on demand</span>
          </>
        }
        subtitle="Live from our press floor — pricing, stock and availability sync straight from the database. Pick a category or search to find your print."
      />

      {/* filters */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1.5">
          <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                category === tab ? 'text-[#04121a]' : 'text-slate-300 hover:text-white'
              }`}
            >
              {category === tab && (
                <motion.span
                  layoutId="catPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan to-violet shadow-glowCyan"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="field !pl-10"
            />
          </div>
        </div>
      </div>

      <p className="mb-6 text-center text-xs uppercase tracking-wider text-slate-500">{resultLabel}</p>

      {/* grid */}
      <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={`s-${i}`} />)
            : products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onAdd={handleAdd} />
              ))}
        </AnimatePresence>
      </motion.div>

      {!loading && !error && products.length === 0 && (
        <div className="glass mx-auto mt-8 max-w-md rounded-2xl p-10 text-center">
          <PackageX className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 font-display text-lg font-semibold text-white">No products found</p>
          <p className="mt-1 text-sm text-slate-400">Try a different category or search term.</p>
        </div>
      )}

      {error && (
        <div className="glass mx-auto mt-8 max-w-md rounded-2xl border-rose-400/30 p-8 text-center">
          <p className="text-sm text-rose-300">{error}</p>
          <p className="mt-2 text-xs text-slate-500">Make sure the API server is running on port 5000.</p>
        </div>
      )}
    </section>
  );
}