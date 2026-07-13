import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import { Panel, Eyebrow, Title, ErrorLine, MONO, PrimaryButton } from "../components/apply/ui";
import { api } from "../lib/startathon";
import { isAuthed, getUser } from "../lib/auth";

const ApplyPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAuthed()) {
      navigate("/login", { replace: true });
      return;
    }
    if (!getUser()?.phone) {
      navigate("/profile", { replace: true });
      return;
    }
    let cancelled = false;
    setError("");
    api.getTeam()
      .then(() => { if (!cancelled) navigate("/team", { replace: true }); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setError(err.message);
      });
    return () => { cancelled = true; };
  }, [navigate, attempt]);

  return (
    <AuthShell label="APPLY">
      <Panel>
        <Eyebrow>APPLY</Eyebrow>
        {error ? (
          <>
            <Title>Connection trouble</Title>
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton onClick={() => setAttempt((a) => a + 1)}>Retry</PrimaryButton>
          </>
        ) : (
          <p style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(200,255,0,0.7)" }}>
            {"// checking your status…"}
          </p>
        )}
      </Panel>
    </AuthShell>
  );
};

export default ApplyPage;
