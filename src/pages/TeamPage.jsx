import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import ConfirmDialog from "../components/apply/ConfirmDialog";
import WhatsAppNotice from "../components/apply/WhatsAppNotice";
import TeammatesPanel from "../components/apply/team/TeammatesPanel";
import {
  Panel,
  ErrorLine,
  NoticeLine,
  PrimaryButton,
  GhostButton,
  MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { clearAuth } from "../lib/auth";
import { applicationsOpen, SELECTION_FEE_DUE_LABEL } from "../lib/phase";
import { isComplete } from "../lib/logistics";
import {
  currentMember,
  isRegistered,
  isSelected,
  selectionFee,
  selectionFeeSettled,
} from "../lib/teamRules";

// The one entry point to /submission. It appears only in the "done" stage,
// which is exactly the confirmed-payment state /submission itself requires,
// so the link is never shown to a team that would just be bounced back.
const IdeaPanel = () => (
  <div className="rounded-md border-[0.5px] border-lime/30 bg-lime/[0.06] px-[1.1rem] py-[0.9rem]">
    {applicationsOpen() ? (
      <>
        <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
          Submissions are open. This is the part that gets you shortlisted: the
          problem you picked, what convinced you it&rsquo;s real, and a deck and
          video to show for it.
        </p>
        <Link
          to="/submission"
          className="mt-4 inline-flex items-center gap-[0.4rem] rounded bg-lime px-6 py-[0.7rem] font-mono text-[0.78rem] font-bold uppercase tracking-[0.14em] text-black no-underline transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:translate-y-[-2px]"
        >
          Submit your idea
          <ArrowRight size={14} />
        </Link>
      </>
    ) : (
      <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
        Submissions aren&rsquo;t open yet. When they are, this is where your
        team pitches its idea.
      </p>
    )}
  </div>
);

// One line of the shortlist checklist. Done is a filled tick and grey text
// rather than a strikethrough: the outstanding line has to stay the readable
// one, and struck-out text reads as cancelled rather than finished.
const TaskRow = ({ done, children }) => (
  <li className="flex items-start gap-3">
    <span
      className={`mt-[0.15rem] flex size-[18px] shrink-0 items-center justify-center rounded-full border-[0.5px] ${
        done
          ? "border-lime/50 bg-lime/[0.15] text-lime"
          : "border-white/25 text-transparent"
      }`}
    >
      <Check size={11} strokeWidth={3} aria-hidden="true" />
    </span>
    <span className={done ? "text-white/40" : "text-white/85"}>
      <span className="sr-only">{done ? "Done: " : "Still to do: "}</span>
      {children}
    </span>
  </li>
);

// Replaces IdeaPanel once a team is shortlisted. Two things are left to do and
// they are independent of each other, so both live here: the fee keeps the lime
// button, the form sits under it as a quieter link.
const ShortlistTasks = ({ team, logisticsDone }) => (
  <div className="rounded-md border-[0.5px] border-lime/30 bg-lime/[0.06] px-[1.1rem] py-[0.9rem]">
    <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
      Your team made the shortlist. Every seat costs &#8377;{selectionFee(team)}
      , and all of them have to be paid by {SELECTION_FEE_DUE_LABEL}. If anyone
      misses it the whole team is disqualified and the fees are refunded. Pay
      for your own, or cover teammates in one transfer.
    </p>
    <Link
      to="/payment"
      className="mt-4 inline-flex items-center gap-[0.4rem] rounded bg-lime px-6 py-[0.7rem] font-mono text-[0.78rem] font-bold uppercase tracking-[0.14em] text-black no-underline transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:translate-y-[-2px]"
    >
      Pay your selection fee
      <ArrowRight size={14} />
    </Link>

    <p className="mt-5 font-general text-[0.85rem] leading-relaxed text-lime/70">
      {logisticsDone
        ? "Your food and travel answers are in. Change them any time."
        : "We also need your food and travel details before the event, so we cook to the right numbers and know when you get here."}
    </p>
    <MonoLink to="/logistics">
      {logisticsDone ? "review food and travel" : "fill in food and travel"}
    </MonoLink>
  </div>
);

const TeamPage = () => {
  const navigate = useNavigate();
  // /submission bounces people back here with a reason when they aren't
  // eligible yet, so a shared link doesn't dead-end without explanation.
  //
  // Read once into state, then stripped from the history entry below. Router
  // state outlives the render that consumed it: without the strip, a reload or
  // a back-navigation resurrects a message that may no longer be true.
  const location = useLocation();
  const [redirectNotice, setRedirectNotice] = useState(
    location.state?.notice ?? "",
  );
  const [team, setTeam] = useState(null);
  const [stage, setStage] = useState(null); // "suspended" | "done"
  const [loadError, setLoadError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSentTo, setInviteSentTo] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
  const [promoteBusyId, setPromoteBusyId] = useState(null);
  const [cancelBusyId, setCancelBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);
  // { title, body, confirmLabel, danger?, action }
  const [confirm, setConfirm] = useState(null);
  // The fee prompt is dismissible but not remembered: a shortlisted member who
  // hasn't paid meets it again every time they land here, because nothing else
  // on this page matters until their seat is paid for.
  const [feePromptDismissed, setFeePromptDismissed] = useState(false);
  // Null until the roster comes back, so the prompt never claims an unanswered
  // form on a team whose answers simply haven't loaded.
  const [myLogistics, setMyLogistics] = useState(null);

  const me = useMemo(() => currentMember(team), [team]);
  const owesSelectionFee =
    !!team && isSelected(team) && !selectionFeeSettled(me);
  const owesLogistics =
    !!team && isSelected(team) && !!myLogistics && !isComplete(myLogistics.row);

  const refresh = useCallback(() => {
    setLoadError("");
    return api
      .getTeam()
      .then(setTeam)
      .catch((err) => {
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setLoadError(err.message);
      });
  }, [navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Only a shortlisted team has a form to fill in, and a failure here is not
  // worth an error on this page: the worst case is that the prompt and the card
  // stay quiet until the next load.
  useEffect(() => {
    if (!team || !isSelected(team) || !me) return;
    let cancelled = false;
    api
      .getLogistics()
      .then((data) => {
        if (cancelled) return;
        const rows = data?.members ?? (Array.isArray(data) ? data : []);
        setMyLogistics({
          row: rows.find((r) => r.user_id === me.user_id) ?? null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [team, me]);

  useEffect(() => {
    if (!location.state?.notice) return;
    setRedirectNotice(location.state.notice);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  // Registration is closed for the rest of the event: a team that finished
  // registering keeps going, anyone else is frozen where they stand. Shortlisted
  // teams read as registered too, so being picked never demotes a team into the
  // suspended state.
  useEffect(() => {
    if (!team) return;
    setStage(isRegistered(team) ? "done" : "suspended");
  }, [team]);

  const anyBusy = () =>
    kickBusyId || promoteBusyId || cancelBusyId || inviteBusy || leaveBusy;

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const invite = async (email, onSent) => {
    if (anyBusy()) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setInviteBusy(true);
    setInviteError("");
    setInviteSentTo("");
    try {
      await api.invite(email);
      setInviteSentTo(email);
      onSent();
      await refresh();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const kick = (member) => {
    if (anyBusy()) return;
    setConfirm({
      title: `Remove ${member.name}?`,
      body: "They'll be taken off the roster. They can rejoin later with the join code or a new invite.",
      confirmLabel: "Remove",
      action: async () => {
        setConfirm(null);
        setKickBusyId(member.user_id);
        setActionError("");
        try {
          await api.kickMember(member.user_id);
          await refresh();
        } catch (err) {
          setActionError(err.message);
        } finally {
          setKickBusyId(null);
        }
      },
    });
  };

  const promote = (member) => {
    if (anyBusy()) return;
    setConfirm({
      title: `Make ${member.name} the leader?`,
      body: "They take over invites, removals and the idea submission. You stay on the roster as an ordinary member, and only they can hand it back.",
      confirmLabel: "Hand over",
      danger: false,
      action: async () => {
        setConfirm(null);
        setPromoteBusyId(member.user_id);
        setActionError("");
        try {
          await api.transferLeadership(member.user_id);
          // your_role is stale for both of us now; the refetch is what fixes it.
          await refresh();
        } catch (err) {
          setActionError(err.message);
        } finally {
          setPromoteBusyId(null);
        }
      },
    });
  };

  const cancelInvite = async (inv) => {
    if (anyBusy()) return;
    setCancelBusyId(inv.invite_id);
    setActionError("");
    try {
      await api.cancelInvite(inv.invite_id);
      await refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancelBusyId(null);
    }
  };

  const leave = () => {
    if (anyBusy()) return;
    const isLeader = team.your_role === "leader";
    const confirmed = isRegistered(team);
    const fee = team.expected_fee ?? 100;
    setConfirm({
      // A leader can only reach this once the team is unpaid: leaving deletes
      // the team, and the API refuses that after payment (see handOverOnly).
      title: isLeader ? "Disband the team?" : "Leave this team?",
      body: isLeader
        ? "This deletes the team for everyone and can't be undone. Your teammates will have to start over."
        : confirmed
          ? `You'll be removed from the roster. Your team's ₹${fee} registration fee has already been paid and won't be refunded to you. You can rejoin later with the join code or a new invite.`
          : "You'll be removed from the roster. You can rejoin later with the join code or a new invite.",
      confirmLabel: isLeader ? "Disband team" : "Leave team",
      action: async () => {
        setConfirm(null);
        setLeaveBusy(true);
        setActionError("");
        try {
          await api.leaveTeam();
          navigate("/onboarding", { replace: true });
        } catch (err) {
          setActionError(err.message);
          setLeaveBusy(false);
        }
      },
    });
  };

  const headerRight = (
    <div className="flex items-center gap-5">
      <MonoLink to="/profile">profile</MonoLink>
      <GhostButton onClick={logout}>logout</GhostButton>
    </div>
  );

  if (loadError) {
    return (
      <AuthShell label="TEAM" right={headerRight}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={refresh}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  if (!team || !stage) {
    return (
      <AuthShell label="TEAM">
        <p className="font-mono text-[0.8rem] text-lime/70">
          Loading your team…
        </p>
      </AuthShell>
    );
  }

  const isLeader = team.your_role === "leader";
  const memberCount = team.members.length;

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-mono text-[clamp(1.5rem,5vw,2.2rem)] font-bold tracking-[0.02em] text-white">
        {team.team_name}
      </h1>
    </div>
  );

  // Leaving deletes the team when the leader does it, so a paid team's leader
  // has to hand the role over first. Nothing to click here — the way out is
  // "make leader" on a teammate's row above.
  const handOverOnly = isLeader && isRegistered(team);

  const leaveBlock = (
    <div className="border-t border-white/[0.06] pt-2">
      {handOverOnly ? (
        <p className="font-general text-[0.85rem] leading-relaxed text-white/50">
          {memberCount > 1 ? (
            "Your team has already paid, so it can't be deleted. Hand leadership to a teammate above, then leave as an ordinary member."
          ) : (
            <>
              Your team has already paid, so it can&rsquo;t be deleted, and
              there&rsquo;s no teammate to hand leadership to. Email{" "}
              <a
                href="mailto:support@sctcoding.club"
                className="text-lime/80 underline underline-offset-[3px]"
              >
                support@sctcoding.club
              </a>{" "}
              if you need to withdraw.
            </>
          )}
        </p>
      ) : (
        <GhostButton danger disabled={leaveBusy} onClick={leave}>
          {isLeader ? "Disband team" : "Leave team"}
        </GhostButton>
      )}
    </div>
  );

  return (
    <AuthShell
      label="TEAM"
      step={stage === "done" ? "idea" : "team"}
      right={headerRight}
    >
      <PhaseTransition>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          {header}

          <NoticeLine>{redirectNotice}</NoticeLine>

          {stage === "suspended" && (
            <Panel maxWidth="none">
              <p className="font-general text-[0.9rem] leading-relaxed text-white/70">
                Registration is closed. Your team wasn&rsquo;t confirmed before
                the cutoff, so there&rsquo;s nothing left to do here. You
                can&rsquo;t invite, remove, or leave.
              </p>
              <p className="mt-3 font-general text-[0.85rem] leading-relaxed text-white/50">
                Questions? Email{" "}
                <a
                  href="mailto:support@sctcoding.club"
                  className="text-lime/80 underline underline-offset-[3px]"
                >
                  support@sctcoding.club
                </a>
                .
              </p>
            </Panel>
          )}

          {stage === "done" && (
            <>
              {isSelected(team) ? (
                <ShortlistTasks
                  team={team}
                  logisticsDone={!!myLogistics && isComplete(myLogistics.row)}
                />
              ) : (
                <IdeaPanel />
              )}

              <TeammatesPanel
                team={team}
                onKick={kick}
                kickBusyId={kickBusyId}
                canInvite={isLeader}
                onInvite={invite}
                inviteBusy={inviteBusy}
                inviteError={inviteError}
                inviteSentTo={inviteSentTo}
                onCancelInvite={cancelInvite}
                cancelBusyId={cancelBusyId}
                onPromote={promote}
                promoteBusyId={promoteBusyId}
              />

              <ErrorLine>{actionError}</ErrorLine>

              {leaveBlock}
            </>
          )}
        </div>
      </PhaseTransition>

      <ConfirmDialog
        open={(owesSelectionFee || owesLogistics) && !feePromptDismissed}
        title="Your team made the shortlist"
        body={
          <>
            <p>
              {owesSelectionFee && owesLogistics
                ? "Two things to do before the event, in any order."
                : "One thing left before the event."}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {/* A finished line keeps only its subject. The reasoning behind
                  each one exists to get it done, so it retires with it. */}
              <TaskRow done={!owesSelectionFee}>
                {owesSelectionFee ? (
                  <>
                    Pay your seat, &#8377;{selectionFee(team)}. Every seat has
                    to be paid by {SELECTION_FEE_DUE_LABEL}, or the team is
                    disqualified and the fees are refunded.
                  </>
                ) : (
                  "Your seat is paid."
                )}
              </TaskRow>
              <TaskRow done={!owesLogistics}>
                {owesLogistics
                  ? "Tell us what you eat and when you get here, so we cook to the right numbers."
                  : "Your food and travel details are in."}
              </TaskRow>
            </ul>
          </>
        }
        confirmLabel={owesSelectionFee ? "Pay now" : "Fill it in"}
        cancelLabel="Not now"
        danger={false}
        onConfirm={() => navigate(owesSelectionFee ? "/payment" : "/logistics")}
        onCancel={() => setFeePromptDismissed(true)}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger ?? true}
        busy={leaveBusy || !!kickBusyId || !!promoteBusyId}
        onConfirm={() => confirm?.action()}
        onCancel={() => setConfirm(null)}
      />

      <WhatsAppNotice />
    </AuthShell>
  );
};

export default TeamPage;
