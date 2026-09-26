import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';

const TESTIMONIALS = [
  {
    name: 'Selam Tesfaye',
    role: 'Brand Manager, Zembaba Coffee',
    quote:
      'Delta produced our café menus, loyalty cards and window vinyls. The spot-UV business cards actually get compliments from customers — that never happens.',
    stars: 5,
    initials: 'ST',
  },
  {
    name: 'David Mekonnen',
    role: 'Founder, AddisWorks Studio',
    quote:
      'Rush order on a Friday, delivered Tuesday. The roll-up banner print quality is flawless and the team handled our artwork revisions like pros.',
    stars: 5,
    initials: 'DM',
  },
  {
    name: 'Hanna Girma',
    role: 'Event Coordinator, Spark Events',
    quote:
      'From flyers to stage backdrops, everything matched perfectly. I uploaded the artwork, got a proof back the same day, and checkout over Telebirr took seconds.',
    stars: 5,
    initials: 'HG',
  },
  {
    name: 'Yonas Alemu',
    role: 'Director, Kaliti Manufacturing',
    quote:
      'We needed 400 hardcover manuals before a trade show. Flawless bind, vivid colour, on time. Sedis-mettew — genuinely the best press house in Addis.',
    stars: 4,
    initials: 'YA',
  },
  {
    name: 'Ruth Solomon',
    role: 'Marketing Lead, GreenBox Delivery',
    quote:
      'Our delivery kit labels and car magnets look unreal. Staff uniforms printed and shipped to all three branches in one week. Incredible logistics.',
    stars: 5,
    initials: 'RS',
  },
];

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < n ? 'fill-cyan text-cyan' : 'text-slate-700'}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d) => {
    setDir(d);
    setIndex((i) => (i + d + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[index];

  return (
    <section id="testimonials" className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Client love"
          title={
            <>
              Trusted by the teams <span className="text-gradient">behind the brands</span>
            </>
          }
          subtitle="Real words from the cafés, studios and companies we print for across Addis Ababa."
        />

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Quote className="absolute -top-6 left-2 h-16 w-16 rotate-180 text-cyan/10" />
          <div className="glass relative min-h-[290px] overflow-hidden rounded-3xl p-8 sm:p-12">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col justify-between gap-6"
              >
                <div>
                  <Stars n={t.stars} />
                  <p className="mt-5 text-lg leading-relaxed text-slate-200 sm:text-xl">
                    “{t.quote}”
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet font-display text-sm font-bold text-[#04121a] shadow-glowCyan">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              onClick={() => go(-1)}
              className="btn-glow btn-ghost h-10 w-10 !p-0"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-7 bg-gradient-to-r from-cyan to-violet shadow-glowCyan' : 'w-2 bg-white/15 hover:bg-white/30'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="btn-glow btn-ghost h-10 w-10 !p-0"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}