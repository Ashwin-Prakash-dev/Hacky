import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase03Mission = ({ onNext, onBack, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 03 — THE MISSION" tagline='"What are you going to build."' />
    <PhaseNav onNext={onNext} onBack={onBack} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase03Mission;
