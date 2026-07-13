import { MONO, SANS, GhostButton, PrimaryButton } from "../ui";

const InviteCards = ({ invites, onAccept, onDecline, busyId }) => {
  if (!invites.length) return null;
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p style={{
        fontFamily: MONO, fontSize: "0.85rem", letterSpacing: "0.14em",
        color: "rgba(200,255,0,0.9)", marginBottom: "0.75rem",
      }}>
        [PENDING INVITES]
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {invites.map((inv) => (
          <div key={inv.invite_id} style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "0.75rem",
            padding: "0.9rem 1.1rem",
            background: "rgba(200,255,0,0.04)",
            border: "0.5px solid rgba(200,255,0,0.25)", borderRadius: "6px",
          }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                {inv.team_name}
              </p>
              <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                invited by {inv.invited_by}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "110px" }}>
                <PrimaryButton
                  disabled={busyId === inv.invite_id}
                  onClick={() => onAccept(inv.invite_id)}
                >
                  Accept
                </PrimaryButton>
              </div>
              <GhostButton
                danger
                disabled={busyId === inv.invite_id}
                onClick={() => onDecline(inv.invite_id)}
              >
                decline
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteCards;
