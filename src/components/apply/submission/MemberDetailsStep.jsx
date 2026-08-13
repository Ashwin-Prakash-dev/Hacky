import { Plus, Trash2 } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import TerminalTextarea from "../inputs/TerminalTextarea";
import { GhostButton } from "../ui";
import { LIMITS } from "../../../lib/submission";
import { SectionLabel, StepIntro, StepTitle } from "./ui";

// Step 4. Your own row, and only ever your own. The API lets a leader write
// anyone's details, but nobody should be describing a teammate on their behalf.
// Every field is optional, and this works before the application exists at all.
//
// `canSave` is false when the account couldn't be matched to a roster row, which
// leaves nowhere to write. The form is withheld rather than shown-and-ignored:
// there is no draft for member details, so anything typed here would be lost the
// moment the tab closed, with nothing having said so.
const MemberDetailsStep = ({
  form, errors, onChange, name, canSave, accountEmail, leaderName,
}) => {
  const links = form.project_links;
  const atLimit = links.length >= LIMITS.project_links;

  const setLinks = (next) => onChange("project_links", next);

  if (!canSave) {
    return (
      <div className="flex flex-col gap-1">
        <div className="mb-4 flex flex-col gap-3">
          <StepTitle>Your details</StepTitle>
          <StepIntro>
            We can&rsquo;t match your account to a row on your team&rsquo;s roster, so
            there&rsquo;s nowhere to save your details right now.
          </StepIntro>
        </div>

        <div className="rounded-md border-[0.5px] border-[rgba(255,120,120,0.35)] bg-[rgba(255,120,120,0.06)] px-[1.1rem] py-[0.9rem]">
          <SectionLabel>Signed in as</SectionLabel>
          <p className="mt-1.5 break-all font-mono text-[0.9rem] text-white">
            {accountEmail || "this account has no email address"}
          </p>
          <p className="mt-3 font-general text-[0.87rem] leading-relaxed text-white/75">
            Usually this means you signed in with a different address than the one your
            invite was sent to. Log out and sign back in with that address, or ask{" "}
            {leaderName} to send a fresh invite to this one. Your team&rsquo;s
            application is unaffected either way — only your own details are
            blocked.
          </p>
          <p className="mt-3 font-general text-[0.85rem] leading-relaxed text-white/50">
            If neither works, email{" "}
            <a
              href="mailto:support@sctcoding.club"
              className="text-lime/80 underline underline-offset-[3px]"
            >
              support@sctcoding.club
            </a>{" "}
            and we&rsquo;ll sort out the row by hand.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4 flex flex-col gap-3">
        <StepTitle>Your details</StepTitle>
        <StepIntro>
          None of this is required, but we recommend filling it in. It gives judges a
          sense of who&rsquo;s on your team. Everyone fills in their own, so your
          teammates can add theirs whenever they log in.
        </StepIntro>
      </div>

      <div className="mb-6 rounded-md border-[0.5px] border-lime/20 bg-lime/[0.04] px-[1.1rem] py-[0.8rem]">
        <SectionLabel>Filling this in as</SectionLabel>
        <p className="mt-1.5 font-general text-[0.95rem] font-bold text-white">{name}</p>
      </div>

      <TerminalTextarea
        label="About you"
        hint="What you’ve built before, and what you’ll own in this team."
        value={form.about}
        error={errors.about}
        max={LIMITS.about.max}
        rows={6}
        onChange={(e) => onChange("about", e.target.value)}
      />

      <TerminalInput
        label="Résumé link"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://drive.google.com/file/d/…"
        value={form.resume_url}
        error={errors.resume_url}
        onChange={(e) => onChange("resume_url", e.target.value)}
      />

      <TerminalInput
        label="GitHub"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://github.com/…"
        value={form.github}
        error={errors.github}
        onChange={(e) => onChange("github", e.target.value)}
      />

      <TerminalInput
        label="LinkedIn"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://linkedin.com/in/…"
        value={form.linkedin}
        error={errors.linkedin}
        onChange={(e) => onChange("linkedin", e.target.value)}
      />

      <div className="mb-7">
        <p className="mb-[0.55rem] select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
          Things you’ve built
        </p>
        <p className="mb-3 font-general text-[0.82rem] leading-relaxed text-white/50">
          Up to {LIMITS.project_links}. Something we can click beats something you describe.
        </p>

        {links.map((link, i) => (
          <div key={i} className="mb-3 flex items-start gap-2">
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://…"
              value={link}
              onChange={(e) => setLinks(links.map((l, j) => (j === i ? e.target.value : l)))}
              className="w-full rounded-md border border-white/[0.18] bg-white/5 px-[0.9rem] py-[0.7rem] font-general text-[0.95rem] font-normal text-white caret-lime outline-none transition-[border-color,background,box-shadow] duration-[250ms] focus:border-lime focus:bg-lime/[0.04] focus:shadow-[0_0_0_3px_rgba(200,255,0,0.12)]"
            />
            <button
              type="button"
              onClick={() => setLinks(links.filter((_, j) => j !== i))}
              aria-label={`Remove link ${i + 1}`}
              className="mt-[0.55rem] shrink-0 p-1 text-white/45 transition-colors duration-200 hover:text-[rgba(255,140,140,0.9)]"
            >
              <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}

        {errors.project_links && (
          <p className="mt-[0.45rem] font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
            {errors.project_links}
          </p>
        )}

        <div className="mt-2">
          <GhostButton disabled={atLimit} onClick={() => setLinks([...links, ""])}>
            <span className="inline-flex items-center gap-[0.35rem]">
              <Plus size={13} />
              {atLimit ? `That’s the limit of ${LIMITS.project_links}` : "Add a link"}
            </span>
          </GhostButton>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsStep;
