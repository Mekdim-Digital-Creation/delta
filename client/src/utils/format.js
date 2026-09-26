/** Ethiopian Birr formatting. Amounts are whole birr in practice, so we drop
 *  cents to keep the price tags tight. */
export const formatETB = (n) =>
  new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const badgeForStock = (stock) => {
  const s = Number(stock) || 0;
  if (s === 0) {
    return { text: 'Out of stock', cls: 'text-rose-300 bg-rose-500/10 border-rose-400/30' };
  }
  if (s <= 15) {
    return { text: `Low stock · ${s}`, cls: 'text-amber-300 bg-amber-500/10 border-amber-400/30' };
  }
  return { text: 'In stock', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' };
};

/** Labels for the localized Ethiopian payment rails. */
export const PAYMENT_METHODS = [
  { id: 'telebirr', label: 'Telebirr', hint: 'Mobile money · instant' },
  { id: 'cbe_birr', label: 'CBE Birr', hint: 'Commercial Bank of Ethiopia' },
  { id: 'cod', label: 'Cash on Delivery', hint: 'Pay when it arrives' },
];

export const paymentLabel = (id) =>
  PAYMENT_METHODS.find((m) => m.id === id)?.label || 'Unknown';

export const ORDER_STATUSES = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_production', label: 'In production' },
  { id: 'ready', label: 'Ready' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const ORDER_STATUS_CLASS = {
  pending: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  in_production: 'text-cyan-300 bg-cyan/10 border-cyan-400/40',
  ready: 'text-violet-300 bg-violet-500/10 border-violet-400/30',
  delivered: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  cancelled: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
};
