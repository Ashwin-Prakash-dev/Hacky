import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import InviteCards from "../components/apply/team/InviteCards";
import {
  MONO, SANS, Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, GhostButton, MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { getUser, clearAuth } from "../lib/auth";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [invites, setInvites] = useState([]);
  const [inviteError, setInviteError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadInvites = useCallback(() => {
    api.listInvites()
      .then((data) => setInvites(data.invites))
      .catch(() => {}); // invites list failing is non-fatal
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Already on a team? Direct-navigation guard: bounce to the dashboard.
    api.getTeam()
      .then(() => { if (!cancelled) navigate("/team", { replace: true }); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) navigate("/login", { replace: true });
        // 404 = teamless, the expected state — stay here
      });
    loadInvites();
    return () => { cancelled = true; };
  }, [navigate, loadInvites]);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const accept = async (id) => {
    setBusyId(id);
    setInviteError("");
    try {
      await api.acceptInvite(id);
      navigate("/team", { replace: true });
    } catch (err) {
      setInviteError(err.message);
      setBusyId(null);
      loadInvites();
    }
  };

  const decline = async (id) => {
    setBusyId(id);
    setInviteError("");
    try {
      await api.declineInvite(id);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setBusyId(null);
      loadInvites();
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    const name = teamName.trim();
    if (name.length < 2 || name.length > 60) {
      setCreateError("team name must be 2–60 characters");
      return;
    }
    setBusy(true);
    setCreateError("");
    try {
      await api.createTeam(name);
      navigate("/team", { replace: true });
    } catch (err) {
      setCreateError(err.message);
      setBusy(false);
    }
  };

  const joinTeam = async (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError("enter a join code");
      return;
    }
    setBusy(true);
    setJoinError("");
    try {
      await api.joinTeam(code);
      navigate("/team", { replace: true });
    } catch (err) {
      setJoinError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      label="FORM YOUR TEAM"
      right={
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <MonoLink to="/profile">profile</MonoLink>
          <GhostButton onClick={logout}>logout</GhostButton>
        </div>
      }
    >
      <PhaseTransition>
        <div style={{ width: "100%", maxWidth: "760px" }}>
          <p style={{
            fontFamily: MONO, fontSize: "0.78rem",
            color: "rgba(200,255,0,0.7)", marginBottom: "1.5rem",
          }}>
            {"// logged in as "}{user?.name ?? "operative"}
          </p>

          <InviteCards
            invites={invites}
            onAccept={accept}
            onDecline={decline}
            busyId={busyId}
          />
          <ErrorLine>{inviteError}</ErrorLine>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            <Panel maxWidth="none">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Eyebrow>CREATE A TEAM</Eyebrow>
                <div style={{ minHeight: "4.6rem" }}>
                  <Title>Lead your own crew</Title>
                </div>
                <form onSubmit={createTeam} noValidate style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <TerminalInput
                    label="Team name (2–60 characters)" value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                  <ErrorLine>{createError}</ErrorLine>
                  <div style={{ marginTop: "auto" }}>
                    <PrimaryButton type="submit" disabled={busy}>
                      Create team
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </Panel>

            <Panel maxWidth="none">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Eyebrow>JOIN A TEAM</Eyebrow>
                <div style={{ minHeight: "4.6rem" }}>
                  <Title>Have a join code?</Title>
                </div>
                <form onSubmit={joinTeam} noValidate style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <TerminalInput
                    label="Join code" value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    style={{ fontFamily: MONO, letterSpacing: "0.2em", textTransform: "uppercase" }}
                  />
                  <ErrorLine>{joinError}</ErrorLine>
                  <div style={{ marginTop: "auto" }}>
                    <PrimaryButton type="submit" disabled={busy}>
                      Join team
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </Panel>
          </div>

          <p style={{
            fontFamily: SANS, fontSize: "0.8rem",
            color: "rgba(255,255,255,0.45)", marginTop: "1.75rem", lineHeight: 1.6,
          }}>
            Applications open soon — form or join a team now; once submissions open,
            your team will apply with its idea.
          </p>
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default OnboardingPage;
