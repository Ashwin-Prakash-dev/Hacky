import { CircleCheck, CircleDashed, TriangleAlert } from "lucide-react";
import { priorWorkLabel } from "../../../lib/submission";
import {
  ReadOnlyField,
  ReadOnlyLink,
  SectionLabel,
  StepIntro,
  StepTitle,
} from "./ui";

const EditLink = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-mono text-[0.75rem] tracking-[0.04em] text-lime/85 underline underline-offset-[3px] transition-colors duration-200 hover:text-lime"
  >
    Edit
  </button>
);

const Block = ({ label, onEdit, children }) => (
  <section className="border-t border-white/[0.06] pt-6">
    <div className="mb-5 flex items-baseline justify-between gap-3">
      <SectionLabel>{label}</SectionLabel>
      {onEdit && <EditLink onClick={onEdit} />}
    </div>
    {children}
  </section>
);

// Step 5. Everything read back in one place before it goes to the server, plus
// the two things most likely to be quietly wrong: an unanswered prior-work
// question, and teammates who haven't filled in their own row.
const ReviewStep = ({ form, members, exists, canEdit, onJump }) => {
  const priorWork = form.prior_work;
  const priorWorkUnanswered = !Array.isArray(priorWork);
  const completed = members.filter((m) => m.completed).length;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <StepTitle>{exists ? "Review and update" : "Review and submit"}</StepTitle>
        <StepIntro>
          {exists
            ? "Your application is saved. Anything you change here replaces what we already have."
            : "Nothing’s been sent yet. Read it over, then submit. You can keep editing right up to the deadline."}
        </StepIntro>
      </div>

      {priorWorkUnanswered && (
        <div className="flex items-start gap-[0.6rem] rounded-md border-[0.5px] border-[rgba(255,120,120,0.35)] bg-[rgba(255,120,120,0.06)] px-[1.1rem] py-[0.9rem]">
          <TriangleAlert
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="mt-[0.15em] shrink-0 text-[rgba(255,120,120,0.95)]"
          />
          <p className="font-general text-[0.87rem] leading-relaxed text-white/75">
            You haven&rsquo;t answered the prior work question. Undeclared prior work can
            lead to penalties at the event, so answer it even if the answer is
            &ldquo;nothing&rdquo;.{" "}
            {canEdit && <EditLink onClick={() => onJump(3)} />}
          </p>
        </div>
      )}

      <Block label="The idea" onEdit={canEdit ? () => onJump(1) : null}>
        <ReadOnlyField label="Title" value={form.title} />
        <ReadOnlyField label="Summary" value={form.summary} />
        <ReadOnlyField label="Evidence the problem is real" value={form.problem_evidence} />
      </Block>

      <Block label="Deck and video" onEdit={canEdit ? () => onJump(2) : null}>
        <ReadOnlyLink label="Five-slide deck" value={form.deck_url} />
        <ReadOnlyLink label="Sixty-second team video" value={form.video_url} />
      </Block>

      <Block label="Prior work" onEdit={canEdit ? () => onJump(3) : null}>
        {priorWorkUnanswered && (
          <p className="font-general text-[0.95rem] text-white/40">Not answered yet.</p>
        )}
        {Array.isArray(priorWork) && priorWork.length === 0 && (
          <p className="font-general text-[0.95rem] text-white/85">
            Nothing declared. Your team is starting from scratch.
          </p>
        )}
        {Array.isArray(priorWork) && priorWork.length > 0 && (
          <ul className="grid gap-4">
            {priorWork.map((entry, i) => (
              <li key={i}>
                <p className="font-general text-[0.85rem] font-bold text-white">
                  {priorWorkLabel(entry.kind)}
                </p>
                <p className="mt-1 font-general text-[0.88rem] leading-relaxed text-white/65">
                  {entry.description}
                </p>
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all font-mono text-[0.78rem] text-lime/90 underline underline-offset-[3px]"
                  >
                    {entry.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Block>

      {/* updated_at === null on a member means that person has filled in
          nothing at all: the one reliable completion signal the API gives. */}
      <Block label={`Team details · ${completed} of ${members.length} filled in`} onEdit={() => onJump(4)}>
        <ul className="grid gap-3">
          {members.map((member) => (
            <li key={member.user_id} className="flex items-center gap-[0.6rem]">
              {member.completed ? (
                <CircleCheck
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-lime"
                />
              ) : (
                <CircleDashed
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-white/35"
                />
              )}
              <span className="font-general text-[0.92rem] text-white/85">{member.name}</span>
              {member.role === "leader" && (
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-lime/70">
                  leader
                </span>
              )}
              {!member.completed && (
                <span className="font-general text-[0.85rem] text-white/40">
                  nothing filled in
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-general text-[0.85rem] leading-relaxed text-white/50">
          Everyone fills in their own row. A blank row won&rsquo;t stop you submitting,
          but it&rsquo;s a wasted chance to show what your team can do.
        </p>
      </Block>
    </div>
  );
};

export default ReviewStep;
