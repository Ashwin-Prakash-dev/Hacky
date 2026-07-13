import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import {
  Panel, Eyebrow, Title, ErrorLine, NoticeLine,
  PrimaryButton, MonoLink, MONO,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { updateUser } from "../lib/auth";

const validate = ({ name, phone, college }) => {
  const errors = [];
  if (name.trim() && (name.trim().length < 1 || name.trim().length > 100)) {
    errors.push("name must be 1–100 characters");
  }
  const digits = phone.replace(/\D/g, "");
  if (phone.trim() && (digits.length < 10 || digits.length > 15)) {
    errors.push("phone must be 10–15 digits");
  }
  if (college.trim() && college.trim().length > 150) {
    errors.push("college must be 150 characters or fewer");
  }
  return errors;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [fields, setFields] = useState({ name: "", phone: "", college: "" });
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phoneMissing, setPhoneMissing] = useState(false);

  useEffect(() => {
    api.getMe()
      .then((me) => {
        setEmail(me.email);
        setTeamId(me.team_id);
        setPhoneMissing(!me.phone);
        setFields({
          name: me.name ?? "",
          phone: me.phone ?? "",
          college: me.college ?? "",
        });
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => {
    setSaved(false);
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(fields);
    if (phoneMissing && !fields.phone.trim()) {
      invalid.push("phone is required to continue");
    }
    if (invalid.length) {
      setErrors(invalid);
      setSaved(false);
      return;
    }
    const body = {};
    if (fields.name.trim()) body.name = fields.name.trim();
    if (fields.phone.trim()) body.phone = fields.phone.replace(/\D/g, "");
    if (fields.college.trim()) body.college = fields.college.trim();
    if (Object.keys(body).length === 0) {
      setErrors(["nothing to save"]);
      return;
    }
    setBusy(true);
    setErrors([]);
    try {
      const me = await api.updateMe(body);
      updateUser(me);
      if (phoneMissing && me.phone) {
        navigate("/apply", { replace: true });
        return;
      }
      setFields({ name: me.name ?? "", phone: me.phone ?? "", college: me.college ?? "" });
      setSaved(true);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell label="PROFILE">
      <PhaseTransition>
        <Panel>
          <Eyebrow>YOUR PROFILE</Eyebrow>
          {loading ? (
            <p style={{ fontFamily: MONO, fontSize: "0.9rem", color: "rgba(200,255,0,0.7)" }}>
              {"// loading your details…"}
            </p>
          ) : loadError ? (
            <>
              <Title>Couldn&apos;t load your profile</Title>
              <ErrorLine>{loadError}</ErrorLine>
            </>
          ) : (
            <>
              <Title>Edit your details</Title>
              {phoneMissing && (
                <NoticeLine>
                  Add your phone number to continue — it&apos;s required before you can access your team.
                </NoticeLine>
              )}
              <p style={{
                fontFamily: MONO, fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem",
              }}>
                {email} <span style={{ color: "rgba(255,255,255,0.4)" }}>(can&apos;t be changed)</span>
              </p>
              <form onSubmit={submit} noValidate>
                <TerminalInput
                  label="Full name" value={fields.name}
                  onChange={set("name")} autoComplete="name"
                />
                <TerminalInput
                  label="Phone" type="tel" value={fields.phone}
                  onChange={set("phone")} autoComplete="tel"
                />
                <TerminalInput
                  label="College" value={fields.college}
                  onChange={set("college")} autoComplete="organization"
                />
                {errors.map((err) => <ErrorLine key={err}>{err}</ErrorLine>)}
                <NoticeLine>{saved && "Saved."}</NoticeLine>
                <PrimaryButton type="submit" disabled={busy}>
                  {busy ? "saving…" : "Save changes"}
                </PrimaryButton>
              </form>
              {!phoneMissing && (
                <div style={{ marginTop: "1.5rem" }}>
                  <MonoLink to={teamId ? "/team" : "/onboarding"}>← back</MonoLink>
                </div>
              )}
            </>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ProfilePage;
