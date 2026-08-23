import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import SelectionFeePanel from "../components/apply/team/SelectionFeePanel";
import RosterMeter from "../components/apply/team/RosterMeter";
import {
  Panel,
  Eyebrow,
  ErrorLine,
  PrimaryButton,
  GhostButton,
  MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { clearAuth } from "../lib/auth";
import { currentMember, isSelected, payerOf } from "../lib/teamRules";

// How long a reference can sit unmatched before we stop re-reading the roster.
// The server's own sweep runs every five minutes, so this covers two of them
// and then leaves the page alone.
const PENDING_POLL_MS = 20_000;
const PENDING_TRIES = 30;

const STATUS_LABEL = {
  confirmed: "paid",
  submitted: "checking",
};

const StatusChip = ({ status, payer }) => {
  const label = payer
    ? `${STATUS_LABEL[status] ?? "not paid"} by ${payer.name.split(" ")[0]}`
    : (STATUS_LABEL[status] ?? "not paid");
  const tone =
    status === "confirmed"
      ? "text-lime"
      : status === "submitted"
        ? "text-lime/55"
        : "text-white/40";
  return (
    <span className={`shrink-0 font-mono text-[0.78rem] tracking-[0.12em] ${tone}`}>
      [{label.toUpperCase()}]
    </span>
  );
};

/**
 * Who on the roster has paid. Reuses RosterMeter rather than inventing a second
 * progress idiom: filled is paid, faint is awaiting verification, outlined is
 * still owed. Every member is required, so min and max are both the roster size.
 */
const FeeProgress = ({ team, me }) => {
  const { members } = team;
  const paid = members.filter((m) => m.selection_payment_status === "confirmed");
  const checking = members.filter((m) => m.selection_payment_status === "submitted");
  const everyone = paid.length === members.length;

  return (
    <Panel maxWidth="none">
      <Eyebrow>Your team</Eyebrow>

      <div className="my-[0.85rem]">
        <RosterMeter
          joined={paid.length}
          pending={checking.length}
          min={members.length}
          max={members.length}
        />
      </div>

      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.user_id ?? m.email}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-[0.7rem]"
          >
            <span className="min-w-0 flex-1 truncate font-general text-[0.9rem] text-white">
              {m.name}
              {/* Reference equality, not email: `me` is an element of this same
                  array, and two members with no email must not both read "you". */}
              {m === me && (
                <span className="ml-2 font-mono text-[0.75rem] tracking-[0.12em] text-white/40">
                  you
                </span>
              )}
            </span>
            <StatusChip
              status={m.selection_payment_status}
              payer={payerOf(team, m)}
            />
          </li>
        ))}
      </ul>

      <p className="mt-4 font-general text-[0.85rem] leading-relaxed text-white/50">
        {everyone
          ? "Everyone has paid. Your team is set for the event."
          : `${paid.length} of ${members.length} seats paid. If anyone misses the deadline the whole team is disqualified and the fees come back, so chase whoever is left. One transfer can cover more than one seat.`}
      </p>
    </Panel>
  );
};

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
      (m) => m.selection_payment_status === "submitted"
    );
    if (!pending || pollsLeft <= 0) return;
    const id = setTimeout(() => {
      setPollsLeft((n) => n - 1);
      refresh();
    }, PENDING_POLL_MS);
    return () => clearTimeout(id);
  }, [team, pollsLeft, refresh]);

  const pay = async (transactionId, covers) => {
    if (busy) return;
    // A submitted payment is deliberately re-submittable: the same POST
    // replaces its reference and cover list. A confirmed one is final, and the
    // server 409s it, so don't spend a request finding that out.
    if (me?.selection_payment_status === "confirmed") return;

    setBusy(true);
    setSubmitError("");
    try {
      await api.submitSelectionPayment(transactionId, covers);
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
        <p className="font-mono text-[0.8rem] text-lime/70">Loading your team&hellip;</p>
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

          <FeeProgress team={team} me={me} />
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default PaymentPage;
