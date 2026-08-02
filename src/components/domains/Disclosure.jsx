import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { Plus } from "lucide-react";

// Collapsible reference block used at the foot of a domain brief. The heavy
// lists (opportunity areas, scope, success measures) stay on the page but
// out of the first read.
const Disclosure = ({ label, meta, children }) => {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="border-t border-white/[0.07]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-center justify-between gap-6 bg-transparent py-6 text-left outline-none focus-visible:ring-1 focus-visible:ring-lime/60"
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
          aria-hidden="true"
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-[color,border-color,background,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            open
              ? "rotate-45 border-lime/50 bg-lime/[0.08] text-lime"
              : "border-white/15 text-white/35 group-hover:border-white/30 group-hover:text-white/60"
          }`}
        >
          <Plus size={14} strokeWidth={2} />
        </span>
      </button>

      <div id={id} ref={bodyRef} role="region" className="h-0 overflow-hidden opacity-0">
        <div className="pb-8">{children}</div>
      </div>
    </div>
  );
};

export default Disclosure;
