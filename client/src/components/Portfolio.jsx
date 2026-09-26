import { motion } from 'framer-motion';
import {
  Coffee, Megaphone, Shirt, LayoutDashboard, FlaskConical, Building2, ArrowUpRight,
} from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';

const WORK = [
  { title: 'Zembaba Coffee rebrand', tag: 'Menus · Packaging · Window vinyls', icon: Coffee, grad: 'from-cyan/80 to-violet/70' },
  { title: 'Spark Events — launch day', tag: 'Stage backdrop · Roll-ups · Flyers', icon: Megaphone, grad: 'from-violet/80 to-cyan/70' },
  { title: 'AddisWorks merch drop', tag: 'T-shirts · Mugs · Sticker sheets', icon: Shirt, grad: 'from-cyan/80 to-violet/70' },
  { title: 'GreenBox fleet branding', tag: 'Car magnets · Delivery labels', icon: Building2, grad: 'from-violet/80 to-cyan/70' },
  { title: 'Kaliti trade-show run', tag: 'Hardcover manuals · Brochures', icon: LayoutDashboard, grad: 'from-cyan/80 to-violet/70' },
  { title: 'Dermline pharmacy suite', tag: 'Labels · RX pads · Posters', icon: FlaskConical, grad: 'from-violet/80 to-cyan/70' },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              Recent jobs off <span className="text-gradient">the press floor</span>
            </>
          }
          subtitle="A snapshot of the campaigns, rebrands and productions we’ve helped ship this quarter."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK.map((w, i) => {
            const Icon = w.icon;
            return (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group glass relative flex flex-col justify-between overflow-hidden rounded-2xl p-7 transition-colors duration-300 hover:border-violet/30 hover:shadow-glowViolet"
              >
                <div className={`absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${w.grad} opacity-20 blur-[60px] transition-opacity duration-500 group-hover:opacity-40`} />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'repeating-linear-gradient(135deg, transparent 0 8px, rgba(255,255,255,0.02) 8px 16px)' }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 text-cyan transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      <Icon className="h-[22px] w-[22px]" />
                    </div>
                    <span className="chip !text-[11px] opacity-0 transition-all duration-300 group-hover:opacity-100">
                      View case study <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{w.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{w.tag}</p>
                </div>
                <div className="relative mt-8 h-px w-full bg-gradient-to-r from-cyan/40 via-violet/40 to-transparent" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}