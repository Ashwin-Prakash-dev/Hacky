import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import {
  Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, GoogleButton, MonoLink, Divider,
} from "../ui";
import { api } from "../../../lib/startathon";
import { saveAuth, isAuthed } from "../../../lib/auth";

const validate = ({ name, email, password, phone, college }) => {
  if (!name.trim() || name.trim().length > 100) return "name must be 1–100 characters";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "enter a valid email";
  if (password.length < 8 || password.length > 100) return "password must be 8–100 characters";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "phone must be 10–15 digits";
  if (!college.trim() || college.trim().length > 150) return "college must be 1–150 characters";
  return null;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    name: "", email: "", password: "", phone: "", college: "",
  });
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/apply" replace />;

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(fields);
    if (invalid) {
      setError(invalid);
      setConflict(false);
      return;
    }
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const data = await api.signup({
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
        phone: fields.phone.replace(/\D/g, ""),
        college: fields.college.trim(),
      });
      saveAuth(data);
      navigate("/apply", { replace: true });
    } catch (err) {
      setError(err.message);
      setConflict(err.status === 409);
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
    <AuthShell label="NEW OPERATIVE">
      <PhaseTransition>
        <Panel maxWidth="480px">
          <Eyebrow>NEW OPERATIVE</Eyebrow>
          <Title>Create your account</Title>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="Full name" value={fields.name}
              onChange={set("name")} autoComplete="name"
            />
            <TerminalInput
              label="Email" type="email" value={fields.email}
              onChange={set("email")} autoComplete="email"
            />
            <TerminalInput
              label="Password (min 8 characters)" type="password"
              value={fields.password} onChange={set("password")}
              autoComplete="new-password"
            />
            <TerminalInput
              label="Phone" type="tel" value={fields.phone}
              onChange={set("phone")} autoComplete="tel"
            />
            <TerminalInput
              label="College" value={fields.college}
              onChange={set("college")} autoComplete="organization"
            />
            <ErrorLine>
              {error && (
                <>
                  {error}
                  {conflict && <> — <MonoLink to="/login">log in instead</MonoLink></>}
                </>
              )}
            </ErrorLine>
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "creating…" : "Sign up"}
            </PrimaryButton>
          </form>
          <Divider />
          <GoogleButton onClick={google} disabled={busy} />
          <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
            <MonoLink to="/login">have an account? log in →</MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default SignupPage;
