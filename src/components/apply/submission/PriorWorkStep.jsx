import { Plus, Trash2 } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import TerminalSelect from "../inputs/TerminalSelect";
import TerminalTextarea from "../inputs/TerminalTextarea";
import { GhostButton } from "../ui";
import { BEFORE_THE_EVENT } from "../../../lib/format";
import { LIMITS, PRIOR_WORK_KINDS, priorWorkLabel } from "../../../lib/submission";
import { InlineRef, LockNote, SectionLabel, StepIntro, StepTitle } from "./ui";

const blankEntry = () => ({ kind: "", url: "", description: "" });

// The binary that has to be answered explicitly. Leaving the step untouched
// stores null ("never answered"); picking the right-hand option stores []
// ("we checked, there is nothing"). Undeclared prior work carries a penalty at
// the event, so the form must not let [] happen by accident.
const Choice = ({ selected, title, body, onSelect, disabled }) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={`flex w-full items-start gap-3 rounded-md border p-4 text-left transition-[border-color,background] duration-200 ${
      selected
        ? "border-lime/40 bg-lime/[0.05]"
        : "border-white/[0.12] bg-white/[0.02] hover:border-white/25"
    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
  >
    <span
      aria-hidden="true"
      className={`mt-[0.3em] size-[10px] shrink-0 rounded-full ${
        selected
          ? "border-[1.5px] border-lime bg-lime/[0.15] shadow-[0_0_10px_rgba(200,255,0,0.35)]"
          : "border border-white/25 bg-white/10"
      }`}
    />
    <span className="min-w-0">
      <span className="block font-general text-[0.92rem] font-bold text-white">{title}</span>
      <span className="mt-1 block font-general text-[0.85rem] leading-relaxed text-white/55">
        {body}
      </span>
    </span>
  </button>
);

const PriorWorkStep = ({ form, errors, onChange, canEdit, leaderName }) => {
  const entries = form.prior_work;
  const declared = Array.isArray(entries);
  const nothingToDeclare = declared && entries.length === 0;
  const atLimit = declared && entries.length >= LIMITS.prior_work_entries;

  const setEntries = (next) => onChange("prior_work", next);
  const updateEntry = (index, field, value) =>
    setEntries(entries.map((e, i) => (i === index ? { ...e, [field]: value } : e)));

  const heading = (
    <div className="mb-4 flex flex-col gap-3">
      <StepTitle>Prior work</StepTitle>
      <StepIntro>
        Anything tied to this idea that already exists. Declaring it costs you nothing.
        Hiding it is what gets penalised.
      </StepIntro>
    </div>
  );

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-1">
        {heading}
        <LockNote>Only {leaderName} can edit this.</LockNote>
        {!declared && (
          <p className="font-general text-[0.95rem] text-white/40">
            Not answered yet.
          </p>
        )}
        {nothingToDeclare && (
          <p className="font-general text-[0.95rem] text-white/85">
            Your team declared nothing.
          </p>
        )}
        {declared && entries.length > 0 && (
          <ul className="border-t border-white/[0.06]">
            {entries.map((entry, i) => (
              <li key={i} className="border-b border-white/[0.06] py-4">
                <SectionLabel>{priorWorkLabel(entry.kind)}</SectionLabel>
                <p className="mt-2 font-general text-[0.9rem] leading-relaxed text-white/80">
                  {entry.description}
                </p>
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all font-mono text-[0.8rem] text-lime/90 underline underline-offset-[3px]"
                  >
                    {entry.url}
                  </a>
                )}
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

      <InlineRef
        label="Declare any of these"
        items={BEFORE_THE_EVENT.declare}
        note={BEFORE_THE_EVENT.declareNote}
      />

      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        <Choice
          selected={declared && entries.length > 0}
          title="We have prior work"
          body="List each one, so judges know what existed before the clock started."
          onSelect={() => {
            if (!declared || entries.length === 0) setEntries([blankEntry()]);
          }}
        />
        <Choice
          selected={nothingToDeclare}
          title="Nothing to declare"
          body="Nothing tied to this idea exists yet. We’re starting from scratch."
          onSelect={() => setEntries([])}
        />
      </div>

      {errors.form && (
        <p className="mb-5 font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
          {errors.form}
        </p>
      )}

      {declared && entries.length > 0 && (
        <>
          {entries.map((entry, i) => (
            <div
              key={i}
              className="mb-5 rounded-md border-[0.5px] border-white/[0.1] bg-white/[0.015] p-[1.1rem]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <SectionLabel>Item {i + 1}</SectionLabel>
                <button
                  type="button"
                  onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                  aria-label={`Remove item ${i + 1}`}
                  className="inline-flex items-center gap-[0.3rem] font-mono text-[0.78rem] text-white/50 underline underline-offset-[3px] transition-colors duration-200 hover:text-[rgba(255,140,140,0.9)]"
                >
                  <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
                  Remove
                </button>
              </div>

              <TerminalSelect
                label="What is it"
                value={entry.kind}
                error={errors[i]?.kind}
                onChange={(e) => updateEntry(i, "kind", e.target.value)}
              >
                {PRIOR_WORK_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </TerminalSelect>

              {/* "Something else" has no category to lean on, so the
                  description is the only place the item's real nature gets
                  recorded, so ask for it explicitly. */}
              <TerminalTextarea
                label="What it is, and how you’ll use it"
                hint={
                  entry.kind === "other"
                    ? "Name the thing first, then say how it fits in. Judges have no category to go on here."
                    : undefined
                }
                value={entry.description}
                error={errors[i]?.description}
                max={LIMITS.prior_work_description.max}
                rows={3}
                onChange={(e) => updateEntry(i, "description", e.target.value)}
              />

              <TerminalInput
                label="Link (optional)"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://github.com/…"
                value={entry.url}
                error={errors[i]?.url}
                onChange={(e) => updateEntry(i, "url", e.target.value)}
              />
            </div>
          ))}

          <div className="mb-2">
            <GhostButton
              disabled={atLimit}
              onClick={() => setEntries([...entries, blankEntry()])}
            >
              <span className="inline-flex items-center gap-[0.35rem]">
                <Plus size={13} />
                {atLimit
                  ? `That’s the limit of ${LIMITS.prior_work_entries}`
                  : "Add another item"}
              </span>
            </GhostButton>
          </div>
        </>
      )}
    </div>
  );
};

export default PriorWorkStep;
