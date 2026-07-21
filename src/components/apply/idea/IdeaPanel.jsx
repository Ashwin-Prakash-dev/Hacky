import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import TerminalTextarea from "../inputs/TerminalTextarea";
import TagInput from "../inputs/TagInput";
import { Panel, Eyebrow, ErrorLine, NoticeLine, PrimaryButton } from "../ui";

const LIMITS = {
  title: [3, 100],
  short_description: [10, 300],
  implementation_description: [10, 2000],
  problem_and_solution_description: [10, 2000],
  previous_project_description: [0, 2000],
};

const emptyFields = () => ({
  title: "",
  short_description: "",
  implementation_description: "",
  problem_and_solution_description: "",
  tech_stack: [],
  previous_project_description: "",
});

const fieldsFromIdea = (idea) =>
  idea
    ? {
        title: idea.title ?? "",
        short_description: idea.short_description ?? "",
        implementation_description: idea.implementation_description ?? "",
        problem_and_solution_description: idea.problem_and_solution_description ?? "",
        tech_stack: idea.tech_stack ?? [],
        previous_project_description: idea.previous_project_description ?? "",
      }
    : emptyFields();

const validate = (fields) => {
  const errors = [];
  const [tMin, tMax] = LIMITS.title;
  if (fields.title.trim().length < tMin || fields.title.trim().length > tMax) {
    errors.push(`Title must be ${tMin}-${tMax} characters.`);
  }
  const [sMin, sMax] = LIMITS.short_description;
  if (fields.short_description.trim().length < sMin || fields.short_description.trim().length > sMax) {
    errors.push(`Short description must be ${sMin}-${sMax} characters.`);
  }
  const [iMin, iMax] = LIMITS.implementation_description;
  if (fields.implementation_description.trim().length < iMin || fields.implementation_description.trim().length > iMax) {
    errors.push(`Implementation description must be ${iMin}-${iMax} characters.`);
  }
  const [pMin, pMax] = LIMITS.problem_and_solution_description;
  if (fields.problem_and_solution_description.trim().length < pMin || fields.problem_and_solution_description.trim().length > pMax) {
    errors.push(`Problem & solution description must be ${pMin}-${pMax} characters.`);
  }
  if (fields.tech_stack.length < 1 || fields.tech_stack.length > 10) {
    errors.push("Add 1-10 tech stack items.");
  }
  if (fields.previous_project_description.trim().length > LIMITS.previous_project_description[1]) {
    errors.push("Previous project description must be under 2000 characters.");
  }
  return errors;
};

const ReadField = ({ label, children }) => (
  <div className="mb-6">
    <p className="mb-[0.4rem] font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/50">
      {label}
    </p>
    {children}
  </div>
);

/**
 * Team idea: editable upsert form for the leader, read-only display
 * otherwise (member, or once submissions have locked).
 */
const IdeaPanel = ({ idea, canEdit, locked, onSubmit, busy, error, saved }) => {
  const [fields, setFields] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (fields === null) setFields(fieldsFromIdea(idea));
  }, [idea, fields]);

  if (!fields) return null;

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const invalid = validate(fields);
    if (invalid.length) {
      setErrors(invalid);
      return;
    }
    setErrors([]);
    onSubmit({
      title: fields.title.trim(),
      short_description: fields.short_description.trim(),
      implementation_description: fields.implementation_description.trim(),
      problem_and_solution_description: fields.problem_and_solution_description.trim(),
      tech_stack: fields.tech_stack,
      previous_project_description: fields.previous_project_description.trim(),
    });
  };

  if (!canEdit) {
    if (!idea) {
      return (
        <Panel maxWidth="none">
          <Eyebrow>Idea</Eyebrow>
          <p className="mt-2 font-general text-[0.9rem] leading-relaxed text-white/60">
            {locked
              ? "Idea submissions are closed and your team didn't submit one."
              : "Your team leader hasn't submitted an idea yet."}
          </p>
        </Panel>
      );
    }
    return (
      <Panel maxWidth="none">
        <Eyebrow>Idea</Eyebrow>
        {locked && (
          <NoticeLine>Idea submissions are closed. This is your team&apos;s final submission.</NoticeLine>
        )}
        <ReadField label="Title">
          <p className="font-general text-[1.1rem] font-bold text-white">{idea.title}</p>
        </ReadField>
        <ReadField label="Short description">
          <p className="font-general text-[0.9rem] leading-relaxed text-white/80">{idea.short_description}</p>
        </ReadField>
        <ReadField label="Implementation">
          <p className="whitespace-pre-wrap font-general text-[0.9rem] leading-relaxed text-white/80">{idea.implementation_description}</p>
        </ReadField>
        <ReadField label="Problem & solution">
          <p className="whitespace-pre-wrap font-general text-[0.9rem] leading-relaxed text-white/80">{idea.problem_and_solution_description}</p>
        </ReadField>
        <ReadField label="Tech stack">
          <div className="flex flex-wrap gap-[0.4rem]">
            {idea.tech_stack.map((t) => (
              <span key={t} className="rounded border border-lime/25 bg-lime/[0.08] px-2 py-[0.2rem] font-mono text-[0.78rem] text-lime/90">
                {t}
              </span>
            ))}
          </div>
        </ReadField>
        {idea.previous_project_description && (
          <ReadField label="Previous project">
            <p className="whitespace-pre-wrap font-general text-[0.9rem] leading-relaxed text-white/80">{idea.previous_project_description}</p>
          </ReadField>
        )}
      </Panel>
    );
  }

  return (
    <Panel maxWidth="none">
      <Eyebrow>{idea ? "Edit your idea" : "Submit your idea"}</Eyebrow>
      {locked ? (
        <NoticeLine>Idea submissions are closed. Editing is no longer possible.</NoticeLine>
      ) : (
        <p className="mt-2 font-general text-[0.85rem] leading-relaxed text-white/60">
          Only you, as team leader, can edit this. Your teammates can see it and add their own showcase links below.
        </p>
      )}
      <form onSubmit={submit} noValidate className="mt-4">
        <TerminalInput
          label="Title" value={fields.title} onChange={set("title")}
          disabled={locked}
        />
        <TerminalTextarea
          label="Short description" rows={2} maxLength={300}
          value={fields.short_description} onChange={set("short_description")}
          disabled={locked}
        />
        <TerminalTextarea
          label="Implementation" rows={6} maxLength={2000}
          value={fields.implementation_description} onChange={set("implementation_description")}
          disabled={locked}
        />
        <TerminalTextarea
          label="Problem & solution" rows={6} maxLength={2000}
          value={fields.problem_and_solution_description} onChange={set("problem_and_solution_description")}
          disabled={locked}
        />
        <TagInput
          label="Tech stack" value={fields.tech_stack}
          onChange={(tags) => setFields((prev) => ({ ...prev, tech_stack: tags }))}
          disabled={locked}
          placeholder="Type and press enter"
        />
        <TerminalTextarea
          label="Previous project (optional)" rows={3} maxLength={2000}
          value={fields.previous_project_description} onChange={set("previous_project_description")}
          disabled={locked}
        />
        {errors.map((err) => <ErrorLine key={err}>{err}</ErrorLine>)}
        <ErrorLine>{error}</ErrorLine>
        <NoticeLine>
          {saved && (
            <span className="inline-flex items-center gap-[0.35rem]">
              <Check size={14} strokeWidth={3} /> Saved
            </span>
          )}
        </NoticeLine>
        {!locked && (
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Saving…" : idea ? "Save changes" : "Submit idea"}
          </PrimaryButton>
        )}
      </form>
    </Panel>
  );
};

export default IdeaPanel;
