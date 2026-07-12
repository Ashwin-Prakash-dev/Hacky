import { useState } from "react";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, Title, ErrorLine, NoticeLine, PrimaryButton, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";

const ForgotPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("enter a valid email");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.requestReset(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      // API always 200s for valid requests; only network/500 land here
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="RESET ACCESS">
      <PhaseTransition>
        <Panel>
          <Eyebrow>RESET ACCESS</Eyebrow>
          <Title>Forgot your password?</Title>
          {sent ? (
            <>
              <NoticeLine>
                if that account exists, a reset link is on its way — check your inbox
              </NoticeLine>
              <div style={{ marginTop: "1.5rem" }}>
                <MonoLink to="/login">← back to login</MonoLink>
              </div>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <TerminalInput
                label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <ErrorLine>{error}</ErrorLine>
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "sending…" : "Send reset link"}
              </PrimaryButton>
              <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
                <MonoLink to="/login">← back to login</MonoLink>
              </div>
            </form>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ForgotPage;
