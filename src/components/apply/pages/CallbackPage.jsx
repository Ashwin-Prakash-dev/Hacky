import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../AuthShell";
import { Panel, Eyebrow, Title, ErrorLine, NoticeLine, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";
import { saveAuth } from "../../../lib/auth";

const CallbackPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const ran = useRef(false); // guard StrictMode double-invoke

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      setError("missing code or state in the callback URL");
      return;
    }

    api.googleCallback(code, state)
      .then((data) => {
        saveAuth(data);
        navigate("/apply", { replace: true });
      })
      .catch((err) => setError(err.message));
  }, [params, navigate]);

  return (
    <AuthShell label="GOOGLE AUTH">
      <Panel>
        <Eyebrow>GOOGLE AUTH</Eyebrow>
        {error ? (
          <>
            <Title>Sign-in failed</Title>
            <ErrorLine>{error}</ErrorLine>
            <MonoLink to="/login">← back to login</MonoLink>
          </>
        ) : (
          <>
            <Title>Signing you in…</Title>
            <NoticeLine>exchanging credentials with Google</NoticeLine>
          </>
        )}
      </Panel>
    </AuthShell>
  );
};

export default CallbackPage;
