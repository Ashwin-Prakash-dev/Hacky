import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";

// Collapsible reference block used at the foot of a domain brief. The heavy
// lists stay on the page but out of the first read.
//
// Affordance: a down chevron plus a literal "Show" / "Hide" means the
// content opens right here. Anything that navigates away uses an up-right
// arrow instead, so the two are never confused.
//
// Pass `open` and `onToggle` to drive it from outside (the show-all
// control); leave both off and it manages its own state.
const Disclosure = ({ label, meta, children, open: openProp, onToggle }) => {
  const [ownOpen, setOwnOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : ownOpen;

  const bodyRef = useRef(null);
  const tween = useRef(null);
  const id = useId();

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    tween.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(body, { height: open ? "auto" : 0, opacity: open ? 1 : 0 });
      return undefined;
    }

    tween.current = open
      ? gsap.fromTo(
          body,
          { height: 0, opacity: 0 },
          {
            height: body.scrollHeight,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            onComplete: () => gsap.set(body, { height: "auto" }),
          },
        )
      : gsap.to(body, { height: 0, opacity: 0, duration: 0.3, ease: "power3.in" });

    return () => tween.current?.kill();
  }, [open]);

  const toggle = () => (controlled ? onToggle?.() : setOwnOpen((v) => !v));

  return (
    <div className="border-t border-white/[0.07]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-center justify-between gap-6 rounded-lg bg-transparent px-3 py-5 text-left outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-lime/60 hover:bg-white/[0.03]"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`font-general text-[0.98rem] font-bold tracking-[-0.01em] transition-colors duration-200 ${
              open ? "text-white" : "text-white/80 group-hover:text-white"
            }`}
          >
            {label}
          </span>
          {meta && (
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/35">
              {meta}
            </span>
          )}
        </span>

        <span
          className={`flex shrink-0 items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] transition-colors duration-200 ${
            open ? "text-lime" : "text-white/50 group-hover:text-white/80"
          }`}
        >
          {open ? "Hide" : "Show"}
          <ChevronDown
            size={15}
            strokeWidth={2.25}
            aria-hidden="true"
            className={`transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div id={id} ref={bodyRef} role="region" className="h-0 overflow-hidden opacity-0">
        <div className="px-3 pb-8">{children}</div>
      </div>
    </div>
  );
};

export default Disclosure;
