import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Search, Trash2, Check, Eye, Loader2, Inbox, Reply, AlertTriangle, X,
} from 'lucide-react';
import { contactApi } from '../../api/client.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'Unread' },
  { id: 'read', label: 'Read' },
  { id: 'replied', label: 'Replied' },
];

const STATUS_CLS = {
  new: 'border-cyan/30 bg-cyan/10 text-cyan-soft',
  read: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  replied: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
};

const formatDate = (value) => {
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export default function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState('');
  const [flash, setFlash] = useState('');

  const notify = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2200);
  };

  const load = () => {
    setLoading(true);
    contactApi
      .adminList()
      .then(({ messages: list }) => {
        setMessages(list);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.message);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const visible = useMemo(
    () =>
      messages.filter((m) => {
        const byStatus = filter === 'all' || m.status === filter;
        if (!byStatus) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.subject || '').toLowerCase().includes(q)
        );
      }),
    [messages, filter, query]
  );

  const unread = messages.filter((m) => m.status === 'new').length;

  const setStatus = async (message, status) => {
    setBusyId(message.id);
    setErr('');
    try {
      const { message: updated } = await contactApi.setStatus(message.id, status);
      setMessages((prev) => prev.map((m) => (m.id === message.id ? updated : m)));
      setOpen((cur) => (cur && cur.id === message.id ? { ...cur, status: updated.status } : cur));
      notify(status === 'replied' ? 'Marked as replied' : status === 'read' ? 'Marked as read' : 'Status updated');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const openMessage = (m) => {
    setOpen(m);
    if (m.status === 'new') setStatus(m, 'read');
  };

  const doDelete = async () => {
    const id = confirmDelete.id;
    try {
      await contactApi.remove(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (open?.id === id) setOpen(null);
      notify('Message deleted');
    } catch (e) {
      setErr(e.message);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.id ? 'bg-gradient-to-r from-cyan to-violet text-[#04121a] shadow-glowCyan' : 'text-slate-300 hover:text-white'
              }`}
            >
              {f.label}
              {f.id === 'new' && unread > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                    filter === 'new' ? 'bg-[#04121a]/25 text-[#04121a]' : 'bg-cyan/20 text-cyan-soft'
                  }`}
                >
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="field !pl-10"
            placeholder="Search name, email, subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200"
          >
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      {err && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4" /> {err}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 font-display text-lg font-semibold text-white">Nothing here</p>
          <p className="mt-1 text-sm text-slate-400">
            {messages.length === 0
              ? 'No contact messages yet. Submissions from the storefront land here.'
              : 'No messages match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`glass rounded-2xl p-4 transition-colors hover:border-cyan/30 ${
                m.status === 'new' ? 'border-cyan/25' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {m.status === 'new' && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-cyan shadow-glowCyan" aria-label="Unread" />
                    )}
                    <p className="truncate font-semibold text-white">{m.name}</p>
                    <span className="truncate text-xs text-slate-500">{m.email}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_CLS[m.status] || STATUS_CLS.read}`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-slate-200">{m.subject}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-slate-400">{m.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="mr-1 hidden text-[11px] text-slate-500 sm:inline">{formatDate(m.created_at)}</span>
                  <button
                    onClick={() => openMessage(m)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-cyan"
                    aria-label={`Read message from ${m.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(m)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                    aria-label={`Delete message from ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* reader */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424]/95 backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-white">{open.subject}</h3>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(open.created_at)}</p>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm text-slate-300">
                    <Mail className="h-4 w-4 shrink-0 text-cyan" /> {open.email}
                  </p>
                  {open.phone && (
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone className="h-4 w-4 shrink-0 text-cyan" /> {open.phone}
                    </p>
                  )}
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {open.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-6">
                <a
                  href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                  className="btn-glow btn-ghost h-10 text-sm"
                >
                  <Reply className="h-4 w-4" /> Reply by email
                </a>
                <div className="flex items-center gap-2">
                  {busyId === open.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <>
                      {open.status !== 'replied' && (
                        <button onClick={() => setStatus(open, 'replied')} className="btn-glow btn-primary h-10 text-sm">
                          <Check className="h-4 w-4" /> Mark replied
                        </button>
                      )}
                      {open.status !== 'read' && open.status !== 'replied' && (
                        <button onClick={() => setStatus(open, 'read')} className="btn-glow btn-ghost h-10 text-sm">
                          Mark read
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1424]/95 p-6 text-center"
            >
              <Trash2 className="mx-auto h-8 w-8 text-rose-300" />
              <h3 className="mt-4 font-display text-lg font-bold text-white">Delete this message?</h3>
              <p className="mt-2 text-sm text-slate-400">
                From <span className="text-slate-200">{confirmDelete.name}</span> — this can't be undone.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-glow btn-ghost h-11 text-sm">
                  Cancel
                </button>
                <button
                  onClick={doDelete}
                  className="btn-glow h-11 border border-rose-400/30 bg-rose-500/15 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
