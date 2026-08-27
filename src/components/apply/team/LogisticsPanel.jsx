import { useState } from "react";
import { Check } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import TerminalSelect from "../inputs/TerminalSelect";
import { Panel, Eyebrow, ErrorLine, PrimaryButton, OutlineButton } from "../ui";
import { ARRIVAL_DATE_LABEL } from "../../../lib/phase";
import {
  FOOD_OPTIONS,
  TRAVEL_MODES,
  fromRow,
  toLogisticsPayload,
} from "../../../lib/logistics";

/**
 * The signed-in member's own food and travel answers.
 *
 * Food is the one required answer: it is a headcount the kitchen cooks to, and
 * nobody can guess it. Everything else is optional here and at the API, so
 * someone who knows they are vegetarian but has not booked a train yet can save
 * the first half and come back.
 *
 * Writes replace the whole row, so the form always holds every field, seeded
 * from the row the server last returned.
 */
const LogisticsPanel = ({ member, row, onSave, busy, error, copyToTeam }) => {
  const [form, setForm] = useState(() => fromRow(row));
  const [saved, setSaved] = useState(false);

  // The server owns the row. When it comes back changed — this save, or the
  // leader filling it in from their own screen — the form follows it.
  const rowKey = `${row?.updated_at ?? "none"}:${row?.updated_by ?? ""}`;
  const [formKey, setFormKey] = useState(rowKey);
  if (formKey !== rowKey) {
    setFormKey(rowKey);
    setForm(fromRow(row));
    setSaved(false);
  }

  const set = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (busy || !form.food_preference) return;
    onSave(member.user_id, toLogisticsPayload(form)).then((ok) =>
      setSaved(!!ok),
    );
  };

  const filledBySomeoneElse =
    row?.updated_by && row.updated_by !== member.user_id;

  return (
    <Panel maxWidth="none">
      <Eyebrow>Your answers</Eyebrow>

      {filledBySomeoneElse && (
        <p className="mb-4 font-general text-[0.82rem] leading-relaxed text-white/50">
          Your leader answered this for you. Change anything that isn&rsquo;t
          right and save.
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <fieldset
          className="mb-7 border-none p-0"
          role="radiogroup"
          aria-required="true"
        >
          <legend className="mb-[0.55rem] font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
            Food <span className="text-lime/70">(required)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {FOOD_OPTIONS.map((option) => {
              const active = form.food_preference === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-[0.6rem] rounded-md border-[0.5px] px-4 py-[0.7rem] font-general text-[0.9rem] transition-colors duration-200 ${
                    active
                      ? "border-lime/60 bg-lime/[0.08] text-white"
                      : "border-white/[0.12] bg-white/[0.02] text-white/70"
                  }`}
                >
                  <input
                    type="radio"
                    name={`food-${member.user_id}`}
                    className="size-4 accent-lime"
                    value={option.value}
                    checked={active}
                    onChange={() => set("food_preference")(option.value)}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <TerminalSelect
          label="How are you getting here"
          value={form.travel_mode}
          onChange={(e) => set("travel_mode")(e.target.value)}
        >
          <option value="">Not decided yet</option>
          {TRAVEL_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </TerminalSelect>

        <TerminalInput
          type="time"
          label={`What time you get here on ${ARRIVAL_DATE_LABEL}`}
          value={form.arrival_time}
          onChange={(e) => set("arrival_time")(e.target.value)}
        />

        <TerminalInput
          label="Anything about your arrival"
          value={form.arrival_note}
          onChange={(e) => set("arrival_note")(e.target.value)}
          placeholder="evening train, exact time still to confirm"
          autoComplete="off"
        />

        <label className="mb-3 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-[0.2rem] size-4 shrink-0 accent-lime"
            checked={form.needs_travel_guidance}
            onChange={(e) => set("needs_travel_guidance")(e.target.checked)}
          />
          <span className="font-general text-[0.9rem] leading-relaxed text-white/80">
            I could use help getting to the venue
          </span>
        </label>

        {form.needs_travel_guidance && (
          <TerminalInput
            label="What would help"
            value={form.guidance_note}
            onChange={(e) => set("guidance_note")(e.target.value)}
            placeholder="getting from the station to campus"
            autoComplete="off"
          />
        )}

        <ErrorLine>{error}</ErrorLine>

        {/* The leader's "everyone else too" sits beside Save and nowhere else:
            it is the same act on the same answers, one row wider. */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton type="submit" disabled={busy || !form.food_preference}>
            {busy ? "Saving…" : saved ? "Saved" : "Save"}
          </PrimaryButton>
          {copyToTeam && (
            <OutlineButton
              onClick={() => copyToTeam.onClick(toLogisticsPayload(form))}
              disabled={copyToTeam.disabled || busy || !form.food_preference}
            >
              {copyToTeam.busy ? "Applying…" : copyToTeam.label}
            </OutlineButton>
          )}
        </div>

        {/* Said next to the disabled button rather than after a rejected save:
            the reason the button is dead has to be readable before it's
            pressed. */}
        {!form.food_preference && (
          <p className="mt-3 font-mono text-[0.78rem] tracking-widest text-white/45">
            Pick veg or non-veg to save.
          </p>
        )}

        {saved && !busy && (
          <p className="mt-3 flex items-center gap-2 font-mono text-[0.78rem] tracking-widest text-lime/80">
            <Check size={14} strokeWidth={3} aria-hidden="true" />
            Saved. Come back and change it any time.
          </p>
        )}
      </form>
    </Panel>
  );
};

export default LogisticsPanel;
