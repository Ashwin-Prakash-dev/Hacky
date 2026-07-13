import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import {
  Panel, Eyebrow, Title, ErrorLine, NoticeLine,
  PrimaryButton, GoogleButton, MonoLink, Divider,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { saveAuth, isAuthed } from "../lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/apply" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("email and password are required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      saveAuth(data);
      navigate("/apply", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const { auth_url } = await api.googleInit();
      window.location.assign(auth_url);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="AUTHENTICATE">
      <PhaseTransition>
        <Panel>
          <Eyebrow>AUTHENTICATE</Eyebrow>
          <Title>Log in to Startathon</Title>
          <NoticeLine>{state?.notice}</NoticeLine>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TerminalInput
              label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "authenticating…" : "Log in"}
            </PrimaryButton>
          </form>
          <Divider />
          <GoogleButton onClick={google} disabled={busy} />
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "baseline", marginTop: "1.5rem",
          }}>
            <MonoLink to="/forgot">forgot password?</MonoLink>
            <MonoLink to="/signup">no account? sign up →</MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default LoginPage;
