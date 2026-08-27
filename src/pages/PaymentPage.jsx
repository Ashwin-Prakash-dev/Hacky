import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import SelectionFeePanel from "../components/apply/team/SelectionFeePanel";
import {
  Panel,
  ErrorLine,
  PrimaryButton,
  GhostButton,
  MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { clearAuth } from "../lib/auth";
import { currentMember, isSelected } from "../lib/teamRules";

// How long a reference can sit unmatched before we stop re-reading the roster.
// The server's own sweep runs every five minutes, so this covers two of them
// and then leaves the page alone.
const PENDING_POLL_MS = 20_000;
const PENDING_TRIES = 30;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pollsLeft, setPollsLeft] = useState(PENDING_TRIES);

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

  // Only a shortlisted team owes anything here.
  //
  // The notice says nothing about results on purpose. A team that wasn't
  // shortlisted and a team that hasn't been evaluated yet are both `confirmed`,
  // and the frontend genuinely cannot tell them apart, so this page must not
  // break bad news or imply good news.
  useEffect(() => {
    if (!team || isSelected(team)) return;
    navigate("/team", {
      replace: true,
      state: {
        notice: "The selection fee page is only open to shortlisted teams.",
      },
    });
  }, [team, navigate]);

  const me = useMemo(() => currentMember(team), [team]);

  // submitted -> confirmed happens server-side without anyone asking: at submit,
  // when the bank message is ingested, and on a sweep every five minutes. So a
  // reference that is still `submitted` is a reason to look again, not to sit
  // there. Polling stops the moment it clears, and gives up after PENDING_TRIES
  // so a mismatched amount — which never clears on its own — doesn't leave a
  // request loop running for the rest of the session.
  useEffect(() => {
    const pending = team?.members.some(
      (m) => m.selection_payment_status === "submitted",
    );
    if (!pending || pollsLeft <= 0) return;
    const id = setTimeout(() => {
      setPollsLeft((n) => n - 1);
      refresh();
    }, PENDING_POLL_MS);
    return () => clearTimeout(id);
  }, [team, pollsLeft, refresh]);

  const pay = async (transactionId, covers, paymentId) => {
    if (busy) return;
    // No guard on the caller's own seat: someone whose seat is settled may
    // still open a payment for a teammate, which is what the server allows.
    // The panel decides what is payable; this only stops a double submit.

    setBusy(true);
    setSubmitError("");
    try {
      await api.submitSelectionPayment(transactionId, covers, paymentId);
      // The server decides what the payment is now — it can come back already
      // confirmed — so re-read rather than patching local state.
      setPollsLeft(PENDING_TRIES);
      await refresh();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const headerRight = (
    <div className="flex items-center gap-5">
      <MonoLink to="/team">team</MonoLink>
      <MonoLink to="/logistics">food and travel</MonoLink>
      <GhostButton onClick={logout}>logout</GhostButton>
    </div>
  );

  if (loadError) {
    return (
      <AuthShell label="PAYMENT" right={headerRight}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={refresh}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  // Also covers the frame between loading a non-selected team and the redirect
  // above taking effect.
  if (!team || !isSelected(team)) {
    return (
      <AuthShell label="PAYMENT">
        <p className="font-mono text-[0.8rem] text-lime/70">
          Loading your team&hellip;
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell label="PAYMENT" step="done" right={headerRight}>
      <PhaseTransition>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          <h1 className="font-mono text-[clamp(1.5rem,5vw,2.2rem)] font-bold tracking-[0.02em] text-white">
            {team.team_name}
          </h1>

          <SelectionFeePanel
            team={team}
            me={me}
            onSubmit={pay}
            busy={busy}
            error={submitError}
          />
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default PaymentPage;
