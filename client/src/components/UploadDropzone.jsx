import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function UploadDropzone() {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const accept = (list) => {
    const next = Array.from(list);
    if (!next.length) return;
    setFiles(next);
    setProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 22 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
      }
      setProgress(Math.floor(p));
    }, 180);
    return () => clearInterval(timer);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !files.length && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !files.length && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative grid min-h-[150px] cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
          dragging
            ? 'border-cyan bg-cyan/10 shadow-glowCyan'
            : files.length
              ? 'border-violet/40 bg-violet/5'
              : 'border-white/15 bg-white/5 hover:border-cyan/40 hover:bg-white/[0.06]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.ai,.eps,.psd,.png,.jpg,.svg"
          onChange={(e) => accept(e.target.files)}
        />

        {!files.length ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <UploadCloud className={`mx-auto h-10 w-10 transition-colors ${dragging ? 'text-cyan' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-200">
              {dragging ? 'Drop it — we’ve got it' : 'Drag & drop your artwork'}
            </p>
            <p className="text-xs text-slate-500">PDF, AI, EPS, PSD, PNG, SVG · up to 50 MB</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-3 text-left"
            >
              {files.map((f, i) => (
                <div key={i} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan to-violet">
                    <File className="h-4 w-4 text-[#04121a]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{f.name}</p>
                    <p className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {progress >= 100 ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan" />
                  )}
                </div>
              ))}

              {progress < 100 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-violet shadow-glowCyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}
              {progress >= 100 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-300">Upload complete — proof will be drafted shortly.</span>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setProgress(0);
                    }}
                    className="ml-3 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Clear files"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}