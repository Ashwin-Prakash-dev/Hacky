// Shared section heading for the /domains route — used by the domain brief,
// the comparison matrix and the expectations list so heading rhythm stays
// identical across all three.
const SectionHead = ({ title, sub }) => (
  <div data-reveal>
    <h2 className="max-w-[24ch] text-balance font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
      {title}
    </h2>
    {sub && (
      <p className="mt-3 max-w-[38rem] font-general text-[0.95rem] leading-[1.75] text-white/60">
        {sub}
      </p>
    )}
  </div>
);

export default SectionHead;
