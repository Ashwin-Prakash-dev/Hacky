import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, ErrorLine, NoticeLine, PrimaryButton } from "../ui";

const MAX_PROJECT_LINKS = 5;

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const fieldsFromEntry = (entry) => ({
  github: entry?.github ?? "",
  linkedin: entry?.linkedin ?? "",
  project_links: entry?.project_links?.length ? entry.project_links : [],
});

/** Self-service github/linkedin/project links — any team member edits only their own entry. */
const MyLinksPanel = ({ myEntry, locked, onSubmit, busy, error, saved }) => {
  const [fields, setFields] = useState(() => fieldsFromEntry(myEntry));
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setFields(fieldsFromEntry(myEntry));
    // Only re-sync when the server-side entry itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myEntry?.github, myEntry?.linkedin, JSON.stringify(myEntry?.project_links)]);

  const setLink = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const setProjectLink = (i) => (e) =>
    setFields((prev) => ({
      ...prev,
      project_links: prev.project_links.map((l, idx) => (idx === i ? e.target.value : l)),
    }));

  const addProjectLink = () =>
    setFields((prev) => ({ ...prev, project_links: [...prev.project_links, ""] }));

  const removeProjectLink = (i) =>
    setFields((prev) => ({ ...prev, project_links: prev.project_links.filter((_, idx) => idx !== i) }));

  const submit = (e) => {
    e.preventDefault();
    const invalid = [];
    if (fields.github.trim() && !isValidUrl(fields.github.trim())) {
      invalid.push("GitHub link must be a full URL, e.g. https://github.com/you.");
    }
    if (fields.linkedin.trim() && !isValidUrl(fields.linkedin.trim())) {
      invalid.push("LinkedIn link must be a full URL, e.g. https://linkedin.com/in/you.");
    }
    const trimmedLinks = fields.project_links.map((l) => l.trim()).filter(Boolean);
    if (trimmedLinks.some((l) => !isValidUrl(l))) {
      invalid.push("Every project link must be a full URL.");
    }
    if (invalid.length) {
      setErrors(invalid);
      return;
    }
    setErrors([]);
    onSubmit({
      github: fields.github.trim(),
      linkedin: fields.linkedin.trim(),
      project_links: trimmedLinks,
    });
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>Your showcase links</Eyebrow>
      <p className="mt-2 font-general text-[0.85rem] leading-relaxed text-white/60">
        Just your own — everyone on the team sets these independently.
      </p>
      <form onSubmit={submit} noValidate className="mt-4">
        <TerminalInput
          label="GitHub" placeholder="https://github.com/you"
          value={fields.github} onChange={setLink("github")} disabled={locked}
        />
        <TerminalInput
          label="LinkedIn" placeholder="https://linkedin.com/in/you"
          value={fields.linkedin} onChange={setLink("linkedin")} disabled={locked}
        />

        <div className="mb-7">
          <label className="mb-[0.55rem] block select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
            Project links
          </label>
          <div className="flex flex-col gap-2">
            {fields.project_links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={link}
                  placeholder="https://…"
                  disabled={locked}
                  onChange={setProjectLink(i)}
                  className="w-full rounded-md border border-white/[0.18] bg-white/5 px-[0.9rem] py-[0.7rem] font-general text-[0.95rem] font-normal text-white caret-lime outline-none transition-[border-color,background,box-shadow] duration-[250ms] focus:border-lime focus:bg-lime/[0.04] focus:shadow-[0_0_0_3px_rgba(200,255,0,0.12)]"
                />
                {!locked && (
                  <button
                    type="button"
                    aria-label="Remove link"
                    onClick={() => removeProjectLink(i)}
                    className="shrink-0 cursor-pointer text-white/40 hover:text-white/80"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!locked && fields.project_links.length < MAX_PROJECT_LINKS && (
            <button
              type="button"
              onClick={addProjectLink}
              className="mt-2 inline-flex cursor-pointer items-center gap-[0.3rem] font-mono text-[0.8rem] tracking-[0.03em] text-lime/80 hover:text-lime"
            >
              <Plus size={12} strokeWidth={2.5} /> add project link
            </button>
          )}
        </div>

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
            {busy ? "Saving…" : "Save your links"}
          </PrimaryButton>
        )}
      </form>
    </Panel>
  );
};

export default MyLinksPanel;
