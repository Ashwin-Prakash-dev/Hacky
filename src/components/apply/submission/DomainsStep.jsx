import { Check } from "lucide-react";
import { DOMAINS } from "../../../lib/domains";
import { LockNote, RefLink, StepIntro, StepTitle } from "./ui";

// A real checkbox, hidden but not removed: the card is only paint, so keyboard
// focus, the checked state screen readers announce, and space-to-toggle all
// come from the input rather than being rebuilt on a button.
const DomainChoice = ({ domain, selected, onToggle }) => {
  const Icon = domain.icon;
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={selected}
        onChange={onToggle}
      />
      <span
        className={`flex h-full flex-col gap-3 rounded-md border p-4 transition-[border-color,background] duration-200 peer-focus-visible:border-lime/40 peer-focus-visible:shadow-[0_0_0_1px_rgba(200,255,0,0.5)] ${
          selected
            ? "border-lime/40 bg-lime/[0.05]"
            : "border-white/[0.12] bg-white/[0.02] hover:border-white/25"
        }`}
      >
        <span className="flex items-start justify-between gap-3">
          <Icon
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
            className={`shrink-0 ${selected ? "text-lime" : "text-white/45"}`}
          />
          <span
            aria-hidden="true"
            className={`flex size-[16px] shrink-0 items-center justify-center rounded-[3px] ${
              selected
                ? "border-[1.5px] border-lime bg-lime/[0.15] shadow-[0_0_10px_rgba(200,255,0,0.35)]"
                : "border border-white/25 bg-white/10"
            }`}
          >
            {selected && <Check size={11} strokeWidth={3} className="text-lime" />}
          </span>
        </span>
        <span className="block font-general text-[0.92rem] font-bold leading-snug text-white">
          {domain.title}
        </span>
        <span className="block font-general text-[0.85rem] leading-relaxed text-white/55">
          {domain.outcome}
        </span>
      </span>
    </label>
  );
};

// Step 1. Which of the four challenge domains the solution is aimed at. Sits
// before the idea so the brief just read on step 0 is still the thing in mind.
// Stored as domain titles, which is what the API takes.
const DomainsStep = ({ form, errors, onChange, canEdit, leaderName }) => {
  const selected = Array.isArray(form.domains) ? form.domains : [];

  const toggle = (title) =>
    onChange(
      "domains",
      selected.includes(title)
        ? selected.filter((t) => t !== title)
        : [...selected, title]
    );

  const heading = (
    <div className="mb-4 flex flex-col gap-3">
      <StepTitle>Your domains</StepTitle>
      <StepIntro>
        {canEdit
          ? "Which challenges your solution is aimed at. Pick every one it genuinely addresses, and at least one."
          : "Which challenges your solution is aimed at."}
      </StepIntro>
    </div>
  );

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-1">
        {heading}
        <LockNote>Only {leaderName} can change this.</LockNote>
        {selected.length === 0 ? (
          <p className="font-general text-[0.95rem] text-white/40">Not chosen yet.</p>
        ) : (
          <ul className="grid gap-3">
            {DOMAINS.filter((d) => selected.includes(d.title)).map((domain) => (
              <li key={domain.slug} className="flex items-center gap-[0.6rem]">
                <domain.icon
                  size={16}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="shrink-0 text-lime"
                />
                <span className="font-general text-[0.92rem] text-white/85">
                  {domain.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {heading}

      <div className="mb-5">
        <RefLink to="/domains">Read the briefs</RefLink>
      </div>

      <fieldset className="mb-5 border-none p-0">
        <legend className="sr-only">Challenge domains</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {DOMAINS.map((domain) => (
            <DomainChoice
              key={domain.slug}
              domain={domain}
              selected={selected.includes(domain.title)}
              onToggle={() => toggle(domain.title)}
            />
          ))}
        </div>
      </fieldset>

      {errors.domains && (
        <p className="mb-5 font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
          {errors.domains}
        </p>
      )}
    </div>
  );
};

export default DomainsStep;
