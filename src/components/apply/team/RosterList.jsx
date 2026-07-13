import { MONO, SANS, Panel, Eyebrow, GhostButton } from "../ui";

const MAX_SLOTS = 4;

const RosterList = ({ team, onKick, busyId }) => {
  const canKick = team.your_role === "leader" && team.status !== "confirmed";
  const emptySlots = MAX_SLOTS - team.members.length;

  return (
    <Panel maxWidth="none">
      <Eyebrow>ROSTER — {team.members.length}/{MAX_SLOTS}</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {team.members.map((m) => (
          <div key={m.user_id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "0.75rem", padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "6px",
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                {m.name}
                {m.role === "leader" && (
                  <span style={{
                    fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.12em",
                    color: "#C8FF00", marginLeft: "0.6rem",
                  }}>
                    [LEADER]
                  </span>
                )}
              </p>
              <p style={{
                fontFamily: MONO, fontSize: "0.82rem", color: "rgba(255,255,255,0.7)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {m.email}
              </p>
            </div>
            {canKick && m.role !== "leader" && (
              <GhostButton
                danger
                disabled={busyId === m.user_id}
                onClick={() => onKick(m)}
              >
                kick
              </GhostButton>
            )}
          </div>
        ))}
        {Array.from({ length: emptySlots }, (_, i) => (
          <div key={`empty-${i}`} style={{
            padding: "0.75rem 1rem",
            border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "6px",
          }}>
            <p style={{ fontFamily: MONO, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
              {"// open slot"}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default RosterList;
