import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import BriefRecap from "../components/apply/submission/BriefRecap";
import DomainsStep from "../components/apply/submission/DomainsStep";
import IdeaStep from "../components/apply/submission/IdeaStep";
import LinksStep from "../components/apply/submission/LinksStep";
import PriorWorkStep from "../components/apply/submission/PriorWorkStep";
import MemberDetailsStep from "../components/apply/submission/MemberDetailsStep";
import ReviewStep from "../components/apply/submission/ReviewStep";
import Countdown from "../components/apply/submission/Countdown";
import { StepNav } from "../components/apply/submission/ui";
import {
  ErrorLine,
  GhostButton,
  MonoLink,
  NoticeLine,
  PrimaryButton,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { clearAuth, getUser } from "../lib/auth";
import { applicationsOpen, submissionsClosed } from "../lib/phase";
import { MIN_MEMBERS } from "../lib/teamRules";
import { usePageMeta } from "../lib/seo";
import {
  applicationFromServer,
  clearDraft,
  emptyApplication,
  emptyMember,
  hasErrors,
  isClosedError,
  isNoApplicationError,
  isNoTeamError,
  LAST_STEP,
  loadDraft,
  memberFromServer,
  parseFieldErrors,
  saveDraft,
  STEPS,
  toApplicationPayload,
  toMemberPayload,
  validateDomains,
  validateIdea,
  validateLinks,
  validateMember,
  validatePriorWork,
} from "../lib/submission";

// Step order lives in lib/submission so ReviewStep's jump targets read from
// the same source this file navigates by.
const { BRIEF, DOMAINS, IDEA, LINKS, PRIOR, MEMBER, REVIEW } = STEPS;
const LAST = LAST_STEP;

// Which steps write to PUT /team/application (leader-only) rather than to the
// member row (anyone, their own).
const APPLICATION_STEPS = [DOMAINS, IDEA, LINKS, PRIOR];

// Where a 400's field path belongs, so a rejected save lands the user on the
// step that can actually fix it.
const STEP_FOR_FIELD = {
  domains: DOMAINS,
  title: IDEA,
  summary: IDEA,
  problem_evidence: IDEA,
  deck_url: LINKS,
  video_url: LINKS,
  prior_work: PRIOR,
};

const SubmissionPage = () => {
  usePageMeta({
    title: "Submit your idea",
    description:
      "Submit your team's idea for Startathon 2026: the problem, your evidence, your deck and video.",
    path: "/submission",
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [exists, setExists] = useState(false);

  const [form, setForm] = useState(emptyApplication);
  const [memberForm, setMemberForm] = useState(emptyMember);

  const [step, setStep] = useState(BRIEF);
  const [direction, setDirection] = useState("forward");
  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [closed, setClosed] = useState(() => submissionsClosed());

  // Set once the server state has been hydrated, so the draft effect below
  // can't write an empty form over a real draft on the first render.
  const hydratedRef = useRef(false);

  const isLeader = team?.your_role === "leader";
  const leaderName = useMemo(
    () => members.find((m) => m.role === "leader")?.name ?? "your team leader",
    [members]
  );
  const myName = useMemo(
    () => members.find((m) => m.user_id === myUserId)?.name ?? getUser()?.name ?? "you",
    [members, myUserId]
  );
  const canEditApplication = isLeader && !closed;

  // ── load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    // The roster comes from getTeam rather than the application, because the
    // application 404s until the leader has submitted and member details are
    // meant to work before that.
    const load = async () => {
      let teamData;
      try {
        teamData = await api.getTeam();
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else {
          setLoadError(err.message);
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;

      // The gate: payment confirmed, roster complete, submissions open.
      if (teamData.members.length < MIN_MEMBERS || teamData.status !== "confirmed") {
        navigate("/team", {
          replace: true,
          state: {
            notice:
              "Your team's payment has to be confirmed before you can submit an idea.",
          },
        });
        return;
      }
      if (!applicationsOpen()) {
        navigate("/team", {
          replace: true,
          state: { notice: "Idea submissions aren't open yet." },
        });
        return;
      }

      // The stored user object has no guaranteed id field, so identity comes
      // from matching the account email against the roster. An account with no
      // email matches nothing on purpose: `undefined === undefined` would
      // otherwise pair us with the first roster row that has no email and write
      // this person's details into someone else's row.
      const email = getUser()?.email?.toLowerCase();
      const mine =
        (email
          ? teamData.members.find((m) => m.email?.toLowerCase() === email)
          : null) ??
        (teamData.your_role === "leader"
          ? teamData.members.find((m) => m.role === "leader")
          : null);

      let appData = null;
      try {
        appData = await api.getApplication();
      } catch (err) {
        if (cancelled) return;
        if (isNoTeamError(err)) {
          navigate("/onboarding", { replace: true });
          return;
        }
        // "No application yet" is an empty state, not an error. Anything else
        // genuinely failed and should be retryable.
        if (!isNoApplicationError(err)) {
          if (err.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          setLoadError(err.message);
          setLoading(false);
          return;
        }
      }
      if (cancelled) return;

      const roster = (appData?.members ?? teamData.members).map((m) => ({
        user_id: m.user_id,
        name: m.name,
        role: m.role,
        // updated_at === null is the API's own "this person filled in nothing".
        completed: m.updated_at != null,
      }));

      const myRow = appData?.members?.find((m) => m.user_id === mine?.user_id);

      setTeam(teamData);
      setMembers(roster);
      setMyUserId(mine?.user_id ?? null);
      setExists(!!appData);
      setMemberForm(memberFromServer(myRow));

      // A team that has already submitted opens on the review, not the brief.
      // What someone returning wants is what their team sent, and the review
      // is the only step that shows all of it plus a way into any of it. The
      // steps behind it stay reachable through Back and the Edit links.
      if (appData) setStep(REVIEW);

      // The server is the source of truth once an application exists; the
      // draft only fills in for the window before the first successful PUT.
      const draft = appData ? null : loadDraft(teamData.team_id);
      setForm(draft ?? applicationFromServer(appData));

      hydratedRef.current = true;
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate, attempt]);

  // ── draft ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Only meaningful before the first successful PUT: after that the server
    // holds the answers and a stale draft would be a liability.
    if (!hydratedRef.current || exists || !team?.team_id || !isLeader) return;
    saveDraft(team.team_id, form);
  }, [form, exists, team, isLeader]);

  // ── editing ───────────────────────────────────────────────────────────────

  const updateForm = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Prior-work errors are keyed by row index rather than by field name, so
    // there is no single key to clear, so drop them all and let Next re-check.
    if (field === "prior_work") setErrors({});
    else setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    setSaveError("");
    setNotice("");
  };

  const updateMemberForm = (field, value) => {
    setMemberForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    setSaveError("");
    setNotice("");
  };

  // ── validation ────────────────────────────────────────────────────────────

  const validateStep = useCallback(
    (index) => {
      if (index === DOMAINS) return canEditApplication ? validateDomains(form) : {};
      if (index === IDEA) return canEditApplication ? validateIdea(form) : {};
      if (index === LINKS) return canEditApplication ? validateLinks(form) : {};
      if (index === PRIOR) {
        if (!canEditApplication) return {};
        // Unanswered is allowed while walking through; Review is where it is
        // held against you, because that is the last honest moment to ask.
        return form.prior_work === null ? {} : validatePriorWork(form.prior_work);
      }
      if (index === MEMBER) return closed ? {} : validateMember(memberForm);
      return {};
    },
    [form, memberForm, canEditApplication, closed]
  );

  // ── saving ────────────────────────────────────────────────────────────────

  const handleSaveError = (err) => {
    if (isClosedError(err)) {
      setClosed(true);
      setSaveError(
        "Submissions have closed. What your team had saved is what gets reviewed."
      );
      return;
    }
    if (err.status === 401) {
      navigate("/login", { replace: true });
      return;
    }
    if (err.status === 404) {
      // Stale roster, or the team changed under us. A reload fixes both.
      setSaveError(`${err.message} Reloading your team should fix this.`);
      return;
    }
    if (err.status === 400) {
      const fieldErrors = parseFieldErrors(err.message);
      if (hasErrors(fieldErrors)) {
        setErrors(fieldErrors);
        const target = Object.keys(fieldErrors)
          .map((field) => STEP_FOR_FIELD[field])
          .filter((s) => s !== undefined)
          .sort((a, b) => a - b)[0];
        if (target !== undefined) {
          setDirection("back");
          setStep(target);
        }
        setSaveError("Some answers were rejected. They're marked below.");
        return;
      }
    }
    setSaveError(err.message);
  };

  // The form carries every field at all times, so this always sends a complete
  // record, which is what "PUT replaces everything" demands.
  const saveApplication = async () => {
    const data = await api.putApplication(toApplicationPayload(form));
    setForm(applicationFromServer(data));
    setExists(true);
    clearDraft(team.team_id);
    if (Array.isArray(data?.members)) {
      setMembers(
        data.members.map((m) => ({
          user_id: m.user_id,
          name: m.name,
          role: m.role,
          completed: m.updated_at != null,
        }))
      );
    }
  };

  const saveMemberDetails = async () => {
    if (!myUserId) return;
    const data = await api.putMemberDetails(myUserId, toMemberPayload(memberForm));
    setMemberForm(memberFromServer(data));
    setMembers((list) =>
      list.map((m) => (m.user_id === myUserId ? { ...m, completed: true } : m))
    );
  };

  // Runs on Next and on Submit. Before the application exists the writing
  // steps have nowhere to go but the draft, so they save nothing here.
  const persist = async (index) => {
    if (closed) return true;
    const writesApplication =
      canEditApplication &&
      ((exists && APPLICATION_STEPS.includes(index)) || index === REVIEW);
    // Without a resolved user_id there is no row to write to, and claiming
    // "Saved." would be a lie.
    const writesMember = index === MEMBER && !!myUserId;
    if (!writesApplication && !writesMember) return true;

    // Every application write replaces the whole record, so an empty domain
    // list is rejected no matter which step triggered the save. Checked here
    // rather than only on submit because an application stored before domains
    // existed comes back with none, and its leader can reach a save from any
    // step through the review's Edit links.
    if (writesApplication) {
      const domainErrors = validateDomains(form);
      if (hasErrors(domainErrors)) {
        setErrors(domainErrors);
        setDirection("back");
        setStep(DOMAINS);
        setSaveError("Pick your domains before this can be saved.");
        return false;
      }
    }

    setSaving(true);
    setSaveError("");
    try {
      if (writesApplication) await saveApplication();
      if (writesMember) await saveMemberDetails();
      setNotice("Saved.");
      return true;
    } catch (err) {
      handleSaveError(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goTo = (index, dir) => {
    setDirection(dir);
    setStep(index);
    setErrors({});
    setSaveError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const next = async () => {
    if (saving) return;
    const stepErrors = validateStep(step);
    if (hasErrors(stepErrors)) {
      setErrors(stepErrors);
      return;
    }
    if (!(await persist(step))) return;
    if (step < LAST) goTo(step + 1, "forward");
  };

  const back = () => {
    if (saving || step === BRIEF) return;
    goTo(step - 1, "back");
  };

  const submit = async () => {
    if (saving) return;
    // Submit validates everything the leader owns, not just the current step,
    // because this is the one call that has to satisfy the API all at once.
    const all = { ...validateDomains(form), ...validateIdea(form), ...validateLinks(form) };
    const priorWorkErrors = validatePriorWork(form.prior_work);
    if (hasErrors(all)) {
      setErrors(all);
      const target = Object.keys(all)
        .map((field) => STEP_FOR_FIELD[field])
        .filter((s) => s !== undefined)
        .sort((a, b) => a - b)[0];
      goTo(target ?? DOMAINS, "back");
      setErrors(all);
      setSaveError("Fix these before submitting.");
      return;
    }
    if (hasErrors(priorWorkErrors)) {
      setErrors(priorWorkErrors);
      goTo(PRIOR, "back");
      setErrors(priorWorkErrors);
      setSaveError("Fix these before submitting.");
      return;
    }
    if (await persist(REVIEW)) {
      setNotice(
        "Submitted. You can keep editing until the deadline, and the latest version is what gets reviewed."
      );
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const headerRight = (
    <div className="flex items-center gap-5">
      <MonoLink to="/team">team</MonoLink>
      <GhostButton onClick={logout}>logout</GhostButton>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <AuthShell label="SUBMIT" right={headerRight}>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={() => setAttempt((a) => a + 1)}>Retry</PrimaryButton>
        </div>
      </AuthShell>
    );
  }

  if (loading) {
    return (
      <AuthShell label="SUBMIT">
        <p className="font-mono text-[0.8rem] text-lime/70">Loading your application…</p>
      </AuthShell>
    );
  }

  const stepView = () => {
    if (step === BRIEF) return <BriefRecap />;
    if (step === DOMAINS)
      return (
        <DomainsStep
          form={form}
          errors={errors}
          onChange={updateForm}
          canEdit={canEditApplication}
          leaderName={leaderName}
        />
      );
    if (step === IDEA)
      return (
        <IdeaStep
          form={form}
          errors={errors}
          onChange={updateForm}
          canEdit={canEditApplication}
          leaderName={leaderName}
        />
      );
    if (step === LINKS)
      return (
        <LinksStep
          form={form}
          errors={errors}
          onChange={updateForm}
          canEdit={canEditApplication}
          leaderName={leaderName}
        />
      );
    if (step === PRIOR)
      return (
        <PriorWorkStep
          form={form}
          errors={errors}
          onChange={updateForm}
          canEdit={canEditApplication}
          leaderName={leaderName}
        />
      );
    if (step === MEMBER)
      return (
        <MemberDetailsStep
          form={memberForm}
          errors={errors}
          onChange={updateMemberForm}
          name={myName}
          canSave={!!myUserId}
          accountEmail={getUser()?.email ?? ""}
          leaderName={leaderName}
        />
      );
    return (
      <ReviewStep
        form={form}
        members={members}
        exists={exists}
        canEdit={canEditApplication}
        onJump={(index) => goTo(index, "back")}
      />
    );
  };

  const submitLabel = exists ? "Save changes" : "Submit application";

  return (
    <AuthShell label="SUBMIT" step={exists ? "done" : "idea"} right={headerRight}>
      {/* Keyed by step so the transition replays on every move. PhaseTransition
          only animates when `direction` changes, and two Nexts in a row don't
          change it. */}
      <PhaseTransition key={step} direction={direction}>
        <div className="flex w-full max-w-[760px] flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/50">
              Step {step + 1} of {LAST + 1}
            </p>
            <Countdown onExpire={() => setClosed(true)} />
          </div>

          {closed && (
            <p className="rounded-md border-[0.5px] border-[rgba(255,120,120,0.35)] bg-[rgba(255,120,120,0.06)] px-[1.1rem] py-[0.9rem] font-general text-[0.87rem] leading-relaxed text-white/75">
              Submissions have closed. What your team had saved is what gets reviewed.
            </p>
          )}

          {stepView()}

          <NoticeLine>{notice}</NoticeLine>
          <ErrorLine>{saveError}</ErrorLine>

          <StepNav>
            <GhostButton disabled={step === BRIEF || saving} onClick={back}>
              <span className="inline-flex items-center gap-[0.35rem]">
                <ArrowLeft size={13} /> Back
              </span>
            </GhostButton>

            <div className="w-full sm:w-[260px]">
              {step === REVIEW ? (
                <PrimaryButton
                  disabled={saving || closed || !canEditApplication}
                  onClick={submit}
                >
                  <span className="inline-flex items-center gap-[0.4rem]">
                    {saving ? "Saving…" : submitLabel}
                    {!saving && <Check size={14} />}
                  </span>
                </PrimaryButton>
              ) : (
                <PrimaryButton disabled={saving} onClick={next}>
                  <span className="inline-flex items-center gap-[0.4rem]">
                    {saving ? "Saving…" : "Next"}
                    {!saving && <ArrowRight size={14} />}
                  </span>
                </PrimaryButton>
              )}
            </div>
          </StepNav>

          {step === REVIEW && !canEditApplication && !closed && (
            <p className="font-general text-[0.85rem] leading-relaxed text-white/45">
              Only {leaderName} can submit the application. Your own details save on their
              own step, whether or not the application has been sent.
            </p>
          )}
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default SubmissionPage;
