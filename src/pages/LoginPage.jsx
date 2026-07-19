import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import GoogleSignInPanel from "../components/apply/GoogleSignInPanel";
import {
  Panel, Eyebrow, Title, ErrorLine, NoticeLine,
  PrimaryButton, MonoLink, Divider,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { saveAuth, isAuthed } from "../lib/auth";
import { usePageMeta } from "../lib/seo";

const LoginPage = () => {
  usePageMeta({ title: "Log in", path: "/login", noindex: true });
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
      setError("Enter your email and password.");
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

  return (
    <AuthShell label="LOG IN" step="account">
      <PhaseTransition>
        <Panel>
          <Eyebrow>LOG IN</Eyebrow>
          <Title>Welcome back</Title>
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
              {busy ? "Logging in…" : "Log in"}
            </PrimaryButton>
          </form>
          <p className="mt-4 text-center font-mono text-[0.75rem] leading-relaxed text-white/45">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-lime/80 underline underline-offset-[3px]">Terms</Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-lime/80 underline underline-offset-[3px]">Privacy Policy</Link>.
          </p>
          <Divider />
          <GoogleSignInPanel onError={setError} disabled={busy} />
          <div className="mt-6 flex items-baseline justify-between">
            <MonoLink to="/forgot">Forgot password?</MonoLink>
            <MonoLink to="/signup">New here? Sign up <ArrowRight size={13} /></MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default LoginPage;
