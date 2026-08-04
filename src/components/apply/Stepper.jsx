const STEPS = [
  { key: "account", label: "Account" },
  { key: "phone", label: "Details" },
  { key: "team", label: "Team" },
  { key: "pay", label: "Pay" },
  { key: "idea", label: "Idea" },
];

const Dot = ({ done, active }) => (
  <span
    aria-hidden="true"
    className={`size-[10px] shrink-0 rounded-full ${
      done
        ? "border-none bg-lime"
        : active
        ? "border-[1.5px] border-lime bg-lime/[0.15] shadow-[0_0_10px_rgba(200,255,0,0.35)]"
        : "border border-white/20 bg-white/10"
    }`}
  />
);

/**
 * Cross-page progress indicator for the application flow.
 * `current`: "account" | "phone" | "team" | "pay" | "idea" | "done"
 *
 * "done" means the idea has been submitted, not merely that payment cleared —
 * a confirmed team that hasn't submitted yet is on "idea".
 */
const Stepper = ({ current }) => {
  const idx = current === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Application progress" className="mb-8 flex w-full flex-wrap items-center justify-center gap-[0.4rem]">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-[0.4rem]">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`h-px w-[clamp(14px,4vw,32px)] ${done ? "bg-lime/45" : "bg-white/[0.12]"}`}
              />
            )}
            <Dot done={done} active={active} />
            <span
              aria-current={active ? "step" : undefined}
              className={`font-mono text-[0.68rem] uppercase tracking-[0.12em] ${
                active ? "font-bold text-white" : done ? "text-lime/75" : "text-white/40"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
};

export default Stepper;
