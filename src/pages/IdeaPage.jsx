import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import IdeaPanel from "../components/apply/idea/IdeaPanel";
import MyLinksPanel from "../components/apply/idea/MyLinksPanel";
import TeamLinksList from "../components/apply/idea/TeamLinksList";
import { Panel, ErrorLine, PrimaryButton, MonoLink } from "../components/apply/ui";
import { api } from "../lib/startathon";
import { getUser } from "../lib/auth";

const IdeaPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [idea, setIdea] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const [ideaBusy, setIdeaBusy] = useState(false);
  const [ideaError, setIdeaError] = useState("");
  const [ideaSaved, setIdeaSaved] = useState(false);

  const [linksBusy, setLinksBusy] = useState(false);
  const [linksError, setLinksError] = useState("");
  const [linksSaved, setLinksSaved] = useState(false);

  const load = useCallback(() => {
    setLoadError("");
    return Promise.all([
      api.getTeam(),
      api.getIdea().catch((err) => {
        if (err.status === 404) return null;
        throw err;
      }),
    ])
      .then(([teamData, ideaData]) => {
        setTeam(teamData);
        setIdea(ideaData);
      })
      .catch((err) => {
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const submitIdea = async (fields) => {
    setIdeaBusy(true);
    setIdeaError("");
    setIdeaSaved(false);
    try {
      const updated = await api.submitIdea(fields);
      setIdea(updated);
      setIdeaSaved(true);
    } catch (err) {
      if (err.status === 403) setLocked(true);
      setIdeaError(err.message);
    } finally {
      setIdeaBusy(false);
    }
  };

  const submitLinks = async (fields) => {
    setLinksBusy(true);
    setLinksError("");
    setLinksSaved(false);
    try {
      await api.updateMyLinks(fields);
      const fresh = await api.getIdea();
      setIdea(fresh);
      setLinksSaved(true);
    } catch (err) {
      if (err.status === 403) setLocked(true);
      setLinksError(err.message);
    } finally {
      setLinksBusy(false);
    }
  };

  const headerRight = <MonoLink to="/team">Back to team</MonoLink>;

  if (loadError) {
    return (
      <AuthShell label="IDEA" right={headerRight}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={load}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  if (loading || !team) {
    return (
      <AuthShell label="IDEA">
        <p className="font-mono text-[0.8rem] text-lime/70">Loading…</p>
      </AuthShell>
    );
  }

  const isLeader = team.your_role === "leader";
  const me = team.members.find((m) => m.email === getUser()?.email);
  const myEntry = me ? idea?.member_links?.find((l) => l.user_id === me.user_id) : null;

  return (
    <AuthShell label="IDEA" right={headerRight}>
      <PhaseTransition>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-mono text-[clamp(1.5rem,5vw,2.2rem)] font-bold tracking-[0.02em] text-white">
              {team.team_name}
            </h1>
            <MonoLink to="/team">
              <ArrowLeft size={13} /> Team
            </MonoLink>
          </div>

          <IdeaPanel
            idea={idea}
            canEdit={isLeader && !locked}
            locked={locked}
            onSubmit={submitIdea}
            busy={ideaBusy}
            error={ideaError}
            saved={ideaSaved}
          />

          {idea ? (
            <MyLinksPanel
              myEntry={myEntry}
              locked={locked}
              onSubmit={submitLinks}
              busy={linksBusy}
              error={linksError}
              saved={linksSaved}
            />
          ) : null}

          {idea && <TeamLinksList members={team.members} memberLinks={idea.member_links} />}
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default IdeaPage;
