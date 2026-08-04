// TerminalInput's multi-line sibling. Every long field in the idea submission
// has a hard server-side limit, so the counter is part of the control rather
// than an optional extra. A team should never lose a 1000-character answer to
// a 400 they could have seen coming.
const TerminalTextarea = ({ label, error, hint, max, rows = 5, value = "", ...props }) => {
  const length = value.length;
  const over = max ? length > max : false;
  const near = max ? !over && length > max * 0.9 : false;

  return (
    <div className="mb-7">
      <label className="mb-[0.55rem] block select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
        {label}
      </label>
      {hint && (
        <p className="mb-[0.55rem] font-general text-[0.82rem] leading-relaxed text-white/50">
          {hint}
        </p>
      )}
      <textarea
        {...props}
        rows={rows}
        value={value}
        aria-invalid={over || !!error}
        className={`w-full resize-y rounded-md border bg-white/5 px-[0.9rem] py-[0.7rem] font-general text-[0.95rem] font-normal leading-relaxed text-white caret-lime outline-none transition-[border-color,background,box-shadow] duration-[250ms] focus:bg-lime/[0.04] focus:shadow-[0_0_0_3px_rgba(200,255,0,0.12)] ${
          over ? "border-[rgba(255,120,120,0.6)]" : "border-white/[0.18] focus:border-lime"
        }`}
      />
      <div className="mt-[0.45rem] flex items-start justify-between gap-4">
        <p className="font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
          {error}
        </p>
        {max && (
          <p
            aria-live="polite"
            className={`shrink-0 font-mono text-[0.75rem] tabular-nums ${
              over
                ? "text-[rgba(255,120,120,0.95)]"
                : near
                  ? "text-lime/80"
                  : "text-white/40"
            }`}
          >
            {length} / {max}
          </p>
        )}
      </div>
    </div>
  );
};

export default TerminalTextarea;
