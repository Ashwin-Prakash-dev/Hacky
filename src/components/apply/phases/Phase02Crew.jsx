import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase02Crew = ({ onNext, onBack, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 02 — CREW MANIFEST" tagline={`"Who's in the room with you."`} />
    <PhaseNav onNext={onNext} onBack={onBack} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase02Crew;
