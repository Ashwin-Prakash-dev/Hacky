// Everything the idea-submission flow needs that isn't a React component:
// the API's own rules restated as client-side validation, the merge step both
// PUTs demand, and the local draft that keeps a half-written application alive
// across a refresh.
//
// Two API behaviours drive most of what's in here:
//
//   1. Both PUTs REPLACE the whole record. An omitted field is cleared, not
//      left alone. Nothing may ever PUT a partial object, which is why the
//      form state is hydrated with every field up front and the payload
//      builders below always emit all of them. A step that edits one field
//      still sends the other five untouched.
//   2. The application PUT validates every field at once, so a half-filled
//      application cannot be stored at all. Until the first successful PUT
//      the only home for the answers is the draft below.

import { APPLICATIONS_CLOSE } from "./phase";

// ── prior work ──────────────────────────────────────────────────────────────

// The `kind` values the API accepts. Anything outside this list is a 400.
// Labels are the ones suggested in the API docs, matched to the wording
// /format already uses in BEFORE_THE_EVENT.declare.
//
// `other` is the catch-all for things the eight named categories don't cover:
// a signed agreement, a domain, an existing waitlist. It sits last because a
// team should reach for a specific category first; picking it prompts for a
// name in the description, since that is the only place the real nature of the
// item can be recorded.
export const PRIOR_WORK_KINDS = [
  { value: "repository", label: "Existing repository" },
  { value: "prototype", label: "Existing prototype" },
  { value: "prior_version", label: "Previous version of the idea" },
  { value: "prior_competition", label: "Previous competition with this idea" },
  { value: "design_file", label: "Existing design file" },
  { value: "dataset_or_model", label: "Existing dataset or model" },
  { value: "reusable_component", label: "Generic reusable component" },
  { value: "hosted_app", label: "Hosted application" },
  { value: "other", label: "Something else" },
];

export const priorWorkLabel = (value) =>
  PRIOR_WORK_KINDS.find((k) => k.value === value)?.label ?? value;

// ── limits, mirrored from the API's validation ──────────────────────────────

export const LIMITS = {
  title: { min: 3, max: 100 },
  summary: { min: 10, max: 300 },
  problem_evidence: { min: 10, max: 1000 },
  about: { max: 1000 },
  prior_work_description: { min: 1, max: 500 },
  prior_work_entries: 20,
  project_links: 5,
};

// ── shapes ──────────────────────────────────────────────────────────────────

export const emptyApplication = () => ({
  title: "",
  summary: "",
  problem_evidence: "",
  deck_url: "",
  video_url: "",
  // null is "never answered", [] is "we explicitly declared nothing". The two
  // are not interchangeable: undeclared prior work carries a penalty at the
  // event, so the form has to be able to tell them apart.
  prior_work: null,
});

export const emptyMember = () => ({
  about: "",
  resume_url: "",
  github: "",
  linkedin: "",
  project_links: [],
});

// The API returns null for anything unset; the form wants "" so inputs stay
// controlled. prior_work keeps its null, because null is meaningful there.
export const applicationFromServer = (data) => ({
  title: data?.title ?? "",
  summary: data?.summary ?? "",
  problem_evidence: data?.problem_evidence ?? "",
  deck_url: data?.deck_url ?? "",
  video_url: data?.video_url ?? "",
  prior_work: Array.isArray(data?.prior_work)
    ? data.prior_work.map((entry) => ({
        kind: entry?.kind ?? "repository",
        url: entry?.url ?? "",
        description: entry?.description ?? "",
      }))
    : null,
});

export const memberFromServer = (member) => ({
  about: member?.about ?? "",
  resume_url: member?.resume_url ?? "",
  github: member?.github ?? "",
  linkedin: member?.linkedin ?? "",
  project_links: Array.isArray(member?.project_links) ? member.project_links : [],
});

// ── payloads ────────────────────────────────────────────────────────────────

const trimmed = (value) => (typeof value === "string" ? value.trim() : value);

// Empty optional strings are dropped rather than sent as "", which would fail
// the API's URL validation. Dropping them clears the field, which is what an
// emptied input means anyway.
const omitEmpty = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== "" && v !== undefined));

export const toApplicationPayload = (form) => {
  const payload = {
    title: trimmed(form.title),
    summary: trimmed(form.summary),
    problem_evidence: trimmed(form.problem_evidence),
    deck_url: trimmed(form.deck_url),
    video_url: trimmed(form.video_url),
  };
  // Only send prior_work once it has actually been answered. Sending null
  // would either be rejected or overwrite a real answer with "unanswered";
  // omitting it leaves an unanswered field unanswered.
  if (Array.isArray(form.prior_work)) {
    payload.prior_work = form.prior_work.map((entry) =>
      omitEmpty({
        kind: entry.kind,
        url: trimmed(entry.url),
        description: trimmed(entry.description),
      })
    );
  }
  return payload;
};

export const toMemberPayload = (form) =>
  omitEmpty({
    about: trimmed(form.about),
    resume_url: trimmed(form.resume_url),
    github: trimmed(form.github),
    linkedin: trimmed(form.linkedin),
    // An empty array is sent deliberately: it clears previously saved links,
    // which is the only way to remove them given there is no delete route.
    project_links: form.project_links.map(trimmed).filter(Boolean),
  });

// ── validation ──────────────────────────────────────────────────────────────

const isUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const lengthError = (value, { min, max }, noun) => {
  const length = trimmed(value)?.length ?? 0;
  if (min && length < min) {
    return length === 0
      ? `${noun} is required.`
      : `${noun} needs at least ${min} characters.`;
  }
  if (max && length > max) return `${noun} must be ${max} characters or fewer.`;
  return null;
};

export const validateIdea = (form) => {
  const errors = {};
  const title = lengthError(form.title, LIMITS.title, "A title");
  if (title) errors.title = title;
  const summary = lengthError(form.summary, LIMITS.summary, "A summary");
  if (summary) errors.summary = summary;
  const evidence = lengthError(
    form.problem_evidence,
    LIMITS.problem_evidence,
    "Your evidence"
  );
  if (evidence) errors.problem_evidence = evidence;
  return errors;
};

export const validateLinks = (form) => {
  const errors = {};
  if (!trimmed(form.deck_url)) errors.deck_url = "A link to your deck is required.";
  else if (!isUrl(form.deck_url)) errors.deck_url = "Enter a full URL, starting with https://";
  if (!trimmed(form.video_url)) errors.video_url = "A link to your video is required.";
  else if (!isUrl(form.video_url)) errors.video_url = "Enter a full URL, starting with https://";
  return errors;
};

// Keyed by index so each row can show its own message.
export const validatePriorWork = (priorWork) => {
  const errors = {};
  if (!Array.isArray(priorWork)) {
    return { form: "Answer this before you submit, even if it's to declare nothing." };
  }
  if (priorWork.length > LIMITS.prior_work_entries) {
    errors.form = `Declare at most ${LIMITS.prior_work_entries} items.`;
  }
  priorWork.forEach((entry, i) => {
    const rowErrors = {};
    if (!PRIOR_WORK_KINDS.some((k) => k.value === entry.kind)) {
      rowErrors.kind = "Pick what this is.";
    }
    const description = lengthError(
      entry.description,
      LIMITS.prior_work_description,
      "A description"
    );
    if (description) rowErrors.description = description;
    if (trimmed(entry.url) && !isUrl(entry.url)) {
      rowErrors.url = "Enter a full URL, or leave this empty.";
    }
    if (Object.keys(rowErrors).length) errors[i] = rowErrors;
  });
  return errors;
};

export const validateMember = (form) => {
  const errors = {};
  const about = lengthError(form.about, LIMITS.about, "This");
  // `about` is optional, so only the max matters, and an empty value is fine.
  if (about && trimmed(form.about)) errors.about = about;
  ["resume_url", "github", "linkedin"].forEach((field) => {
    if (trimmed(form[field]) && !isUrl(form[field])) {
      errors[field] = "Enter a full URL, starting with https://";
    }
  });
  const links = form.project_links.filter((l) => trimmed(l));
  if (links.length > LIMITS.project_links) {
    errors.project_links = `Add at most ${LIMITS.project_links} links.`;
  } else if (links.some((l) => !isUrl(l))) {
    errors.project_links = "Every project link must be a full URL.";
  }
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

// ── server error mapping ────────────────────────────────────────────────────

// A 400 arrives as one string: "title: too short; deck_url: Invalid url".
// Split on "; ", then on the FIRST ": " only, because the message half regularly
// contains colons of its own ("String must contain at least 3 character(s)").
// Nested paths ("prior_work.0.description") are keyed by their first segment
// so they land on the step that owns them.
export const parseFieldErrors = (message) => {
  const errors = {};
  if (typeof message !== "string") return errors;
  message.split("; ").forEach((part) => {
    const at = part.indexOf(": ");
    if (at === -1) return;
    const path = part.slice(0, at).trim();
    const text = part.slice(at + 2).trim();
    if (!path || !text) return;
    const field = path.split(".")[0];
    // Keep the first error per field; later ones are usually the same cause.
    if (!errors[field]) errors[field] = text;
  });
  return errors;
};

// The API returns these verbatim, and several status codes carry two distinct
// meanings, so branching happens on the string rather than the code.
export const isClosedError = (err) =>
  err?.status === 403 && /applications are closed/i.test(err?.message ?? "");

export const isNoTeamError = (err) =>
  err?.status === 404 && /don'?t have a team/i.test(err?.message ?? "");

export const isNoApplicationError = (err) =>
  err?.status === 404 && /hasn'?t submitted an application/i.test(err?.message ?? "");

// ── draft ───────────────────────────────────────────────────────────────────

// Keyed by team so a user who leaves one team and joins another never sees
// the old team's answers.
const draftKey = (teamId) => `st_application_draft_${teamId}`;

export const loadDraft = (teamId) => {
  if (!teamId) return null;
  try {
    const raw = localStorage.getItem(draftKey(teamId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // A draft written before the deadline is worthless after it, and a stale
    // one would silently overwrite what the server already has.
    if (parsed?.savedAt && parsed.savedAt > APPLICATIONS_CLOSE.getTime()) return null;
    return parsed?.form ?? null;
  } catch {
    return null;
  }
};

export const saveDraft = (teamId, form) => {
  if (!teamId) return;
  try {
    localStorage.setItem(
      draftKey(teamId),
      JSON.stringify({ savedAt: Date.now(), form })
    );
  } catch {
    // A full or disabled localStorage must not break the form. The answers
    // still live in React state for this session.
  }
};

export const clearDraft = (teamId) => {
  if (!teamId) return;
  try {
    localStorage.removeItem(draftKey(teamId));
  } catch {
    // Nothing to do. A stale draft is harmless once the server has the data.
  }
};
