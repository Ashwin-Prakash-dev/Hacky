/**
 * Segmented meter tied to the real 3-4 member rule: filled = joined,
 * faint = invited (pending), outlined = still-required, dim = optional 4th.
 */
const RosterMeter = ({ joined, pending = 0, min, max }) => (
  <div className="flex items-center gap-[0.3rem]" aria-hidden="true">
    {Array.from({ length: max }, (_, i) => {
      const filled = i < joined;
      const invited = !filled && i < joined + pending;
      const required = i < min;
      return (
        <span
          key={i}
          className={`h-[5px] w-5 rounded-[3px] ${
            filled ? "bg-lime" : invited ? "bg-lime/35" : "bg-white/10"
          } ${!filled && !invited && required ? "shadow-[inset_0_0_0_1px_rgba(200,255,0,0.3)]" : ""}`}
        />
      );
    })}
  </div>
);

export default RosterMeter;
