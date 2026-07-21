import { useEffect, useState } from "react";
import { Panel, Eyebrow, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";

/**
 * Self-contained idea status widget for the team page — fetches its own
 * data so TeamPage doesn't have to grow state for a feature it just links to.
 */
const IdeaStatusCard = ({ isLeader }) => {
  const [idea, setIdea] = useState(undefined); // undefined = loading, null = none yet

  useEffect(() => {
    let cancelled = false;
    api
      .getIdea()
      .then((data) => !cancelled && setIdea(data))
      .catch((err) => !cancelled && err.status === 404 && setIdea(null));
    return () => {
      cancelled = true;
    };
  }, []);

  if (idea === undefined) return null;

  return (
    <Panel maxWidth="none">
      <Eyebrow>Idea</Eyebrow>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="font-general text-[0.9rem] leading-relaxed text-white/75">
          {idea
            ? idea.title
            : isLeader
              ? "Not submitted yet."
              : "Your leader hasn't submitted an idea yet."}
        </p>
        {(isLeader || idea) && (
          <MonoLink to="/team/idea">
            {idea ? (isLeader ? "Edit idea" : "View idea") : "Submit idea"}
          </MonoLink>
        )}
      </div>
    </Panel>
  );
};

export default IdeaStatusCard;
