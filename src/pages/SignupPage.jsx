import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import GoogleSignInPanel from "../components/apply/GoogleSignInPanel";
import {
  Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, MonoLink, Divider,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { saveAuth, isAuthed } from "../lib/auth";
import { usePageMeta } from "../lib/seo";

const validate = ({ name, email, password, phone, college }) => {
  const errors = [];
  if (!name.trim() || name.trim().length > 100) errors.push("Enter your name (up to 100 characters).");
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.push("Enter a valid email address.");
  if (password.length < 8 || password.length > 100) errors.push("Passwords need at least 8 characters.");
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) errors.push("Enter a valid phone number (10–15 digits).");
  if (!college.trim() || college.trim().length > 150) errors.push("Enter your college name.");
  return errors;
};

const SignupPage = () => {
  usePageMeta({ title: "Sign up", path: "/signup", noindex: true });
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    name: "", email: "", password: "", phone: "", college: "",
  });
  const [errors, setErrors] = useState([]);
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/apply" replace />;

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(fields);
    if (invalid.length) {
      setErrors(invalid);
      setConflict(false);
      return;
    }
    setBusy(true);
    setErrors([]);
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
      setErrors([err.message]);
      setConflict(err.status === 409);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="SIGN UP" step="account">
      <PhaseTransition>
        <Panel maxWidth="480px">
          <Eyebrow>SIGN UP</Eyebrow>
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
            {errors.map((err, i) => (
              <ErrorLine key={err}>
                {err}
                {conflict && i === errors.length - 1 && (
                  <>. <MonoLink to="/login">Log in instead <ArrowRight size={13} /></MonoLink></>
                )}
              </ErrorLine>
            ))}
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "Creating your account…" : "Sign up"}
            </PrimaryButton>
          </form>
          <Divider />
          <GoogleSignInPanel onError={(msg) => setErrors([msg])} disabled={busy} />
          <div className="mt-6 text-right">
            <MonoLink to="/login">Already have an account? Log in <ArrowRight size={13} /></MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default SignupPage;
