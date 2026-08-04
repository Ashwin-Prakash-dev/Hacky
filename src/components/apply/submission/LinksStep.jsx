import TerminalInput from "../inputs/TerminalInput";
import LinkCheck from "./LinkCheck";
import { APPLYING } from "../../../lib/format";
import {
  ExtLink,
  InlineRef,
  LockNote,
  ReadOnlyLink,
  StepIntro,
  StepTitle,
} from "./ui";

// Step 2. Both are links to material the team already hosts, not uploads.
// Nothing validates that a URL is reachable at submit time, which is exactly
// why the advisory sharing check sits under each field.
const LinksStep = ({ form, errors, onChange, canEdit, leaderName }) => {
  const heading = (
    <div className="mb-4 flex flex-col gap-3">
      <StepTitle>Deck and video</StepTitle>
      <StepIntro>
        Links, not uploads. Set both so <em>anyone with the link</em> can open them.
        If we can&rsquo;t open it, we can&rsquo;t review it.
      </StepIntro>
    </div>
  );

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-1">
        {heading}
        <LockNote>Only {leaderName} can edit these.</LockNote>
        <ReadOnlyLink label="Five-slide deck" value={form.deck_url} />
        <ReadOnlyLink label="Sixty-second team video" value={form.video_url} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {heading}

      <InlineRef label="Your five slides should cover" items={APPLYING.deck} />

      <TerminalInput
        label="Five-slide deck"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://docs.google.com/presentation/d/…"
        value={form.deck_url}
        error={errors.deck_url}
        onChange={(e) => onChange("deck_url", e.target.value)}
      />
      <LinkCheck url={form.deck_url} kind="drive" />

      <InlineRef label="The video" items={APPLYING.video}>
        {APPLYING.videoExamples && (
          <>
            <p className="mt-3 font-general text-[0.82rem] leading-relaxed text-white/50">
              {APPLYING.videoExamples.note}
            </p>
            <p className="mt-2">
              <ExtLink href={APPLYING.videoExamples.url}>
                {APPLYING.videoExamples.label}
              </ExtLink>
            </p>
          </>
        )}
      </InlineRef>

      <TerminalInput
        label="Sixty-second team video"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://youtu.be/…"
        value={form.video_url}
        error={errors.video_url}
        onChange={(e) => onChange("video_url", e.target.value)}
      />
      <LinkCheck url={form.video_url} kind="youtube" />
    </div>
  );
};

export default LinksStep;
