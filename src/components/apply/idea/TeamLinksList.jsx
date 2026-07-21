import { Link2 } from "lucide-react";
import { Panel, Eyebrow } from "../ui";

const LinkChip = ({ href, label }) =>
  href ? (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className="font-mono text-[0.78rem] text-lime/85 underline underline-offset-[3px] hover:text-lime"
    >
      {label}
    </a>
  ) : (
    <span className="font-mono text-[0.78rem] text-white/25">{label}</span>
  );

/** Read-only roster of every teammate's showcase links, for judges/browsing. */
const TeamLinksList = ({ members, memberLinks }) => {
  const byUser = new Map((memberLinks ?? []).map((l) => [l.user_id, l]));
  const rows = members.filter((m) => byUser.has(m.user_id));
  if (rows.length === 0) return null;

  return (
    <Panel maxWidth="none">
      <Eyebrow>Team links</Eyebrow>
      <div className="mt-2 flex flex-col gap-3">
        {rows.map((m) => {
          const entry = byUser.get(m.user_id);
          const projectCount = entry.project_links?.length ?? 0;
          return (
            <div key={m.user_id} className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-general text-[0.88rem] text-white/85">{m.name}</p>
              <div className="flex flex-wrap items-center gap-4">
                <LinkChip href={entry.github} label="GitHub" />
                <LinkChip href={entry.linkedin} label="LinkedIn" />
                {projectCount > 0 && (
                  <span className="inline-flex items-center gap-[0.3rem] font-mono text-[0.78rem] text-white/60">
                    <Link2 size={12} strokeWidth={2.25} /> {projectCount} project{projectCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export default TeamLinksList;
