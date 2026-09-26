import { Printer, MapPin, Phone, Mail, Facebook, Instagram, Twitter, ArrowUp } from 'lucide-react';

const COLS = [
  {
    title: 'Services',
    links: ['Business cards', 'Banners & displays', 'Flyers & brochures', 'Branded merchandise', 'Books & catalogues', 'Vehicle branding'],
  },
  {
    title: 'Company',
    links: ['About Delta', 'Our process', 'Quality promise', 'Sustainability', 'Careers', 'Contact'],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-glowCyan">
                <Printer className="h-5 w-5 text-[#04121a]" strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-bold text-white">
                Delta<span className="text-gradient">Print</span><span className="text-cyan">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Addis Ababa’s premiere print &amp; branding studio — large-format, premium finishes and
              branded merchandise delivered with a deadline-first attitude.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40 hover:text-cyan hover:shadow-glowCyan">
                <Facebook className="h-[18px] w-[18px]" />
              </a>
              <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet/40 hover:text-violet hover:shadow-glowViolet">
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a href="#" aria-label="Twitter" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40 hover:text-cyan hover:shadow-glowCyan">
                <Twitter className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-400 transition-colors hover:text-cyan-soft">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Visit the shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                Bole Road, Addis Ababa, Ethiopia
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-cyan" /> +251 911 234 567
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-cyan" /> hello@deltaprint.et
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Delta Print House. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-slate-300">Terms</a>
            <a href="#" className="transition-colors hover:text-slate-300">Privacy</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-cyan"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}