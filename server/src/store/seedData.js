/** Demo catalogue shared by the MySQL seeder and the in-memory driver. */
export const PRODUCTS = [
  ['Premium Business Cards', 'business-cards', '350gsm matte or gloss business cards with spot UV and rounded corners. Printed full colour on both sides.', 'Business Cards', 850, 500, 'card / 100 pcs', 100, 'CreditCard', 'cyan', 'business-cards.svg'],
  ['Standard Flyers', 'flyers', 'A5 single or double sided flyers on 130gsm gloss paper — perfect for promotions and event drops.', 'Flyers', 320, 1200, 'per 100 pcs', 100, 'FileText', 'violet', 'flyers.svg'],
  ['Roll-Up Banners', 'rollup-banners', '85×200cm retractable banner with premium anti-curl film and aluminium cassette.', 'Banners', 1450, 40, 'unit', 1, 'PanelsTopLeft', 'cyan', 'rollup-banners.svg'],
  ['Vinyl Banners', 'vinyl-banners', 'Heavy-duty 440gsm PVC banner, hemmed and eyeleted — indoor/outdoor weatherproof.', 'Banners', 980, 60, 'per m²', 2, 'Flag', 'violet', 'vinyl-banners.svg'],
  ['Custom T-Shirts', 't-shirts', 'Soft-touch cotton tees with DTF or screen printing. Sizes S–3XL, 12 colourways.', 'Merchandise', 650, 300, 'unit', 1, 'Shirt', 'cyan', 't-shirts.svg'],
  ['Branded Mugs', 'mugs', '11oz ceramic mugs with full-wrap sublimation print — dishwasher safe branding.', 'Merchandise', 380, 250, 'unit', 5, 'Coffee', 'violet', 'mugs.svg'],
  ['Sticker Sheets', 'stickers', 'Die-cut vinyl stickers, waterproof laminate, any shape up to A4 sheets of 20.', 'Merchandise', 420, 800, 'per sheet', 10, 'Sticker', 'cyan', 'stickers.svg'],
  ['A4 Letterheads', 'letterheads', '100gsm premium letterhead with logo, contact block and watermark on request.', 'Stationery', 540, 400, 'per 100 pcs', 100, 'Mail', 'violet', 'letterheads.svg'],
  ['Hardcover Books', 'books', 'Case-bound hardcover printing for reports, catalogues and coffee-table books.', 'Books', 2200, 8, 'unit', 1, 'BookOpen', 'cyan', 'books.svg'],
  ['Product Catalogues', 'catalogues', 'Saddle-stitched A4 catalogues, 16–64 pages, 170gsm art paper with soft-touch lamination.', 'Books', 1750, 80, 'per 50 pcs', 50, 'Layers', 'violet', 'catalogues.svg'],
  ['Menu Cards', 'menus', 'Waterproof synthetic menus with rounded corners — built for restaurants and cafés.', 'Stationery', 460, 150, 'per 25 pcs', 25, 'UtensilsCrossed', 'cyan', 'menus.svg'],
  ['Car Magnets', 'car-magnets', '500-micron magnetic sheet, UV laminated, cut to any size for vehicle branding.', 'Banners', 890, 6, 'per unit', 2, 'Car', 'violet', 'car-magnets.svg'],
].map(([name, slug, description, category, price, stock, unit_label, min_qty, icon, gradient, image]) => ({
  name,
  slug,
  description,
  category,
  price,
  stock,
  unit_label,
  min_qty,
  icon,
  gradient,
  image: image ? `/products/${image}` : null,
  active: 1,
}));

export const DEMO_CUSTOMER = {
  name: 'Abebe Kebede',
  email: 'demo@deltaprint.et',
  password: 'Demo@1234',
  phone: '+251911000002',
  role: 'customer',
};

export const DEMO_ADMIN = {
  name: 'Delta Admin',
  email: 'admin@deltaprint.et',
  password: 'Admin@123',
  phone: '+251911000001',
  role: 'admin',
};

/** Six spread-over-two-weeks orders so the dashboard has a trend line. */
export const DEMO_ORDERS = [
  { method: 'telebirr', status: 'pending', daysAgo: 13, lines: [0, 3] },
  { method: 'cbe_birr', status: 'in_production', daysAgo: 11, lines: [1, 4] },
  { method: 'cod', status: 'ready', daysAgo: 9, lines: [2, 5] },
  { method: 'telebirr', status: 'delivered', daysAgo: 7, lines: [3, 6] },
  { method: 'cbe_birr', status: 'delivered', daysAgo: 5, lines: [4, 7] },
  { method: 'cod', status: 'cancelled', daysAgo: 3, lines: [5, 8] },
];
