import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import JoinCodePanel from "../team/JoinCodePanel";
import RosterList from "../team/RosterList";
import InvitePanel from "../team/InvitePanel";
import PaymentPanel from "../team/PaymentPanel";
import { MONO, SANS, LIME, Panel, ErrorLine, PrimaryButton, GhostButton } from "../ui";
import { api } from "../../../lib/startathon";
import { clearAuth } from "../../../lib/auth";

const StatusBadge = ({ status }) => {
  const confirmed = status === "confirmed";
  return (
    <span style={{
      fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.14em",
      padding: "0.35rem 0.7rem", borderRadius: "100px",
      color: confirmed ? "#0a0a0a" : "#ffb454",
      background: confirmed ? LIME : "rgba(255,180,84,0.12)",
      border: confirmed ? "none" : "0.5px solid rgba(255,180,84,0.5)",
      fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {confirmed ? "✓ CONFIRMED" : "PAYMENT PENDING"}
    </span>
  );
};

const IdeaNotice = ({ prominent }) => (
  <div style={{
    padding: "0.9rem 1.1rem", borderRadius: "6px",
    background: prominent ? "rgba(200,255,0,0.06)" : "rgba(255,255,255,0.02)",
    border: `0.5px solid ${prominent ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.08)"}`,
  }}>
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: prominent ? "rgba(200,255,0,0.85)" : "rgba(255,255,255,0.5)",
    }}>
      {"// APPLICATIONS OPEN SOON — once submissions open, your team will apply with its idea here."}
    </p>
  </div>
);

const TeamPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSentTo, setInviteSentTo] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);

  const refresh = useCallback(() => {
    setLoadError("");
    return api.getTeam()
      .then(setTeam)
      .catch((err) => {
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setLoadError(err.message);
      });
  }, [navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const invite = async (email, name, onSent) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setInviteError("enter a valid email");
      return;
    }
    setInviteBusy(true);
    setInviteError("");
    setInviteSentTo("");
    try {
      await api.invite(email, name || undefined);
      setInviteSentTo(email);
      onSent();
      await refresh();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const kick = async (member) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
    if (!window.confirm(`Kick ${member.name} from the team?`)) return;
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
  };

  const pay = async (transactionId) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
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

  const leave = async () => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
    const isLeader = team.your_role === "leader";
    const msg = isLeader
      ? "Disband the team? This deletes it and frees every member. This cannot be undone."
      : "Leave this team?";
    if (!window.confirm(msg)) return;
    setLeaveBusy(true);
    setActionError("");
    try {
      await api.leaveTeam();
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setActionError(err.message);
      setLeaveBusy(false);
    }
  };

  if (loadError) {
    return (
      <AuthShell label="TEAM" right={<GhostButton onClick={logout}>logout</GhostButton>}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={refresh}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  if (!team) {
    return (
      <AuthShell label="TEAM">
        <p style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(200,255,0,0.7)" }}>
          {"// loading team…"}
        </p>
      </AuthShell>
    );
  }

  const isLeader = team.your_role === "leader";
  const confirmed = team.status === "confirmed";

  return (
    <AuthShell label="TEAM" right={<GhostButton onClick={logout}>logout</GhostButton>}>
      <PhaseTransition>
        <div style={{
          width: "100%", maxWidth: "760px",
          display: "flex", flexDirection: "column", gap: "1.25rem",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "0.75rem",
          }}>
            <h1 style={{
              fontFamily: MONO, fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
              fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
            }}>
              {team.team_name}
            </h1>
            <StatusBadge status={team.status} />
          </div>

          {confirmed && (
            <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
              Your team is locked in — the roster that paid is the roster that competes.
            </p>
          )}

          <IdeaNotice prominent={confirmed} />

          <JoinCodePanel code={team.join_code} />

          <RosterList team={team} onKick={kick} busyId={kickBusyId} />

          {isLeader && !confirmed && team.members.length < 4 && (
            <InvitePanel
              onInvite={invite}
              busy={inviteBusy}
              error={inviteError}
              sentTo={inviteSentTo}
            />
          )}

          {!confirmed && (
            <PaymentPanel team={team} onSubmit={pay} busy={payBusy} error={payError} />
          )}

          <ErrorLine>{actionError}</ErrorLine>

          {!confirmed && (
            <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <GhostButton danger disabled={leaveBusy} onClick={leave}>
                {isLeader ? "disband team (deletes it for everyone)" : "leave team"}
              </GhostButton>
            </div>
          )}
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default TeamPage;
