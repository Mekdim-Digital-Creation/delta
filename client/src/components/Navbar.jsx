import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ShoppingCart, UserCircle2, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { id: 'catalog', label: 'Catalog' },
  { id: 'print-service', label: 'Print service' },
  { id: 'portfolio', label: 'Work' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const { count, openDrawer } = useCart();
  const { user, logout, openAuth } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-strong' : 'bg-transparent'
      }`}
    >
      <nav className={`mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 ${scrolled ? 'py-3' : 'py-5'}`}>
        <button onClick={() => go('top')} className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-glowCyan transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Printer className="h-5 w-5 text-[#04121a]" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Delta<span className="text-gradient">Print</span>
            <span className="text-cyan">.</span>
          </span>
        </button>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-cyan to-violet transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openDrawer}
            className="btn-glow btn-ghost relative h-10 w-10 !p-0"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-cyan to-violet px-1 text-[11px] font-bold text-[#04121a] shadow-glowCyan"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="btn-glow btn-ghost h-10 !px-3.5 text-sm"
              >
                <UserCircle2 className="h-[18px] w-[18px] text-cyan" />
                {user.name.split(' ')[0]}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      className="glass-strong absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            navigate('/admin');
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/5"
                        >
                          <LayoutDashboard className="h-4 w-4 text-cyan" /> Admin dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="btn-glow btn-primary hidden h-10 !px-4 text-sm sm:inline-flex"
            >
              Sign in
            </button>
          )}

          <button
            className="btn-glow btn-ghost h-10 w-10 !p-0 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-strong overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/admin');
                      }}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-cyan transition-colors hover:bg-white/5"
                    >
                      Admin dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openAuth('login');
                  }}
                  className="btn-glow btn-primary mt-1 h-10 text-sm"
                >
                  Sign in
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}