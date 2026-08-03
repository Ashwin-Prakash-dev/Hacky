import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import AmpTitle from "./AmpTitle";

// One domain tile in the picker field. Owns its ambient drift (paused on
// hover, frozen while a page transition runs) and hands its panel element
// up on select so the Flip morph can start from the card's exact box.
// The hook + explore line is revealed on hover/focus on fine pointers and
// always visible on touch devices, with its space reserved so nothing
// shifts layout. It stays in the accessibility tree throughout, so the
// card link's name is the full title + hook rather than the title alone.
const DomainCard = ({ domain, className, floatActive, motionOK, onSelect, wrapperRef, panelRef }) => {
  const floatEl = useRef(null);
  const localPanel = useRef(null);
  const driftTween = useRef(null);
  const hovered = useRef(false);
  const Icon = domain.icon;

  useEffect(() => {
    const el = floatEl.current;
    if (!floatActive || !motionOK || !el) return undefined;

    const wander = () => {
      driftTween.current = gsap.to(el, {
        y: gsap.utils.random(-9, 9),
        rotation: gsap.utils.random(-0.7, 0.7),
        duration: gsap.utils.random(3.5, 5.5),
        ease: "sine.inOut",
        onComplete: wander,
      });
    };
    const onEnter = () => {
      hovered.current = true;
      driftTween.current?.kill();
      driftTween.current = gsap.to(el, { y: 0, rotation: 0, duration: 0.55, ease: "power2.out" });
    };
    const onLeave = () => {
      hovered.current = false;
      wander();
    };

    if (!hovered.current) wander();
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      driftTween.current?.kill();
    };
  }, [floatActive, motionOK]);

  // Only hijack a plain left click — modified clicks stay real navigations so
  // "open in new tab" and friends keep working on the card link.
  const handleClick = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSelect(domain, localPanel.current);
  };

  return (
    <li className={className}>
      <div
        ref={(el) => {
          floatEl.current = el;
          wrapperRef?.(el);
        }}
        className="will-change-transform"
      >
        <Link
          ref={(el) => {
            localPanel.current = el;
            panelRef?.(el);
          }}
          to={`/domains/${domain.slug}`}
          onClick={handleClick}
          data-flip-id={`domain-${domain.slug}`}
          className="group relative flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0b] p-7 no-underline outline-none transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:border-lime/50 focus-visible:ring-2 focus-visible:ring-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] hover:-translate-y-2 hover:border-lime/25 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55)] md:min-h-[21rem] md:p-9"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-lime/[0.05] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

          <div className="relative flex items-start justify-between">
            <span className="flex size-12 items-center justify-center rounded-full border border-lime/20 bg-lime/[0.06] text-lime">
              <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <ArrowUpRight
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="text-white/40 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
            />
          </div>

          <div className="relative">
            <h2 className="special-font max-w-[13ch] text-balance font-display text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.05] tracking-[-0.02em] text-white">
              <AmpTitle title={domain.title} />
            </h2>
            <div className="mt-4 translate-y-3 opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
              <p className="max-w-[34ch] font-general text-[0.95rem] leading-[1.75] text-white/60">
                {domain.hook}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime">
                Explore the brief
                <ArrowUpRight size={12} strokeWidth={2.25} aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </li>
  );
};

export default DomainCard;
