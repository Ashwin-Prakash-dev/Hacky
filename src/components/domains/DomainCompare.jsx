import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { COMPARE_ATTRS, DOMAINS } from "../../lib/domains";

// Comparing four domains across five dimensions is a 20-cell table, which is
// unreadable on a phone. So we render one dimension at a time and let all
// four domains answer it together. The comparison survives, the table
// doesn't. Each answer is itself the link through, so weighing the domains
// and choosing one are the same gesture.
const DomainCompare = () => {
  const [active, setActive] = useState(COMPARE_ATTRS[0].id);
  const gridRef = useRef(null);
  const tabRefs = useRef([]);

  const index = COMPARE_ATTRS.findIndex((a) => a.id === active);
  const attr = COMPARE_ATTRS[index];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-cell]",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.06 },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [active]);

  const onKeyDown = (e) => {
    const last = COMPARE_ATTRS.length - 1;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(COMPARE_ATTRS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="w-full bg-[#050505] py-[clamp(4rem,10vw,7rem)]">
      <div className="container mx-auto px-5 md:px-10">
        <span className="eyebrow mb-6">Choose your domain</span>
        <h2 className="special-font bento-title mb-10 max-w-[22ch] text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-white">
          Weigh them aga<b>i</b>nst each other<b>.</b>
        </h2>

        {/* Dimension picker */}
        <div
          role="tablist"
          aria-label="Compare domains by"
          onKeyDown={onKeyDown}
          className="mb-10 flex flex-wrap gap-2"
        >
          {COMPARE_ATTRS.map((a, i) => {
            const on = a.id === active;
            return (
              <button
                key={a.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                type="button"
                id={`compare-tab-${a.id}`}
                aria-selected={on}
                aria-controls={`compare-panel-${a.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(a.id)}
                className={`rounded-full border px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] outline-none transition-[color,border-color,background] duration-300 focus-visible:ring-1 focus-visible:ring-lime/60 ${
                  on
                    ? "border-lime/40 bg-lime/[0.07] text-lime"
                    : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white/85"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`compare-panel-${attr.id}`}
          aria-labelledby={`compare-tab-${attr.id}`}
          tabIndex={0}
          className="outline-none"
        >
          <p className="mb-2 font-general text-[clamp(1.05rem,2.2vw,1.35rem)] leading-[1.4] tracking-[-0.01em] text-white">
            {attr.heading}
          </p>
          <p className="mb-8 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/35">
            Each answer opens that domain&apos;s full brief
          </p>

          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-4"
          >
            {DOMAINS.map((d) => {
              const value = d.compare[attr.id];
              return (
                <Link
                  key={d.slug}
                  to={`/domains/${d.slug}`}
                  data-cell
                  className="group flex flex-col gap-3 border-t-2 border-white/[0.09] py-6 pr-4 no-underline outline-none transition-colors duration-300 focus-visible:border-lime/45 focus-visible:ring-1 focus-visible:ring-lime/50 hover:border-lime/60"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.7rem] tracking-[0.14em] text-lime/55">
                      {d.num}
                    </span>
                    <span className="font-general text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/90">
                      {d.short}
                    </span>
                  </span>

                  {Array.isArray(value) ? (
                    <ul className="flex flex-col gap-2">
                      {value.map((v) => (
                        <li
                          key={v}
                          className="font-general text-[0.92rem] leading-[1.6] text-white/70 transition-colors duration-300 group-hover:text-white/90"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-general text-[0.95rem] leading-[1.65] text-white/70 transition-colors duration-300 group-hover:text-white/90">
                      {value}
                    </p>
                  )}

                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.05] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-lime/85 transition-[background,border-color,color] duration-300 group-hover:border-lime/50 group-hover:bg-lime/10 group-hover:text-lime">
                    Read the brief
                    <ArrowUpRight size={12} strokeWidth={2.25} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-10 max-w-[62ch] font-general text-[0.9rem] leading-[1.75] text-white/50">
          Projects may draw on more than one domain. Pick the single domain that best
          represents your central problem and the outcome you intend to improve.
        </p>
      </div>
    </section>
  );
};

export default DomainCompare;
