import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, Title, ErrorLine, PrimaryButton, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";

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
      setError("password must be 8–100 characters");
      setExpired(false);
      return;
    }
    if (password !== confirm) {
      setError("passwords do not match");
      setExpired(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.verifyReset(token, password);
      navigate("/login", {
        replace: true,
        state: { notice: "password set — log in with it below" },
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
              <ErrorLine>this link is missing its token — request a new one</ErrorLine>
              <MonoLink to="/forgot">request a new reset link →</MonoLink>
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
                    {expired && <> — <MonoLink to="/forgot">request a new link</MonoLink></>}
                  </>
                )}
              </ErrorLine>
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "saving…" : "Set password"}
              </PrimaryButton>
            </form>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ResetPage;
