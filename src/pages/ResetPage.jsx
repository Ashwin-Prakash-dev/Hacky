import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import { Panel, Eyebrow, Title, ErrorLine, PrimaryButton, MonoLink } from "../components/apply/ui";
import { api } from "../lib/startathon";

const ResetPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 100) {
      setError("Passwords need at least 8 characters.");
      setExpired(false);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      setExpired(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.verifyReset(token, password);
      navigate("/login", {
        replace: true,
        state: { notice: "Password set. Log in with it below." },
      });
    } catch (err) {
      setError(err.message);
      setExpired(err.status === 400);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="SET PASSWORD">
      <PhaseTransition>
        <Panel>
          <Eyebrow>SET PASSWORD</Eyebrow>
          <Title>Choose a new password</Title>
          {!token ? (
            <>
              <ErrorLine>This reset link looks incomplete. Request a fresh one.</ErrorLine>
              <MonoLink to="/forgot">Request a new reset link <ArrowRight size={13} /></MonoLink>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <TerminalInput
                label="New password (min 8 characters)" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <TerminalInput
                label="Confirm password" type="password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <ErrorLine>
                {error && (
                  <>
                    {error}
                    {expired && <>. <MonoLink to="/forgot">Request a new link <ArrowRight size={13} /></MonoLink></>}
                  </>
                )}
              </ErrorLine>
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "Saving…" : "Set password"}
              </PrimaryButton>
            </form>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ResetPage;
