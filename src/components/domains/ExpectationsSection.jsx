import { forwardRef } from "react";
import SectionHead from "./SectionHead";
import { useScrollReveal } from "../../lib/useScrollReveal";

// The six numbered expectations that apply to every submission in every
// domain — a real ordered list from the source document, not decoration, so
// the ghost-numeral row treatment (shared with StudentHook's outcome rows)
// is justified here.
const ExpectationsSection = forwardRef(({ items, active }, ref) => {
  useScrollReveal(ref, active);

  return (
    <section ref={ref} className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
      <SectionHead
        title="Expectations across all domains"
        sub="These six rules apply to every submission, in every domain — read them before you start building."
      />
      <div className="mt-10 border-t border-white/[0.06]">
        {items.map((item, i) => (
          <div
            key={item.title}
            data-reveal
            className="grid grid-cols-[2.5rem_1fr] gap-[clamp(1.25rem,3vw,3rem)] border-b border-white/[0.06] py-[clamp(1.5rem,3vw,2.25rem)] sm:grid-cols-[3.5rem_1fr]"
          >
            <span className="select-none font-display text-[clamp(2.2rem,3.5vw,3rem)] font-normal leading-none tracking-[-0.03em] text-lime/[0.16]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-general text-[clamp(1.05rem,1.8vw,1.3rem)] font-extrabold leading-[1.2] tracking-[-0.01em] text-white">
                {item.title}
              </h3>
              <p className="mt-2.5 max-w-[52rem] font-general text-[0.92rem] leading-[1.75] text-white/70">
                {item.body}
              </p>
              {item.list && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {item.list.map((li) => (
                    <li key={li} className="flex gap-2.5 font-general text-[0.85rem] leading-[1.55] text-white/60">
                      <span className="mt-[0.55em] size-[4px] shrink-0 rounded-full bg-lime/60" />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
              {item.note && (
                <p className="mt-4 max-w-[46rem] font-general text-[0.82rem] italic leading-[1.6] text-white/45">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

ExpectationsSection.displayName = "ExpectationsSection";

export default ExpectationsSection;
