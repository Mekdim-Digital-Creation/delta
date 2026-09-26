import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <Reveal className={`max-w-2xl ${alignCls} mb-12`}>
      {eyebrow && (
        <span className="chip mb-4 !border-cyan/30 !bg-cyan/5 !text-cyan-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glowCyan" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-slate-400">{subtitle}</p>}
    </Reveal>
  );
}