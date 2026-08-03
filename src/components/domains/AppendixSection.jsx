import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "../../lib/useScrollReveal";

// Reference material, not core content: a native <details> disclosure kept
// closed by default so it reads as something to consult if relevant, not
// something everyone must read. Quieter type scale and muted colour
// throughout signal the same thing visually.
const AppendixSection = forwardRef(({ appendix, active }, ref) => {
  useScrollReveal(ref, active);

  return (
    <section ref={ref} className="container mx-auto px-5 py-24 md:px-10 md:py-32">
      <div data-reveal>
        <span className="eyebrow eyebrow--quiet mb-5">Reference material</span>
        <details className="group rounded-3xl border border-white/[0.08] bg-white/[0.015]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 outline-none focus-visible:bg-white/[0.03] md:p-8 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-display text-[clamp(1.25rem,2.4vw,1.7rem)] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
                {appendix.title}
              </span>
              <span className="mt-1.5 block max-w-[46rem] font-general text-[0.85rem] leading-[1.6] text-white/50">
                {appendix.note}
              </span>
            </span>
            <ChevronDown
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-white/40 transition-transform duration-300 group-open:rotate-180"
            />
          </summary>

          <div className="border-t border-white/[0.07] p-6 md:p-8">
            <p className="font-general text-[0.88rem] leading-[1.75] text-white/60">
              {appendix.examplesIntro}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 pl-5">
              {appendix.examples.map((ex) => (
                <li
                  key={ex}
                  className="list-disc font-general text-[0.86rem] italic leading-[1.65] text-white/50 marker:text-lime/40"
                >
                  {ex}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-general text-[0.88rem] leading-[1.75] text-white/60">
              {appendix.challenge}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {appendix.requirements.map((r) => (
                <div key={r.label}>
                  <p className="font-general text-[0.9rem] font-bold text-white/90">{r.label}</p>
                  <p className="mt-1 font-general text-[0.83rem] leading-[1.65] text-white/50">{r.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] pt-6">
              <p className="font-general text-[0.83rem] leading-[1.7] text-white/45">
                <span className="font-bold text-white/65">Insufficient: </span>
                {appendix.insufficient}
              </p>
              <p className="font-general text-[0.83rem] leading-[1.7] text-white/45">
                <span className="font-bold text-white/65">Additional measures: </span>
                {appendix.measures}
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
});

AppendixSection.displayName = "AppendixSection";

export default AppendixSection;
