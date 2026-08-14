import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import WhatsAppNotice from "../components/apply/WhatsAppNotice";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import InviteCards from "../components/apply/team/InviteCards";
import {
  MONO, Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, GhostButton, MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { getUser, clearAuth } from "../lib/auth";
import { registrationsOpen } from "../lib/phase";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const open = registrationsOpen();

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
        // 404 = teamless, the expected state; stay here
      });
    loadInvites();
    return () => { cancelled = true; };
  }, [navigate, loadInvites]);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const accept = async (id) => {
    if (!open) return;
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
    if (!open) return;
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
    if (!open) return;
    const name = teamName.trim();
    if (name.length < 2 || name.length > 60) {
      setCreateError("Team names are 2–60 characters.");
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
    if (!open) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError("Enter the join code your teammate shared with you.");
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
      step="team"
      right={
        <div className="flex items-center gap-5">
          <MonoLink to="/profile">profile</MonoLink>
          <GhostButton onClick={logout}>logout</GhostButton>
        </div>
      }
    >
      <PhaseTransition>
        <div className="w-full max-w-[760px]">
          <p className="mb-2 font-mono text-[0.78rem] text-lime/70">
            Signed in as {user?.name ?? "you"}
          </p>
          {open ? (
            <>
              <p className="mb-6 font-general text-[0.9rem] leading-relaxed text-white/70">
                Startathon is a team event. Every team needs <b className="text-lime">3-4 members</b> to
                compete. Start one and invite your crew, or join a teammate&apos;s team with their code.
              </p>

              <InviteCards
                invites={invites}
                onAccept={accept}
                onDecline={decline}
                busyId={busyId}
              />
              <ErrorLine>{inviteError}</ErrorLine>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                <Panel maxWidth="none">
                  <div className="flex h-full flex-col">
                    <Eyebrow>CREATE A TEAM</Eyebrow>
                    <div className="min-h-[4.6rem]">
                      <Title>Start a team and invite 2–3 teammates</Title>
                    </div>
                    <form onSubmit={createTeam} noValidate className="flex flex-1 flex-col">
                      <TerminalInput
                        label="Team name (2–60 characters)" value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                      <ErrorLine>{createError}</ErrorLine>
                      <div className="mt-auto">
                        <PrimaryButton type="submit" disabled={busy}>
                          Create team
                        </PrimaryButton>
                      </div>
                    </form>
                  </div>
                </Panel>

                <Panel maxWidth="none">
                  <div className="flex h-full flex-col">
                    <Eyebrow>JOIN A TEAM</Eyebrow>
                    <div className="min-h-[4.6rem]">
                      <Title>Got a join code from a teammate?</Title>
                    </div>
                    <form onSubmit={joinTeam} noValidate className="flex flex-1 flex-col">
                      <TerminalInput
                        label="Join code" value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        style={{ fontFamily: MONO, letterSpacing: "0.2em", textTransform: "uppercase" }}
                      />
                      <ErrorLine>{joinError}</ErrorLine>
                      <div className="mt-auto">
                        <PrimaryButton type="submit" disabled={busy}>
                          Join team
                        </PrimaryButton>
                      </div>
                    </form>
                  </div>
                </Panel>
              </div>

              <p className="mt-7 font-general text-[0.8rem] leading-relaxed text-white/45">
                Applications open soon. Get your full team of 3-4 together now; once
                submissions open, your team will apply with its idea.
              </p>
            </>
          ) : (
            <Panel maxWidth="none">
              <Eyebrow>REGISTRATION CLOSED</Eyebrow>
              <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
                Startathon isn&rsquo;t accepting new teams or invites anymore.
                Creating a team, joining one, and accepting invites are all
                closed for the rest of the event.
              </p>
            </Panel>
          )}
        </div>
      </PhaseTransition>

      <WhatsAppNotice />
    </AuthShell>
  );
};

export default OnboardingPage;
