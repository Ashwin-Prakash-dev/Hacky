import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase05Statement = ({ onNext, onBack, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 05 — FINAL STATEMENT" tagline='"Make your case."' />
    <PhaseNav onNext={onNext} onBack={onBack} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase05Statement;
