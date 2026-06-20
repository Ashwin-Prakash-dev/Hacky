import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase01Identity = ({ onNext, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 01 — IDENTITY CLEARANCE" tagline='"Establish your presence in the system."' />
    <PhaseNav onNext={onNext} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase01Identity;
