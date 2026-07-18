import { GhostButton, PrimaryButton } from "../ui";

const InviteCards = ({ invites, onAccept, onDecline, busyId }) => {
  if (!invites.length) return null;
  return (
    <div className="mb-7">
      <p className="mb-3 font-mono text-[0.85rem] tracking-[0.14em] text-lime/90">
        [YOU&apos;VE BEEN INVITED]
      </p>
      <div className="flex flex-col gap-[0.6rem]">
        {invites.map((inv) => (
          <div
            key={inv.invite_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border-[0.5px] border-lime/25 bg-lime/[0.04] px-[1.1rem] py-[0.9rem]"
          >
            <div>
              <p className="font-mono text-[0.9rem] font-bold text-white">
                {inv.team_name}
              </p>
              <p className="font-general text-[0.85rem] text-white/80">
                {inv.invited_by} invited you to join their team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[110px]">
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
                Decline
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteCards;
