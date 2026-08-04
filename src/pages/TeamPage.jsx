import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import ConfirmDialog from "../components/apply/ConfirmDialog";
import TeammatesPanel from "../components/apply/team/TeammatesPanel";
import ReferralCodePanel from "../components/apply/team/ReferralCodePanel";
import PaymentPanel from "../components/apply/team/PaymentPanel";
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
import { applicationsOpen } from "../lib/phase";
import { MIN_MEMBERS } from "../lib/teamRules";

const StepLabel = ({ children }) => (
  <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime/85">
    {children}
  </p>
);

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
        Submissions aren&rsquo;t open yet. When they are, this is where your team
        pitches its idea.
      </p>
    )}
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
  const [redirectNotice, setRedirectNotice] = useState(location.state?.notice ?? "");
  const [team, setTeam] = useState(null);
  const [stage, setStage] = useState(null); // "roster" | "payment" | "done"
  const [loadError, setLoadError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSentTo, setInviteSentTo] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [applyRefBusy, setApplyRefBusy] = useState(false);
  const [applyRefError, setApplyRefError] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
  const [cancelBusyId, setCancelBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [confirm, setConfirm] = useState(null); // { title, body, confirmLabel, action }

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

  useEffect(() => {
    if (!location.state?.notice) return;
    setRedirectNotice(location.state.notice);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  // Keep the wizard stage consistent with the team's actual state.
  useEffect(() => {
    if (!team) return;
    const rosterReady = team.members.length >= MIN_MEMBERS;
    if (team.status === "confirmed") setStage("done");
    else if (!rosterReady) setStage("roster");
    else setStage((s) => s ?? "payment");
  }, [team]);

  const anyBusy = () =>
    kickBusyId ||
    cancelBusyId ||
    inviteBusy ||
    payBusy ||
    leaveBusy ||
    applyRefBusy;

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

  const pay = async (transactionId) => {
    if (anyBusy()) return;
    setPayBusy(true);
    setPayError("");
    try {
      await api.submitPayment(transactionId);
      await refresh();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPayBusy(false);
    }
  };

  const applyReferralCode = async (code) => {
    if (anyBusy()) return;
    setApplyRefBusy(true);
    setApplyRefError("");
    try {
      await api.applyReferral(code);
      await refresh();
    } catch (err) {
      setApplyRefError(err.message);
    } finally {
      setApplyRefBusy(false);
    }
  };

  const leave = () => {
    if (anyBusy()) return;
    const isLeader = team.your_role === "leader";
    const confirmed = team.status === "confirmed";
    const fee = team.expected_fee ?? 100;
    setConfirm({
      title: isLeader ? "Disband the team?" : "Leave this team?",
      body: isLeader
        ? confirmed
          ? `This deletes the team for everyone and can't be undone. Your ₹${fee} registration fee won't be refunded, and your teammates will have to start over.`
          : "This deletes the team for everyone and can't be undone. Your teammates will have to start over."
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
  const rosterReady = memberCount >= MIN_MEMBERS;
  const missing = MIN_MEMBERS - memberCount;

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-mono text-[clamp(1.5rem,5vw,2.2rem)] font-bold tracking-[0.02em] text-white">
        {team.team_name}
      </h1>
    </div>
  );

  return (
    <AuthShell
      label="TEAM"
      step={stage === "done" ? "idea" : stage === "payment" ? "pay" : "team"}
      right={headerRight}
    >
      <PhaseTransition>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          {header}

          <NoticeLine>{redirectNotice}</NoticeLine>

          {stage === "roster" && (
            <>
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
              />

              <PrimaryButton
                disabled={!rosterReady}
                onClick={() => setStage("payment")}
              >
                <span className="inline-flex items-center gap-[0.4rem]">
                  {rosterReady ? (
                    <>
                      Continue to payment <ArrowRight size={14} />
                    </>
                  ) : (
                    `Add ${missing} more to continue`
                  )}
                </span>
              </PrimaryButton>

              <ErrorLine>{actionError}</ErrorLine>

              <div className="border-t border-white/[0.06] pt-2">
                <GhostButton danger disabled={leaveBusy} onClick={leave}>
                  {isLeader ? "Disband team" : "Leave team"}
                </GhostButton>
              </div>
            </>
          )}

          {stage === "payment" && (
            <>
              <StepLabel>Step 2 of 2: Payment</StepLabel>

              <p className="font-general text-sm leading-relaxed text-white/70">
                After payment, your team will be eligible to submit an idea once
                the problem statement is released. From those submissions, 20
                teams will be shortlisted.
              </p>

              <PaymentPanel
                team={team}
                locked={!rosterReady}
                onSubmit={pay} busy={payBusy} error={payError}
                onApplyReferral={applyReferralCode}
                applyRefBusy={applyRefBusy}
                referralError={applyRefError}
              />

              <ErrorLine>{actionError}</ErrorLine>
              <div>
                <GhostButton onClick={() => setStage("roster")}>
                  <span className="inline-flex items-center gap-[0.35rem]">
                    <ArrowLeft size={13} /> Back to your roster
                  </span>
                </GhostButton>
              </div>
            </>
          )}

          {stage === "done" && (
            <>
              <IdeaPanel />

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
              />

              <ReferralCodePanel
                code={team.referral_code}
                count={team.referral_count}
              />

              <ErrorLine>{actionError}</ErrorLine>

              <div className="border-t border-white/[0.06] pt-2">
                <GhostButton danger disabled={leaveBusy} onClick={leave}>
                  {isLeader ? "Disband team" : "Leave team"}
                </GhostButton>
              </div>
            </>
          )}

          {stage !== "done" && (
            <ReferralCodePanel
              code={team.referral_code}
              count={team.referral_count}
            />
          )}
        </div>
      </PhaseTransition>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        confirmLabel={confirm?.confirmLabel}
        danger
        busy={leaveBusy || !!kickBusyId}
        onConfirm={() => confirm?.action()}
        onCancel={() => setConfirm(null)}
      />
    </AuthShell>
  );
};

export default TeamPage;
