import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase04Arsenal = ({ onNext, onBack, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 04 — ARSENAL" tagline={`"What you're bringing to the fight."`} />
    <PhaseNav onNext={onNext} onBack={onBack} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase04Arsenal;
