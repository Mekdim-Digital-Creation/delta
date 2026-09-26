import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, Power, X, Loader2, AlertTriangle, PackagePlus, ImageOff,
} from 'lucide-react';
import { productApi } from '../../api/client.js';
import { formatETB, badgeForStock } from '../../utils/format.js';
import {
  PRODUCT_ICONS,
  PRODUCT_ICON_NAMES,
  getProductIcon,
  GRADIENTS,
  GRADIENT_CLASS,
} from '../../utils/productIcons.js';

const EMPTY = {
  name: '', description: '', category: 'Business Cards', price: '', stock: '',
  unit_label: 'piece', min_qty: 1, icon: 'Printer', gradient: 'cyan', image: '', active: true,
};

/** The images bundled in client/public/products — offered as a picker. */
const BUNDLED_IMAGES = [
  'books.svg', 'business-cards.svg', 'car-magnets.svg', 'catalogues.svg', 'flyers.svg',
  'letterheads.svg', 'menus.svg', 'mugs.svg', 'rollup-banners.svg', 'stickers.svg',
  't-shirts.svg', 'vinyl-banners.svg',
];

/** Thumbnail in the admin table: photo when available, gradient tile otherwise. */
function RowThumb({ product, Icon }) {
  const [failed, setFailed] = useState(false);
  const cls = `h-10 w-10 shrink-0 overflow-hidden rounded-lg ${product.active === 0 ? 'opacity-40 grayscale' : ''}`;

  if (!product.image || failed) {
    return (
      <span className={`grid ${cls} place-items-center bg-gradient-to-br ${GRADIENT_CLASS[product.gradient] || GRADIENT_CLASS.cyan}`}>
        <Icon className="h-4 w-4 text-[#04121a]" />
      </span>
    );
  }
  return (
    <span className={`block ${cls}`}>
      <img src={product.image} alt="" loading="lazy" onError={() => setFailed(true)} className="h-10 w-10 object-cover" />
    </span>
  );
}

export default function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null); // null | {mode:'create'} | {mode:'edit', product}
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [flash, setFlash] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    productApi
      .list({ all: 1 })
      .then(({ products }) => {
        setProducts(products);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (status === 'all' || (status === 'active' && p.active === 1) || (status === 'inactive' && p.active === 0)) &&
          (!query || p.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [products, status, query]
  );

  const notify = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2200);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setErr('');
    setModal({ mode: 'create' });
  };
  const openEdit = (p) => {
    setForm({ ...EMPTY, ...p, image: p.image || '' });
    setErr('');
    setModal({ mode: 'edit', product: p });
  };

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  /** For buttons/imagery where there's no event to read a value from. */
  const setValue = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        min_qty: Number(form.min_qty || 1),
      };
      if (modal.mode === 'create') {
        await productApi.create(payload);
        notify('Product created');
      } else {
        await productApi.update(modal.product.id, payload);
        notify('Product updated');
      }
      setModal(null);
      load();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p) => {
    const before = products;
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: x.active ? 0 : 1 } : x)));
    try {
      await productApi.toggle(p.id);
      notify(p.active ? 'Product deactivated' : 'Product activated');
    } catch (error) {
      setProducts(before);
      setErr(error.message);
    }
  };

  const doDelete = async () => {
    await productApi.remove(confirmDelete.id);
    setConfirmDelete(null);
    notify('Product deleted');
    load();
  };

  return (
    <div className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                status === s ? 'bg-gradient-to-r from-cyan to-violet text-[#04121a] shadow-glowCyan' : 'text-slate-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input className="field !pl-10" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button onClick={openCreate} className="btn-glow btn-primary h-[42px] shrink-0 !px-4 text-sm">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      {/* flash */}
      <AnimatePresence>
        {flash && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      {/* table */}
      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="grid gap-4 p-5">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Product</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Price</th>
                  <th className="px-5 py-3.5 font-medium">Stock</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {filtered.map((p) => {
                  const RowIcon = getProductIcon(p.icon);
                  return (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <RowThumb product={p} Icon={RowIcon} />
                          <div>
                            <p className={p.active === 0 ? 'font-medium text-slate-400 line-through' : 'font-medium text-white'}>{p.name}</p>
                            <p className="text-[11px] text-slate-500">{p.unit_label} · min {p.min_qty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="chip !text-[11px]">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-cyan-soft">{formatETB(p.price)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono ${p.stock <= 10 ? 'text-amber-300' : 'text-slate-200'}`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggle(p)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                            p.active === 1
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          {p.active === 1 ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-cyan" aria-label={`Edit ${p.name}`}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Delete ${p.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
              </tbody>
            </table>
            {!loading && !filtered.length && (
              <div className="py-16 text-center text-slate-500">No products match your filters.</div>
            )}
          </div>
        )}
      </div>

      {/* create / edit modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[70] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.form
              onSubmit={save}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424]/95 p-6 backdrop-blur-2xl shadow-glowViolet sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-white">
                  <span className="mr-2 inline-flex">{modal.mode === 'create' ? <PackagePlus className="h-5 w-5 text-cyan" /> : <Pencil className="h-5 w-5 text-cyan" />}</span>
                  {modal.mode === 'create' ? 'Add new product' : `Edit — ${modal.product.name}`}
                </h3>
                <button type="button" onClick={() => !saving && setModal(null)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <input className="field sm:col-span-2" placeholder="Product name *" value={form.name} onChange={set('name')} required />
                <textarea className="field sm:col-span-2 resize-none" placeholder="Short description" rows={2} value={form.description} onChange={set('description')} />
                <input className="field" placeholder="Category *" value={form.category} onChange={set('category')} list="dph-cats" required />
                <datalist id="dph-cats">
                  {['Business Cards', 'Banners', 'Flyers', 'Merchandise', 'Stationery', 'Books'].map((c) => <option key={c} value={c} />)}
                </datalist>
                <div className="grid grid-cols-2 gap-3.5">
                  <input type="number" min="0" className="field" placeholder="Price (ETB)" value={form.price} onChange={set('price')} required />
                  <input type="number" min="0" className="field" placeholder="Stock" value={form.stock} onChange={set('stock')} required />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <input className="field" placeholder="Unit label (e.g. per 100)" value={form.unit_label} onChange={set('unit_label')} />
                  <input type="number" min="1" className="field" placeholder="Min order qty" value={form.min_qty} onChange={set('min_qty')} />
                </div>
                <div>
                  <label className="field-label">Accent colour</label>
                  <div className="flex gap-2">
                    {GRADIENTS.map((g) => (
                      <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gradient: g }))}
                        className={`h-9 w-9 rounded-xl bg-gradient-to-br ${GRADIENT_CLASS[g]} ${form.gradient === g ? 'ring-2 ring-white ring-offset-2 ring-offset-space' : 'opacity-60 hover:opacity-100'}`} aria-label={`${g} accent`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label">Card icon <span className="normal-case text-slate-500">— fallback when no photo is set</span></label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {PRODUCT_ICON_NAMES.map((name) => {
                      const Ic = PRODUCT_ICONS[name];
                      const active = form.icon === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          title={name}
                          onClick={() => setForm((f) => ({ ...f, icon: name }))}
                          className={`grid aspect-square place-items-center rounded-lg border transition-all ${
                            active
                              ? 'border-cyan/70 bg-cyan/15 text-cyan shadow-glowCyan'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <Ic className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Product photo</label>
                  {form.image ? (
                    <div className="mb-2.5 flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <img
                        src={form.image}
                        alt=""
                        onError={() => setValue('image', '')}
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-200">{form.image}</p>
                        <button type="button" onClick={() => setValue('image', '')} className="mt-1 text-xs text-rose-300 hover:text-rose-200">
                          Remove photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2.5 flex items-center gap-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                      <ImageOff className="h-4 w-4 shrink-0 text-slate-500" />
                      No photo — the card will show the icon on a gradient tile.
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {BUNDLED_IMAGES.map((file) => {
                      const path = `/products/${file}`;
                      const active = form.image === path;
                      return (
                        <button
                          key={file}
                          type="button"
                          title={file}
                          onClick={() => setValue('image', active ? '' : path)}
                          className={`overflow-hidden rounded-lg border-2 transition-all ${
                            active ? 'border-cyan shadow-glowCyan' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img src={path} alt={file} loading="lazy" className="h-11 w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                  <input
                    className="field mt-2.5"
                    placeholder="…or paste an image URL (https://…)"
                    value={form.image}
                    onChange={set('image')}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <input type="checkbox" checked={form.active} onChange={set('active')} className="h-4 w-4 accent-cyan" />
                  <span className="text-sm text-slate-200">Active on storefront</span>
                </label>
              </div>

              {err && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => !saving && setModal(null)} className="btn-glow btn-ghost h-11 flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-glow btn-primary h-11 flex-1 text-sm disabled:opacity-70">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : modal.mode === 'create' ? 'Create product' : 'Save changes'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1424]/95 p-6 text-center backdrop-blur-2xl"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-500/10 text-rose-300">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">Delete product?</h3>
              <p className="mt-1.5 text-sm text-slate-400">
                “{confirmDelete.name}” will be permanently removed from the database. This can’t be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-glow btn-ghost h-11 flex-1 text-sm">Keep it</button>
                <button onClick={doDelete} className="btn-glow h-11 flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-sm font-semibold text-white shadow-glowViolet">
                  Delete for good
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}