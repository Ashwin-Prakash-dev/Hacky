import TerminalInput from "../inputs/TerminalInput";
import TerminalTextarea from "../inputs/TerminalTextarea";
import { EXPECTATIONS } from "../../../lib/domains";
import { LIMITS } from "../../../lib/submission";
import {
  InlineRef,
  LockNote,
  ReadOnlyField,
  StepIntro,
  StepTitle,
} from "./ui";

// The standard these three fields are read against. Found by title rather than
// index so reordering EXPECTATIONS in lib/domains.js doesn't silently swap it.
const PROBLEM_STANDARD =
  EXPECTATIONS.find((e) => /specific problem/i.test(e.title)) ?? EXPECTATIONS[0];

// Step 1. The application's substance: what the problem is and what proves it
// exists. Leader writes; everyone else reads.
const IdeaStep = ({ form, errors, onChange, canEdit, leaderName }) => {
  if (!canEdit) {
    return (
      <div className="flex flex-col gap-1">
        <div className="mb-4 flex flex-col gap-3">
          <StepTitle>The idea</StepTitle>
          <StepIntro>What your team is pitching, and what makes you sure the problem is real.</StepIntro>
        </div>
        <LockNote>
          Only {leaderName} can edit these. Ask them if something needs to change.
        </LockNote>
        <ReadOnlyField label="Title" value={form.title} />
        <ReadOnlyField label="Summary" value={form.summary} />
        <ReadOnlyField label="Evidence the problem is real" value={form.problem_evidence} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4 flex flex-col gap-3">
        <StepTitle>The idea</StepTitle>
        <StepIntro>What your team is pitching, and what makes you sure the problem is real.</StepIntro>
      </div>

      <InlineRef label={PROBLEM_STANDARD.title} note={PROBLEM_STANDARD.body}>
        {PROBLEM_STANDARD.note && (
          <p className="mt-2 font-general text-[0.82rem] leading-relaxed text-white/40">
            {PROBLEM_STANDARD.note}
          </p>
        )}
      </InlineRef>

      <TerminalInput
        label="Title"
        value={form.title}
        error={errors.title}
        maxLength={LIMITS.title.max}
        placeholder="Clinic queue triage for rural PHCs"
        onChange={(e) => onChange("title", e.target.value)}
      />

      <TerminalTextarea
        label="Summary"
        hint="What you’re building and who it’s for, in a few sentences."
        value={form.summary}
        error={errors.summary}
        max={LIMITS.summary.max}
        rows={4}
        onChange={(e) => onChange("summary", e.target.value)}
      />

      <TerminalTextarea
        label="Evidence the problem is real"
        hint="What you saw, who you spoke to, what you counted. Real specifics beat confident estimates."
        value={form.problem_evidence}
        error={errors.problem_evidence}
        max={LIMITS.problem_evidence.max}
        rows={8}
        onChange={(e) => onChange("problem_evidence", e.target.value)}
      />
    </div>
  );
};

export default IdeaStep;
