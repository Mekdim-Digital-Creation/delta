import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { contactApi } from '../api/client.js';
import SectionHeading from './SectionHeading.jsx';
import Reveal from './Reveal.jsx';

const CHANNELS = [
  {
    icon: MapPin,
    label: 'Visit the press',
    lines: ['Bole Road, Behind Getu Commercial Center', 'Addis Ababa, Ethiopia'],
    href: null,
  },
  {
    icon: Phone,
    label: 'Call us',
    lines: ['+251 911 234 567', '+251 911 234 568'],
    href: 'tel:+251911234567',
  },
  {
    icon: Mail,
    label: 'Email us',
    lines: ['hello@deltaprint.et', 'orders@deltaprint.et'],
    href: 'mailto:hello@deltaprint.et',
  },
  {
    icon: Clock,
    label: 'Opening hours',
    lines: ['Mon – Fri · 8:00 – 18:00', 'Sat · 9:00 – 14:00'],
    href: null,
  },
];

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactUs() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | busy | sent
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('busy');
    setError('');
    try {
      await contactApi.send(form);
      setForm(EMPTY);
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <section id="contact" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Contact us"
          title={
            <>
              Questions, quotes, <span className="text-gradient">big or small</span>
            </>
          }
          subtitle="Tell us what you need and we'll come back with a quote — usually within a couple of hours during business time."
        />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* channels */}
          <Reveal className="space-y-3 lg:col-span-2">
            {CHANNELS.map(({ icon: Icon, label, lines, href }) => {
              const body = (
                <>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-[18px] w-[18px] text-cyan" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    {lines.map((l) => (
                      <p key={l} className="truncate text-sm text-slate-400">{l}</p>
                    ))}
                  </div>
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  className="glass group flex items-start gap-3.5 rounded-2xl p-4 transition-colors hover:border-cyan/30"
                >
                  {body}
                </a>
              ) : (
                <div key={label} className="glass group flex items-start gap-3.5 rounded-2xl p-4">
                  {body}
                </div>
              );
            })}

            <div className="glass rounded-2xl p-5">
              <p className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-cyan" /> Prefer to talk?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                WhatsApp <span className="text-slate-200">+251 911 234 567</span> for artwork
                approvals and order updates. We reply between 8am and 6pm, Monday to Saturday.
              </p>
            </div>
          </Reveal>

          {/* form */}
          <Reveal className="lg:col-span-3" delay={0.1}>
            <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8">
              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan">
                    <CheckCircle2 className="h-8 w-8 text-[#04121a]" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Thanks — we've got it. Expect a reply at your email address shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-glow btn-ghost mt-6 h-11 !px-5 text-sm"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className="font-display text-lg font-bold text-white">Send us a message</h3>
                  <p className="mt-1 text-sm text-slate-400">All fields marked * are required.</p>

                  <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="c-name">Name *</label>
                      <input
                        id="c-name" className="field" required minLength={2} maxLength={120}
                        placeholder="Your name" value={form.name} onChange={set('name')}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="c-email">Email *</label>
                      <input
                        id="c-email" type="email" className="field" required
                        placeholder="you@company.et" value={form.email} onChange={set('email')}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="c-phone">Phone <span className="normal-case text-slate-500">— optional</span></label>
                      <input
                        id="c-phone" className="field" placeholder="+251…"
                        value={form.phone} onChange={set('phone')}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="c-subject">Subject *</label>
                      <input
                        id="c-subject" className="field" required minLength={3} maxLength={160}
                        placeholder="Quote for 2,000 flyers" value={form.subject} onChange={set('subject')}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="c-message">Message *</label>
                      <textarea
                        id="c-message" rows={5} required minLength={10} maxLength={4000}
                        className="field resize-none"
                        placeholder="Sizes, stock, finishing, deadline…"
                        value={form.message} onChange={set('message')}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-rose-300">
                      <AlertTriangle className="h-4 w-4" /> {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'busy'}
                    className="btn-glow btn-primary group mt-6 h-12 !px-7 disabled:opacity-60"
                  >
                    {status === 'busy' ? 'Sending…' : 'Send message'}
                    {status !== 'busy' && (
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
