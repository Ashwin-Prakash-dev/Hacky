import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import { Panel, Eyebrow, Title, ErrorLine, PrimaryButton } from "../components/apply/ui";
import { api } from "../lib/startathon";
import { isAuthed, getUser } from "../lib/auth";
import { usePageMeta } from "../lib/seo";

const ApplyPage = () => {
  usePageMeta({
    title: "Apply",
    description:
      "Apply to Startathon 2026: Kerala's most curated 30-hour hackathon at SCTCE, Thiruvananthapuram. Teams of 3-4, only 20 spots.",
    path: "/apply",
  });
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
          <p className="font-mono text-[0.8rem] text-lime/70">
            Checking your application status…
          </p>
        )}
      </Panel>
    </AuthShell>
  );
};

export default ApplyPage;
