import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import TerminalSelect from "../components/apply/inputs/TerminalSelect";
import {
  Panel, Eyebrow, Title, ErrorLine, NoticeLine,
  PrimaryButton, MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { updateUser } from "../lib/auth";

const GENDERS = ["male", "female", "other"];

const validate = ({ name, phone, college, gender }) => {
  const errors = [];
  if (name.trim() && (name.trim().length < 1 || name.trim().length > 100)) {
    errors.push("Names can be up to 100 characters.");
  }
  const digits = phone.replace(/\D/g, "");
  if (phone.trim() && (digits.length < 10 || digits.length > 15)) {
    errors.push("Enter a valid phone number (10–15 digits).");
  }
  if (college.trim() && college.trim().length > 150) {
    errors.push("College names can be up to 150 characters.");
  }
  if (!GENDERS.includes(gender)) {
    errors.push("Select your gender.");
  }
  return errors;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [fields, setFields] = useState({ name: "", phone: "", college: "", gender: "" });
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
          gender: me.gender ?? "",
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
      invalid.push("Add your phone number to continue.");
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
    if (fields.gender) body.gender = fields.gender;
    if (Object.keys(body).length === 0) {
      setErrors(["Nothing to save yet. Fill in a field first."]);
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
      setFields({
        name: me.name ?? "", phone: me.phone ?? "",
        college: me.college ?? "", gender: me.gender ?? "",
      });
      setSaved(true);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell label="PROFILE" step={phoneMissing ? "phone" : null}>
      <PhaseTransition>
        <Panel>
          <Eyebrow>YOUR PROFILE</Eyebrow>
          {loading ? (
            <p className="font-mono text-[0.9rem] text-lime/70">
              Loading your details…
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
                  Add your details. They&apos;re required before you can access your team.
                </NoticeLine>
              )}
              <p className="mb-6 font-mono text-[0.82rem] text-white/60">
                {email} <span className="text-white/40">(can&apos;t be changed)</span>
              </p>
              <form onSubmit={submit} noValidate>
                <TerminalInput
                  label="Full name" value={fields.name}
                  onChange={set("name")} autoComplete="name"
                />
                <TerminalInput
                  label="Phone (10-digit mobile number)" type="tel" value={fields.phone}
                  onChange={set("phone")} autoComplete="tel"
                />
                <TerminalInput
                  label="College" value={fields.college}
                  onChange={set("college")} autoComplete="organization"
                />
                <TerminalSelect
                  label="Gender" value={fields.gender}
                  onChange={set("gender")}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </TerminalSelect>
                {errors.map((err) => <ErrorLine key={err}>{err}</ErrorLine>)}
                <NoticeLine>
                  {saved && (
                    <span className="inline-flex items-center gap-[0.35rem]">
                      <Check size={14} strokeWidth={3} /> Saved
                    </span>
                  )}
                </NoticeLine>
                <PrimaryButton type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </PrimaryButton>
              </form>
              {!phoneMissing && (
                <div className="mt-6">
                  <MonoLink to={teamId ? "/team" : "/onboarding"}>
                    <ArrowLeft size={13} /> Back to your team
                  </MonoLink>
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
