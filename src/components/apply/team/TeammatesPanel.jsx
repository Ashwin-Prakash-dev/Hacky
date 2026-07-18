import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import {
  Panel, Eyebrow, ErrorLine, NoticeLine,
  PrimaryButton, GhostButton, Divider,
} from "../ui";
import { MIN_MEMBERS, MAX_MEMBERS } from "../../../lib/teamRules";
import RosterMeter from "./RosterMeter";

const MemberRow = ({ member, canKick, busy, onKick }) => (
  <div className="flex items-center justify-between gap-3 rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3">
    <div className="min-w-0">
      <p className="font-general text-[0.9rem] font-semibold text-white">
        {member.name}
        {member.role === "leader" && (
          <span className="ml-[0.6rem] font-mono text-xs tracking-[0.12em] text-lime">
            [LEADER]
          </span>
        )}
      </p>
      <p className="truncate font-mono text-[0.82rem] text-white/70">
        {member.email}
      </p>
    </div>
    {canKick && member.role !== "leader" && (
      <GhostButton danger disabled={busy} onClick={() => onKick(member)}>
        remove
      </GhostButton>
    )}
  </div>
);

const InviteRow = ({ invite, canCancel, busy, onCancel }) => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-[rgba(255,180,84,0.35)] bg-[rgba(255,180,84,0.04)] px-4 py-3">
    <div className="min-w-0">
      <p className="truncate font-mono text-[0.85rem] text-white">
        {invite.email}
        <span className="ml-[0.6rem] font-mono text-[0.7rem] tracking-[0.12em] text-[#ffb454]">
          [INVITED]
        </span>
      </p>
      <p className="font-general text-[0.78rem] text-white/50">
        Waiting for them to accept
      </p>
    </div>
    {canCancel && (
      <GhostButton danger disabled={busy} onClick={() => onCancel(invite)}>
        {busy ? "cancelling…" : "cancel"}
      </GhostButton>
    )}
  </div>
);

/** Dashed skeleton slot. Clickable when the roster can still grow. */
const SlotButton = ({ required, interactive, onClick }) => {
  const [hover, setHover] = useState(false);
  const lit = interactive && hover;
  const borderColor = lit
    ? "border-lime/60"
    : required ? "border-lime/30" : "border-white/[0.12]";
  const wrapperClass = `w-full rounded-md border border-dashed px-4 py-3 text-left transition-[border-color,background] duration-200 ${borderColor} ${
    lit ? "bg-lime/5" : "bg-transparent"
  } ${interactive ? "cursor-pointer" : "cursor-default"}`;
  const label = (
    <p className={`font-general text-[0.85rem] ${lit ? "text-lime" : required ? "text-lime/70" : "text-white/50"}`}>
      {interactive
        ? `+ Add teammate${required ? " (needed to compete)" : " (optional)"}`
        : `Open slot${required ? " (needed to compete)" : " (optional 4th member)"}`}
    </p>
  );
  if (!interactive) return <div className={wrapperClass}>{label}</div>;
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={wrapperClass}
    >
      {label}
    </button>
  );
};

/** Modal with both ways to add a teammate: share the join code, or email invite. */
const AddTeammateModal = ({
  open, onClose, joinCode,
  canInvite, onInvite, inviteBusy, inviteError, inviteSentTo,
}) => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; code text is selectable as a fallback
    }
  };

  const submitInvite = (e) => {
    e.preventDefault();
    onInvite(email.trim().toLowerCase(), () => setEmail(""));
  };

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Add a teammate"
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/[0.72] p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-lg border-[0.5px] border-lime/25 bg-[rgba(14,14,14,0.98)] p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="font-general text-[1.1rem] font-bold text-white">
            Add a teammate
          </p>
          <GhostButton onClick={onClose}>
            <span className="inline-flex items-center gap-[0.3rem]">
              <X size={12} strokeWidth={2.5} /> close
            </span>
          </GhostButton>
        </div>

        <p className="mb-[0.6rem] font-general text-[0.85rem] leading-relaxed text-white/70">
          Share this join code. They sign up, then enter it on the join screen:
        </p>
        <div className="flex flex-wrap items-center gap-[0.85rem]">
          <span className="select-all font-mono text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold tracking-[0.25em] text-lime">
            {joinCode}
          </span>
          <GhostButton onClick={copyCode}>
            {copied ? (
              <span className="inline-flex items-center gap-[0.3rem]">
                <Check size={12} strokeWidth={3} /> copied
              </span>
            ) : "copy"}
          </GhostButton>
        </div>

        {canInvite && (
          <>
            <Divider />
            <form onSubmit={submitInvite} noValidate>
              <p className="mb-4 font-general text-[0.85rem] leading-relaxed text-white/70">
                …or invite them by email and we&apos;ll send them a link:
              </p>
              <TerminalInput
                label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <ErrorLine>{inviteError}</ErrorLine>
              <NoticeLine>{inviteSentTo && `Invite sent to ${inviteSentTo}. They'll get an email.`}</NoticeLine>
              <PrimaryButton type="submit" disabled={inviteBusy}>
                {inviteBusy ? "Sending…" : "Send invite"}
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Roster panel: member rows plus dashed "+ Add teammate" slot buttons that
 * open a modal offering the join code and (for the leader) email invites.
 */
const TeammatesPanel = ({
  team, onKick, kickBusyId,
  canInvite, onInvite, inviteBusy, inviteError, inviteSentTo,
  onCancelInvite, cancelBusyId,
}) => {
  const [adding, setAdding] = useState(false);

  const count = team.members.length;
  const invites = team.invites ?? [];
  const confirmed = team.status === "confirmed";
  const isLeader = team.your_role === "leader";
  const canKick = isLeader && !confirmed;
  const canAdd = !confirmed && count < MAX_MEMBERS;
  const openSlots = Math.max(0, MAX_MEMBERS - count - invites.length);

  return (
    <Panel maxWidth="none">
      <div className="flex flex-wrap items-center justify-between gap-[0.6rem]">
        <Eyebrow>Teammates ({count}/{MAX_MEMBERS})</Eyebrow>
        <RosterMeter joined={count} pending={invites.length} min={MIN_MEMBERS} max={MAX_MEMBERS} />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {team.members.map((m) => (
          <MemberRow
            key={m.user_id} member={m}
            canKick={canKick} busy={kickBusyId === m.user_id} onKick={onKick}
          />
        ))}
        {invites.map((inv) => (
          <InviteRow
            key={inv.invite_id} invite={inv}
            canCancel={isLeader && !confirmed}
            busy={cancelBusyId === inv.invite_id}
            onCancel={onCancelInvite}
          />
        ))}
        {Array.from({ length: openSlots }, (_, i) => (
          <SlotButton
            key={`empty-${i}`}
            required={count + invites.length + i < MIN_MEMBERS}
            interactive={canAdd}
            onClick={() => setAdding(true)}
          />
        ))}
      </div>

      <AddTeammateModal
        open={adding}
        onClose={() => setAdding(false)}
        joinCode={team.join_code}
        canInvite={canInvite}
        onInvite={onInvite}
        inviteBusy={inviteBusy}
        inviteError={inviteError}
        inviteSentTo={inviteSentTo}
      />
    </Panel>
  );
};

export default TeammatesPanel;
