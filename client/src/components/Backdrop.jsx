/** Fixed aurora backdrop: deep-space grid + glowing drifting orbs. */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="animate-pulseGlow absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-cyan/10 blur-[140px]" />
      <div className="animate-pulseGlow absolute top-1/3 -right-32 h-[560px] w-[560px] rounded-full bg-violet/15 blur-[160px]" style={{ animationDelay: '-2s' }} />
      <div className="animate-pulseGlow absolute -bottom-48 left-10 h-[480px] w-[480px] rounded-full bg-cyan/8 blur-[150px]" style={{ animationDelay: '-1s' }} />
      {/* faint scanline tint */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)' }} />
    </div>
  );
}