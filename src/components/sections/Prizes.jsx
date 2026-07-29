import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ladder = [
  { rank: "01", label: "First Place", amount: "₹1,00,000", top: true },
  { rank: "02", label: "Second Place", amount: "₹60,000", top: false },
  { rank: "03", label: "Third Place", amount: "₹40,000", top: false },
];

const stats = [
  ["30", "hrs total"],
  ["24", "hrs building"],
  ["6", "hrs evaluation"],
];

// Masked line: the child wipes upward out of the overflow-hidden shell.
// `lineClassName` is the GSAP class hook on the moving inner div.
const Mask = ({ children, className = "", lineClassName = "" }) => (
  <div className={`overflow-hidden ${className}`}>
    <div className={lineClassName}>{children}</div>
  </div>
);

// A slot-machine digit: nine decoy digits then the real one. The resting
// CSS transform (-90%) already shows the real digit, so no-JS and
// reduced-motion users see the finished figure; GSAP rolls yPercent
// 0 → -90 to spin through the decoys and land on it.
// Every glyph in the figure — ₹, commas, digits — sits in an identical
// top-aligned 1em slot box: an inline-block with overflow!=visible
// baseline-aligns on its BOTTOM edge, which shoved rolling digits off the
// line until all boxes shared the same alignment.
const slotClass = "inline-block h-[1em] overflow-hidden align-top";

const Reel = ({ digit }) => {
  const d = Number(digit);
  const column = Array.from({ length: 10 }, (_, k) => (d + 1 + k) % 10);
  return (
    <span className={slotClass}>
      <span className="pz-reel block translate-y-[-90%]">
        {column.map((n, k) => (
          <span key={k} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
};

const POOL = "2,00,000";

// The prize theater. Desktop: the section pins for ~2.3 viewports of
// scroll and the board fills in suspense order — hairlines sweep, then the
// ladder from third place up to first, then the ₹2L pool figure stamps in
// as the finale with the 30/24/6 strip. Mobile (and any coarse/small
// screen): no pinning — the page scrolls naturally and the board reveals
// once, top-down, as it enters. The DOM's default state is the fully
// revealed board, so no-JS and prefers-reduced-motion users just see the
// finished section.
const Prizes = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);
    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const q = gsap.utils.selector(sectionRef);

        // rewind everything to its pre-reveal state
        gsap.set(q(".pz-l-pool, .pz-l-01, .pz-l-02, .pz-l-03"), {
          yPercent: 110,
        });
        gsap.set(q(".pz-rule"), { scaleX: 0, transformOrigin: "left center" });
        gsap.set(q(".pz-fade"), { autoAlpha: 0 });
        gsap.set(q(".pz-stats"), { autoAlpha: 0, y: 24 });
        // y:0 matters — GSAP parses the resting CSS -translate-y-[90%]
        // into a px `y` baseline and would stack yPercent on top of it
        gsap.set(q(".pz-reel"), { y: 0, yPercent: 0 });

        if (ctx.conditions.desktop) {
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=150%",
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
            },
          });
          // the board draws fast, then the counter rolls through most of
          // the pin while the ladder slams in under it — stats land with
          // the last digit, short hold, release
          tl.to(
            q(".pz-rule"),
            { scaleX: 1, duration: 0.5, stagger: 0.06, ease: "power2.inOut" },
            0
          );
          tl.to(q(".pz-fade"), { autoAlpha: 1, duration: 0.35 }, 0.05);
          tl.to(q(".pz-l-pool"), { yPercent: 0, duration: 0.45 }, 0.1);
          tl.to(
            q(".pz-reel"),
            { yPercent: -90, duration: 1.7, stagger: 0.12, ease: "power2.out" },
            0.25
          );
          tl.to(q(".pz-l-03"), { yPercent: 0, duration: 0.4 }, 0.7);
          tl.to(q(".pz-l-02"), { yPercent: 0, duration: 0.4 }, 1.0);
          tl.to(q(".pz-l-01"), { yPercent: 0, duration: 0.4 }, 1.3);
          tl.to(q(".pz-stats"), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.8);
          tl.to({}, { duration: 0.25 });
        } else {
          // mobile: one once-through reveal, top-down, on natural scroll
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
              once: true,
            },
          });
          tl.to(q(".pz-fade"), { autoAlpha: 1, duration: 0.4 }, 0);
          tl.to(q(".pz-l-pool"), { yPercent: 0, duration: 0.7 }, 0.1);
          tl.fromTo(
            q(".pz-reel"),
            { yPercent: 0 },
            { yPercent: -90, duration: 1.2, stagger: 0.08, ease: "power2.out" },
            0.15
          );
          tl.to(
            q(".pz-rule"),
            { scaleX: 1, duration: 0.7, stagger: 0.08, ease: "power2.inOut" },
            0.3
          );
          tl.to(
            q(".pz-l-01, .pz-l-02, .pz-l-03"),
            { yPercent: 0, duration: 0.55, stagger: 0.14 },
            0.45
          );
          tl.to(q(".pz-stats"), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.9);
        }
      }
    );
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="prizes"
      data-lens="prizes"
      className="relative flex w-full items-center bg-[#050505] py-20 [min-height:100svh]"
    >
      <div className="container mx-auto w-full px-5 md:px-10">
        {/* header: eyebrow + the pool figure as the finale of the reveal */}
        <div className="mb-[clamp(2rem,5vh,3.5rem)]">
          <div className="pz-fade mb-[1.4rem]">
            <span className="eyebrow">what&apos;s at stake</span>
          </div>
          <Mask lineClassName="pz-l-pool">
            <h2 className="font-display text-[clamp(2.9rem,9vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-lime [font-variant-numeric:tabular-nums]">
              <span className={`${slotClass} leading-none`}>₹</span>
              {POOL.split("").map((ch, i) =>
                ch === "," ? (
                  <span key={i} className={`${slotClass} leading-none`}>
                    ,
                  </span>
                ) : (
                  <Reel key={i} digit={ch} />
                )
              )}
            </h2>
          </Mask>
          <div className="pz-fade mt-4">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-white/55">
              total prize pool
            </span>
          </div>
        </div>

        {/* prize ladder — reveals bottom row first */}
        <div className="mb-[clamp(1.8rem,4vh,3rem)]">
          {ladder.map((p) => (
            <div key={p.rank}>
              <div className="pz-rule h-px bg-white/10" />
              <Mask lineClassName={`pz-l-${p.rank}`}>
                <div
                  className={`flex items-baseline gap-[clamp(0.9rem,3vw,1.6rem)] ${p.top ? "py-[1.35rem]" : "py-[1.05rem]"}`}
                >
                  <span className={`font-mono text-[0.72rem] uppercase tracking-[0.22em] ${p.top ? "text-lime" : "text-white/40"}`}>
                    {p.rank}
                  </span>
                  <span
                    className={`font-display font-extrabold uppercase tracking-[0.01em] ${
                      p.top ? "text-[clamp(1.25rem,3vw,2rem)] text-white" : "text-[clamp(1rem,2.2vw,1.5rem)] text-white/80"
                    }`}
                  >
                    {p.label}
                  </span>
                  <span
                    className={`ml-auto font-display font-extrabold [font-variant-numeric:tabular-nums] ${
                      p.top ? "text-[clamp(1.6rem,4.2vw,2.9rem)] text-lime" : "text-[clamp(1.15rem,2.8vw,1.9rem)] text-white/75"
                    }`}
                  >
                    {p.amount}
                  </span>
                </div>
              </Mask>
            </div>
          ))}
          <div className="pz-rule h-px bg-white/10" />
        </div>

        {/* 30 = 24 + 6 stat strip */}
        <div className="pz-stats">
          <div className="flex flex-wrap items-baseline gap-x-[1.4rem] gap-y-[0.9rem] font-mono text-[0.72rem] uppercase tracking-[0.22em] text-white/55">
            {stats.map(([n, label], i) => (
              <span key={label} className="inline-flex items-baseline gap-[0.55rem]">
                {i > 0 && <span className="text-white/25">·</span>}
                <span className="text-[0.95rem] text-lime">{n}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Prizes;
