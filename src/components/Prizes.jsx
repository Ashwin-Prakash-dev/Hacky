import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LIME = "#C8FF00";

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
// `line` spreads extra props (class hooks) onto the moving inner div.
const Mask = ({ children, style, line = {} }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div {...line}>{children}</div>
  </div>
);

const mono = {
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.22em",
};

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

        if (ctx.conditions.desktop) {
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=230%",
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
            },
          });
          // the empty board draws itself: hairlines sweep open
          tl.to(
            q(".pz-rule"),
            { scaleX: 1, duration: 0.8, stagger: 0.1, ease: "power2.inOut" },
            0.2
          );
          // suspense order: third, second, then first place
          tl.to(q(".pz-l-03"), { yPercent: 0, duration: 0.6 }, 0.9);
          tl.to(q(".pz-l-02"), { yPercent: 0, duration: 0.6 }, 1.7);
          tl.to(q(".pz-l-01"), { yPercent: 0, duration: 0.6 }, 2.5);
          // finale: the pool figure stamps in over the full board
          tl.to(q(".pz-l-pool"), { yPercent: 0, duration: 0.7 }, 3.2);
          tl.to(q(".pz-fade"), { autoAlpha: 1, duration: 0.5 }, 3.4);
          tl.to(q(".pz-stats"), { autoAlpha: 1, y: 0, duration: 0.5 }, 3.6);
          // hold the finished board before the pin releases
          tl.to({}, { duration: 0.7 });
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
      style={{
        background: "#050505",
        width: "100%",
        minHeight: "100svh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "5rem 0",
      }}
    >
      <div className="container mx-auto px-5 md:px-10" style={{ width: "100%" }}>
        {/* header: eyebrow + the pool figure as the finale of the reveal */}
        <div style={{ marginBottom: "clamp(2rem, 5vh, 3.5rem)" }}>
          <div className="pz-fade" style={{ marginBottom: "1.4rem" }}>
            <span className="eyebrow">what&apos;s at stake</span>
          </div>
          <Mask line={{ className: "pz-l-pool" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(2.9rem, 9vw, 7rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: LIME,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ₹2,00,000
            </h2>
          </Mask>
          <div className="pz-fade" style={{ marginTop: "1rem" }}>
            <span style={{ ...mono, fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>
              total prize pool
            </span>
          </div>
        </div>

        {/* prize ladder — reveals bottom row first */}
        <div style={{ marginBottom: "clamp(1.8rem, 4vh, 3rem)" }}>
          {ladder.map((p) => (
            <div key={p.rank}>
              <div
                className="pz-rule"
                style={{ height: "1px", background: "rgba(255,255,255,0.1)" }}
              />
              <Mask line={{ className: `pz-l-${p.rank}` }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "clamp(0.9rem, 3vw, 1.6rem)",
                    padding: p.top ? "1.35rem 0" : "1.05rem 0",
                  }}
                >
                  <span
                    style={{
                      ...mono,
                      fontSize: "0.72rem",
                      color: p.top ? LIME : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {p.rank}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.01em",
                      fontSize: p.top
                        ? "clamp(1.25rem, 3vw, 2rem)"
                        : "clamp(1rem, 2.2vw, 1.5rem)",
                      color: p.top ? "#fff" : "rgba(255,255,255,0.8)",
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: p.top
                        ? "clamp(1.6rem, 4.2vw, 2.9rem)"
                        : "clamp(1.15rem, 2.8vw, 1.9rem)",
                      color: p.top ? LIME : "rgba(255,255,255,0.75)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p.amount}
                  </span>
                </div>
              </Mask>
            </div>
          ))}
          <div
            className="pz-rule"
            style={{ height: "1px", background: "rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* 30 = 24 + 6 stat strip */}
        <div className="pz-stats">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: "0.9rem 1.4rem",
              ...mono,
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {stats.map(([n, label], i) => (
              <span
                key={label}
                style={{ display: "inline-flex", gap: "0.55rem", alignItems: "baseline" }}
              >
                {i > 0 && <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>}
                <span style={{ color: LIME, fontSize: "0.95rem" }}>{n}</span>
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
