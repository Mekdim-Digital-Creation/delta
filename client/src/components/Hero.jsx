import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Timer, ChevronDown } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

const STATS = [
  { value: '40K+', label: 'Jobs delivered' },
  { value: '24hr', label: 'Rush turnaround' },
  { value: '120+', label: 'Businesses served' },
  { value: '4.9★', label: 'Client rating' },
];

const FLOATIES = [
  '✦', '◆', '●', '▲', '⬡',
];

export default function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* abstract decorative layer */}
      <div aria-hidden className="absolute inset-0">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[8%] top-28 h-40 w-40 rounded-3xl border border-cyan/25 bg-cyan/5 blur-[2px] -rotate-12"
        />
        <motion.div
          animate={{ y: [0, 26, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[6%] top-40 h-56 w-56 rounded-full border border-violet/25 bg-violet/5"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute right-[18%] top-10 h-72 w-72 rounded-full border border-dashed border-cyan/15"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
          className="absolute right-[26%] top-2 h-44 w-44 rounded-full border border-dashed border-violet/15"
        />
        {FLOATIES.map((f, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -46, 0], opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 7 + i * 1.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            className="absolute text-cyan/40 text-xl"
            style={{
              left: `${12 + i * 18}%`,
              top: `${30 + (i % 3) * 24}%`,
            }}
          >
            {f}
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="chip mx-auto !border-cyan/30 !bg-cyan/5 !text-cyan-soft">
            <Sparkles className="h-3.5 w-3.5" />
            Addis Ababa’s modern print &amp; branding studio
          </motion.span>

          <motion.h1
            variants={item}
            className="mx-auto mt-7 max-w-5xl font-display text-[2.7rem] font-bold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Printing that <span className="text-gradient text-glow-cyan">pops</span>,
            <br className="hidden sm:block" /> branding that{' '}
            <span className="text-gradient-soft text-glow-violet">stings</span>.
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            From razor-sharp business cards to show-stopping banners and on-brand merch —
            Delta Print House turns ideas into print with obsessive quality and same-week delivery.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('catalog')}
              className="btn-glow btn-primary group h-12 !px-7 text-[15px]"
            >
              Browse products
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo('print-service')}
              className="btn-glow btn-ghost group h-12 !px-7 text-[15px]"
            >
              Upload your artwork
            </button>
          </motion.div>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Satisfaction guaranteed</span>
            <span className="inline-flex items-center gap-1.5"><Timer className="h-4 w-4 text-cyan" /> Same-day rush available</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-violet-300" /> Free design proofs</span>
          </motion.div>
        </motion.div>

        {/* stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          className="glass mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-y-8 rounded-3xl px-6 py-8 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-gradient">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <button
        onClick={() => scrollTo('catalog')}
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-slate-500 transition-colors hover:text-cyan sm:block"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </button>
    </section>
  );
}