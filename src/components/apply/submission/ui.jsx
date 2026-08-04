import { Link } from "react-router-dom";
import { ArrowUpRight, Lock } from "lucide-react";

// Shared vocabulary for the submission steps. These exist so the six step
// files stay about their own content: nothing here holds state or knows what
// step it is on.

export const SectionLabel = ({ children }) => (
  <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime/80">
    {children}
  </p>
);

export const StepTitle = ({ children }) => (
  <h2 className="font-general text-[clamp(1.25rem,3.5vw,1.6rem)] font-bold tracking-[-0.01em] text-white">
    {children}
  </h2>
);

export const StepIntro = ({ children }) => (
  <p className="font-general text-[0.92rem] leading-relaxed text-white/60">
    {children}
  </p>
);

// Reference links open in a new tab on purpose: reading a domain brief must
// never cost someone the answer they were halfway through typing.
export const RefLink = ({ to, children }) => (
  <Link
    to={to}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-[0.3rem] font-mono text-[0.78rem] tracking-[0.04em] text-lime/90 underline underline-offset-[3px] transition-colors duration-200 hover:text-lime"
  >
    {children}
    <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
  </Link>
);

// The guidance that sits beside a field, drawn from lib/format.js so it can
// never drift from what /format publishes.
export const InlineRef = ({ label, items, note, children }) => (
  <div className="mb-7 rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-[1.1rem] py-[0.9rem]">
    <SectionLabel>{label}</SectionLabel>
    {items && (
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-[0.6rem] font-general text-[0.85rem] leading-relaxed text-white/65"
          >
            <span
              aria-hidden="true"
              className="mt-[0.55em] size-[4px] shrink-0 rounded-full bg-lime/60"
            />
            {item}
          </li>
        ))}
      </ul>
    )}
    {note && (
      <p className="mt-3 font-general text-[0.82rem] leading-relaxed text-white/50">
        {note}
      </p>
    )}
    {children}
  </div>
);

export const ReadOnlyField = ({ label, value, empty = "Not answered yet." }) => (
  <div className="mb-7">
    <p className="mb-[0.55rem] select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
      {label}
    </p>
    <p
      className={`whitespace-pre-wrap font-general text-[0.95rem] leading-relaxed ${
        value ? "text-white/85" : "text-white/40"
      }`}
    >
      {value || empty}
    </p>
  </div>
);

export const ReadOnlyLink = ({ label, value, empty = "Not added yet." }) => (
  <div className="mb-7">
    <p className="mb-[0.55rem] select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
      {label}
    </p>
    {value ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-mono text-[0.85rem] text-lime/90 underline underline-offset-[3px] transition-colors duration-200 hover:text-lime"
      >
        {value}
      </a>
    ) : (
      <p className="font-general text-[0.95rem] text-white/40">{empty}</p>
    )}
  </div>
);

// Shown to members on the steps only the leader can write to.
export const LockNote = ({ children }) => (
  <p className="mb-7 flex items-start gap-2 font-general text-[0.85rem] leading-relaxed text-white/45">
    <Lock size={13} strokeWidth={2} aria-hidden="true" className="mt-[0.25em] shrink-0" />
    {children}
  </p>
);

export const StepNav = ({ children }) => (
  <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
    {children}
  </div>
);
