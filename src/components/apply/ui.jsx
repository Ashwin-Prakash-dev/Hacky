import { useState } from "react";
import { Link } from "react-router-dom";

// Kept for the handful of call sites that still need raw values (inline SVG
// stroke colors, style objects not yet migrated to Tailwind).
export const MONO = "monospace";
export const SANS = "var(--font-general, sans-serif)";
export const LIME = "#C8FF00";

export const Panel = ({ maxWidth = "440px", children }) => (
  <div
    className="w-full rounded-lg border-[0.5px] border-lime/[0.14] bg-[rgba(12,12,12,0.96)] p-[clamp(1.5rem,4vw,2.5rem)]"
    style={{ maxWidth }}
  >
    {children}
  </div>
);

export const Eyebrow = ({ children }) => (
  <p className="mb-[0.6rem] font-mono text-[0.85rem] tracking-[0.16em] text-lime/90">
    [{children}]
  </p>
);

export const Title = ({ children }) => (
  <p className="mb-6 font-general text-[clamp(1.4rem,4vw,1.9rem)] font-bold tracking-[-0.01em] text-white">
    {children}
  </p>
);

export const ErrorLine = ({ children }) =>
  children ? (
    <p className="my-1 mb-4 font-mono text-[0.9rem] leading-relaxed text-[rgba(255,120,120,0.95)]">
      {children}
    </p>
  ) : null;

export const NoticeLine = ({ children }) =>
  children ? (
    <p className="my-1 mb-4 font-mono text-[0.9rem] leading-relaxed text-lime/90">
      {children}
    </p>
  ) : null;

export const PrimaryButton = ({ type = "button", disabled = false, onClick, children }) => {
  const [hover, setHover] = useState(false);
  const lifted = hover && !disabled;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded px-8 py-[0.9rem] font-mono text-[0.8rem] font-bold uppercase tracking-[0.14em] text-black transition-[transform,box-shadow] duration-300 ${
        disabled ? "cursor-not-allowed bg-lime/35" : "cursor-pointer bg-lime"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
        transform: lifted ? "translateY(-2px)" : "translateY(0)",
        boxShadow: lifted ? "0 10px 28px rgba(200,255,0,0.22)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export const GhostButton = ({ onClick, disabled = false, danger = false, children }) => {
  const [hover, setHover] = useState(false);
  const lit = hover && !disabled;
  const base = danger ? "text-[rgba(255,140,140,0.9)]" : "text-white/[0.78]";
  const litColor = danger ? "text-[#ff6b6b]" : "text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border-none bg-transparent p-0 font-mono text-[0.85rem] tracking-[0.06em] underline underline-offset-[3px] transition-colors duration-200 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${lit ? litColor : base}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export const MonoLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-[0.35rem] font-mono text-[0.85rem] tracking-[0.03em] text-lime/90 underline underline-offset-[3px]"
  >
    {children}
  </Link>
);

export const Divider = () => (
  <div className="my-[1.4rem] flex items-center gap-[0.85rem]">
    <span className="h-px flex-1 bg-white/[0.08]" />
    <span className="font-mono text-[0.78rem] text-white/60">or</span>
    <span className="h-px flex-1 bg-white/[0.08]" />
  </div>
);
