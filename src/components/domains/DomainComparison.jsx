import { forwardRef, Fragment, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHead from "./SectionHead";
import DomainTitle from "./DomainTitle";
import { useScrollReveal } from "../../lib/useScrollReveal";

const ROWS = [
  { key: "outcome", label: "Primary outcome" },
  { key: "audienceLine", label: "Who you're building for" },
  { key: "comparisonExamples", label: "Example problems" },
  { key: "successLine", label: "Success criteria" },
  { key: "pitfallLine", label: "Common pitfall" },
];

// A spec-matrix rebuild of the source document's one-page comparison table:
// hover or focus a domain to spotlight its column, click to jump straight
// into that brief. `active` gates the scroll-reveal off while this section
// sits behind the expanded detail page. `onExplore` receives the full
// domain object and is expected to scroll to + open its card.
const DomainComparison = forwardRef(({ domains, active, onExplore }, ref) => {
  const [activeCol, setActiveCol] = useState(null);
  useScrollReveal(ref, active);

  const hoverProps = (i) => ({
    onMouseEnter: () => setActiveCol(i),
    onMouseLeave: () => setActiveCol((c) => (c === i ? null : c)),
  });

  const cellClass = (i) =>
    `border-t border-white/[0.06] px-4 py-5 transition-[background-color,opacity] duration-300 ${
      activeCol === i ? "bg-lime/[0.035]" : activeCol === null ? "" : "opacity-45"
    }`;

  return (
    <section ref={ref} className="container mx-auto px-5 pb-4 pt-6 md:px-10 md:pt-10">
      <SectionHead
        title="Compare the four domains"
        sub="Same nine-part structure underneath — outcome, audience, examples and failure mode differ. Find your central problem here before opening a brief."
      />

      {/* Desktop / tablet: spec matrix */}
      <div data-reveal className="mt-10 hidden overflow-x-auto md:block">
        <div className="grid min-w-[62rem] grid-cols-[11rem_repeat(4,1fr)]">
          <div />
          {domains.map((d, i) => {
            const Icon = d.icon;
            return (
              <button
                key={d.slug}
                type="button"
                {...hoverProps(i)}
                onFocus={() => setActiveCol(i)}
                onBlur={() => setActiveCol((c) => (c === i ? null : c))}
                onClick={() => onExplore(d)}
                className={`group flex cursor-pointer flex-col items-start gap-3 rounded-t-2xl border border-b-0 border-white/[0.08] p-5 text-left outline-none transition-colors duration-300 focus-visible:border-lime/40 ${
                  activeCol === i ? "bg-lime/[0.035]" : ""
                }`}
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-lime/20 bg-lime/[0.06] text-lime">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="special-font font-display text-[1.02rem] leading-[1.2] tracking-[-0.01em] text-white">
                  <DomainTitle title={d.title} />
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-lime/80 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100">
                  Open brief
                  <ArrowUpRight size={11} strokeWidth={2.25} aria-hidden="true" />
                </span>
              </button>
            );
          })}

          {ROWS.map((row) => (
            <Fragment key={row.key}>
              <div className="border-t border-white/[0.06] px-4 py-5 font-mono text-[0.64rem] uppercase leading-[1.4] tracking-[0.14em] text-white/45">
                {row.label}
              </div>
              {domains.map((d, i) => (
                <div key={`${row.key}-${d.slug}`} {...hoverProps(i)} className={cellClass(i)}>
                  {row.key === "comparisonExamples" ? (
                    <ul className="flex flex-col gap-1.5">
                      {d.comparisonExamples.map((ex) => (
                        <li key={ex} className="flex gap-2 font-general text-[0.85rem] leading-[1.55] text-white/70">
                          <span className="mt-[0.5em] size-[4px] shrink-0 rounded-full bg-lime/60" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-general text-[0.88rem] leading-[1.6] text-white/75">{d[row.key]}</p>
                  )}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: stacked spec cards */}
      <div data-reveal className="mt-10 flex flex-col gap-5 md:hidden">
        {domains.map((d) => {
          const Icon = d.icon;
          return (
            <div key={d.slug} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <button
                type="button"
                onClick={() => onExplore(d)}
                className="group -m-1 flex w-[calc(100%+0.5rem)] cursor-pointer items-center justify-between gap-3 rounded-xl p-1 text-left outline-none focus-visible:bg-white/[0.03]"
                aria-label={`Open the ${d.title} brief`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-lime/20 bg-lime/[0.06] text-lime">
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="special-font font-display text-[1.02rem] leading-[1.2] tracking-[-0.01em] text-white">
                    <DomainTitle title={d.title} />
                  </span>
                </span>
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" className="shrink-0 text-lime" />
              </button>
              <dl className="mt-5 flex flex-col gap-4 border-t border-white/[0.06] pt-5">
                {ROWS.map((row) => (
                  <div key={row.key}>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/45">
                      {row.label}
                    </dt>
                    {row.key === "comparisonExamples" ? (
                      <dd className="mt-1.5 flex flex-col gap-1">
                        {d.comparisonExamples.map((ex) => (
                          <span key={ex} className="flex gap-2 font-general text-[0.85rem] leading-normal text-white/70">
                            <span className="mt-[0.5em] size-[4px] shrink-0 rounded-full bg-lime/60" />
                            {ex}
                          </span>
                        ))}
                      </dd>
                    ) : (
                      <dd className="mt-1.5 font-general text-[0.86rem] leading-[1.55] text-white/70">{d[row.key]}</dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>

      <p data-reveal className="mt-8 max-w-[46rem] font-general text-[0.85rem] italic leading-[1.7] text-white/45">
        Projects may draw on more than one domain. Select the single domain that best represents
        your central problem and the primary outcome you intend to improve.
      </p>
    </section>
  );
});

DomainComparison.displayName = "DomainComparison";

export default DomainComparison;
