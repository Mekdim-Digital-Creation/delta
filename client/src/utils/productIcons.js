import {
  CreditCard,
  FileText,
  PanelsTopLeft,
  Flag,
  Shirt,
  Coffee,
  Sticker,
  Mail,
  BookOpen,
  Layers,
  UtensilsCrossed,
  Car,
  Printer,
} from 'lucide-react';

/** Single source of truth for product iconography — used by the storefront
 *  cards and the admin product form so both stay in sync. */
export const PRODUCT_ICONS = {
  Printer,
  CreditCard,
  FileText,
  PanelsTopLeft,
  Flag,
  Shirt,
  Coffee,
  Sticker,
  Mail,
  BookOpen,
  Layers,
  UtensilsCrossed,
  Car,
};

export const PRODUCT_ICON_NAMES = Object.keys(PRODUCT_ICONS);

export const getProductIcon = (name) => PRODUCT_ICONS[name] || Printer;

export const GRADIENTS = ['cyan', 'violet'];

/** `from-* to-*` pair for each accent choice. */
export const GRADIENT_CLASS = {
  cyan: 'from-cyan to-violet',
  violet: 'from-violet to-cyan',
};
