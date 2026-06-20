import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase06Deploy = ({ onNext, onBack, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 06 — DEPLOY" tagline='"Review and transmit."' />
    <PhaseNav onNext={onNext} onBack={onBack} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase06Deploy;
