import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, Phone, Eye, EyeOff, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const { authModal, closeAuth, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [adminNotice, setAdminNotice] = useState(false);

  useEffect(() => {
    if (authModal.open) {
      setMode(authModal.mode);
      setError('');
      setAdminNotice(false);
    }
  }, [authModal.open, authModal.mode]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else {
        user = await register(form);
      }
      setBusy(false);
      if (user.role === 'admin') {
        setAdminNotice(true);
        setTimeout(() => {
          closeAuth();
          navigate('/admin');
        }, 900);
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  return createPortal(
    <AnimatePresence>
      {authModal.open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : closeAuth}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424]/95 backdrop-blur-2xl shadow-glowViolet"
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet/20 blur-[70px]" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan/15 blur-[70px]" />

              <div className="relative px-7 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-glowCyan">
                      <User className="h-4 w-4 text-[#04121a]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h3>
                  </div>
                  <button onClick={closeAuth} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* tabs */}
                <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                  {['login', 'register'].map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMode(m)}
                      className={`relative rounded-lg py-2 text-sm font-medium transition-colors ${
                        mode === m ? 'text-[#04121a]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId="authTab"
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan to-violet shadow-glowCyan"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative">{m === 'login' ? 'Sign in' : 'Register'}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="mt-6 space-y-3.5">
                  <AnimatePresence mode="wait">
                    {mode === 'register' && (
                      <motion.div
                        key="name"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input className="field !pl-10" placeholder="Full name" value={form.name}
                            onChange={set('name')} required />
                        </div>
                        <div className="relative mt-3.5">
                          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input className="field !pl-10" placeholder="Phone (+251…)" value={form.phone}
                            onChange={set('phone')} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input type="email" className="field !pl-10" placeholder="Email address" value={form.email}
                      onChange={set('email')} required />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="field !pl-10 !pr-11"
                      placeholder="Password"
                      minLength={6}
                      value={form.password}
                      onChange={set('password')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {adminNotice && (
                    <div className="flex items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 p-3 text-sm text-cyan-soft">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      Admin verified — opening the dashboard…
                    </div>
                  )}

                  <button type="submit" disabled={busy} className="btn-glow btn-primary h-11 w-full text-sm disabled:opacity-70">
                    {busy ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                    ) : (
                      mode === 'login' ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </form>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-500">
                  <p><span className="font-semibold text-slate-300">Demo accounts:</span></p>
                  <p><span className="font-mono text-cyan-soft">admin@deltaprint.et</span> / <span className="font-mono">Admin@123</span> — full admin control</p>
                  <p><span className="font-mono text-cyan-soft">demo@deltaprint.et</span> / <span className="font-mono">Demo@1234</span> — customer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}