import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/apply/AuthShell";
import PhaseTransition from "../components/apply/PhaseTransition";
import LogisticsPanel from "../components/apply/team/LogisticsPanel";
import ConfirmDialog from "../components/apply/ConfirmDialog";
import {
  Panel,
  Eyebrow,
  ErrorLine,
  PrimaryButton,
  GhostButton,
  MonoLink,
} from "../components/apply/ui";
import { api } from "../lib/startathon";
import { clearAuth } from "../lib/auth";
import { currentMember, isSelected } from "../lib/teamRules";
import { copyToMember, isComplete } from "../lib/logistics";

// One roster line. A teammate's answers are theirs to read and change; all this
// page owes anyone else is whether the kitchen has a number for them yet.
const StatusRow = ({ name, done, you }) => (
  <li className="flex items-center justify-between gap-4 border-t-[0.5px] border-white/[0.08] py-[0.7rem] first:border-t-0">
    <span className="font-general text-[0.9rem] text-white/80">
      {name}
      {you && <span className="text-white/35"> (you)</span>}
    </span>
    <span
      className={`font-mono text-[0.75rem] tracking-[0.12em] ${
        done ? "text-lime/80" : "text-white/40"
      }`}
    >
      {done ? "FILLED IN" : "NOT YET"}
    </span>
  </li>
);

/**
 * Food and travel answers for a shortlisted team. Independent of the selection
 * fee: either can be done first, and neither waits on the other.
 *
 * A member answers for themselves; the leader may answer for anyone, because
 * chasing three people for a catering count by hand is worse than letting the
 * one organised person fill it in.
 */
const LogisticsPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [saveErrors, setSaveErrors] = useState({});
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState("");
  // The payload waiting on the confirm, or null when the dialog is shut. Held
  // rather than re-read on confirm because it is the leader's form as it stands,
  // unsaved edits included, not the row the server last returned.
  const [confirmCopy, setConfirmCopy] = useState(null);

  const refresh = useCallback(() => {
    setLoadError("");
    return Promise.all([api.getTeam(), api.getLogistics()])
      .then(([teamData, logistics]) => {
        setTeam(teamData);
        // The endpoint returns the roster; tolerate it arriving bare or wrapped,
        // since either reads the same to everything below.
        setRows(
          logistics?.members ?? (Array.isArray(logistics) ? logistics : []),
        );
      })
      .catch((err) => {
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setLoadError(err.message);
      });
  }, [navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Only a shortlisted team has an event to be catered for. Says nothing about
  // results: a waitlisted team and one still being evaluated look identical
  // from here, so the notice speaks only about this page.
  useEffect(() => {
    if (!team || isSelected(team)) return;
    navigate("/team", {
      replace: true,
      state: {
        notice: "The food and travel form is only open to shortlisted teams.",
      },
    });
  }, [team, navigate]);

  const me = useMemo(() => currentMember(team), [team]);
  const isLeader = team?.your_role === "leader";

  const rowFor = useCallback(
    (userId) => rows?.find((r) => r.user_id === userId) ?? null,
    [rows],
  );

  const save = async (userId, fields) => {
    if (savingId) return false;
    setSavingId(userId);
    setSaveErrors((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.putMemberLogistics(userId, fields);
      // The server decides what the row is now, including who it records as
      // having answered, so re-read rather than patching local state.
      await refresh();
      return true;
    } catch (err) {
      setSaveErrors((prev) => ({ ...prev, [userId]: err.message }));
      return false;
    } finally {
      setSavingId(null);
    }
  };

  // Sequential on purpose: one failure stops the rest rather than firing four
  // writes at a server that just rejected one. A stop halfway leaves the
  // teammates already written filled in, which the refresh below shows honestly.
  const copyToTeam = async () => {
    if (copyBusy || !confirmCopy) return;
    setCopyBusy(true);
    setCopyError("");
    try {
      // The leader's own row goes first, so what the team ends up with is
      // exactly what the leader is looking at, unsaved edits included.
      await api.putMemberLogistics(me.user_id, confirmCopy);
      for (const m of (team?.members ?? []).filter(
        (x) => x.user_id !== me?.user_id && !isComplete(rowFor(x.user_id)),
      )) {
        await api.putMemberLogistics(
          m.user_id,
          copyToMember(confirmCopy, rowFor(m.user_id)),
        );
      }
      setConfirmCopy(null);
    } catch (err) {
      setCopyError(err.message);
    } finally {
      await refresh();
      setCopyBusy(false);
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

  if (loadError) {
    return (
      <AuthShell label="LOGISTICS" right={headerRight}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={refresh}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  // Also covers the frame between loading a team that isn't shortlisted and the
  // redirect above taking effect.
  if (!team || !rows || !isSelected(team)) {
    return (
      <AuthShell label="LOGISTICS">
        <p className="font-mono text-[0.8rem] text-lime/70">
          Loading your team&hellip;
        </p>
      </AuthShell>
    );
  }

  const members = team.members;
  const myRow = rowFor(me?.user_id);
  const filled = members.filter((m) => isComplete(rowFor(m.user_id)));
  // Who the leader's answers would go to. A teammate who has already answered
  // is left alone: copying over their food is a worse mistake than leaving a
  // duplicate form for them to fill in.
  const pending = members.filter(
    (m) => m.user_id !== me?.user_id && !isComplete(rowFor(m.user_id)),
  );
  // No check on the leader's own row being saved: the button carries the form
  // as it stands and saves it on the way, and the panel keeps it dead until
  // there is a food answer on it to carry.
  const canCopy = isLeader && pending.length > 0;

  return (
    <AuthShell label="LOGISTICS" step="done" right={headerRight}>
      <PhaseTransition>
        <div className="flex w-full max-w-[760px] flex-col gap-5">
          <h1 className="font-mono text-[clamp(1.5rem,5vw,2.2rem)] font-bold tracking-[0.02em] text-white">
            {team.team_name}
          </h1>

          <Panel maxWidth="none">
            <Eyebrow>Food and travel</Eyebrow>
            <p className="mt-2 font-general text-[0.9rem] leading-relaxed text-white/70">
              We cook to these numbers and plan pickups around them, so every
              seat needs an answer. Nothing here is locked in: save what you
              know now and change it when your plans firm up.
            </p>
          </Panel>

          {me && (
            <LogisticsPanel
              member={me}
              row={myRow}
              onSave={save}
              busy={savingId === me.user_id || copyBusy}
              // Both failures belong to this panel's one pair of buttons, and
              // only one of them can be in flight at a time.
              error={saveErrors[me.user_id] || copyError}
              copyToTeam={
                canCopy
                  ? {
                      label:
                        pending.length === 1
                          ? "Same for my teammate"
                          : "Same for whole team",
                      onClick: setConfirmCopy,
                      busy: copyBusy,
                    }
                  : null
              }
            />
          )}

          <Panel maxWidth="none">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <Eyebrow>Your team</Eyebrow>
              <span className="font-mono text-[0.78rem] tracking-[0.12em] text-white/40">
                {filled.length} OF {members.length} FILLED IN
              </span>
            </div>

            <ul className="mt-3 list-none p-0">
              {members.map((m) => (
                <StatusRow
                  key={m.user_id ?? m.email}
                  name={m.name ?? m.email}
                  done={isComplete(rowFor(m.user_id))}
                  you={m.user_id === me?.user_id}
                />
              ))}
            </ul>

            <p className="mt-4 font-general text-[0.85rem] leading-relaxed text-white/45">
              {!isLeader
                ? "Everyone answers for themselves, or your leader can fill it in for whoever hasn't."
                : pending.length === 0
                  ? "Everyone has answered. Changes are theirs to make from their own screen."
                  : "Travelling together? The button above puts your own answers on everyone still missing. They can change theirs afterwards."}
            </p>
          </Panel>
        </div>
      </PhaseTransition>

      <ConfirmDialog
        open={!!confirmCopy}
        title="Use your answers for the rest of the team?"
        body={`Your food, travel and arrival answers go onto ${pending
          .map((m) => m.name ?? m.email)
          .join(
            ", ",
          )}. Anything they wrote about allergies stays theirs, and they can change the rest any time.`}
        confirmLabel="Apply to team"
        busy={copyBusy}
        onConfirm={copyToTeam}
        onCancel={() => setConfirmCopy(null)}
      />
    </AuthShell>
  );
};

export default LogisticsPage;
