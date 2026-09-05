import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Undo2 } from "lucide-react";

// What the launch console dissolves into. It inherits the hero's own three
// bands — facts up top, one big thing in the middle, controls on the
// baseline — so it reads as the hero's second state rather than a second
// screen. Counts down to doors, then keeps counting upward once they open,
// for as long as the hall is running.

const pad = (n) => String(Math.floor(n)).padStart(2, "0");

const clockParts = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [pad(s / 3600), pad((s % 3600) / 60), pad(s % 60)];
};

const wallClock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// One glyph of the readout. Each cell rolls on its own change, so seconds
// tick without disturbing the hours. The cell is a fixed em box: the display
// face has no tabular figures, and a 1 that measures narrower than an 8
// would shuffle the whole row every second.
const Digit = ({ value, reduced }) => {
  const ref = useRef(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return undefined;
    prev.current = value;
    if (reduced || !ref.current) return undefined;
    const tween = gsap.fromTo(
      ref.current,
      { yPercent: -26, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.34, ease: "power3.out" },
    );
    // the seconds cell rolls sixty times a minute; a killed tween is one
    // that cannot outlive the digit it was moving
    return () => tween.kill();
  }, [value, reduced]);

  return (
    <span className="inline-flex w-[0.66em] justify-center">
      <span ref={ref} className="inline-block">
        {value}
      </span>
    </span>
  );
};

// Digits over their own unit name — which is what lets the colons go.
const Unit = ({ value, label, reduced }) => (
  <div className="flex flex-col items-center">
    <span className="flex">
      {value.split("").map((ch, i) => (
        <Digit key={i} value={ch} reduced={reduced} />
      ))}
    </span>
    <span className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-white/35 sm:mt-5 sm:text-[0.62rem]">
      {label}
    </span>
  </div>
);

const LaunchClock = ({ target, doorsLabel, onAbort, reduced }) => {
  const rootRef = useRef(null);
  const [now, setNow] = useState(() => Date.now());

  // A quarter-second tick keeps the second boundary honest without
  // re-rendering the page every frame.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      if (reduced) return;
      // the bands surface out of the dissolve rather than cutting in; short,
      // because the transition that got here is already over a second long
      gsap.from("[data-clock-band]", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.07,
      });
    },
    { scope: rootRef },
  );

  const remaining = target - now;
  const live = remaining <= 0;
  const [hours, minutes, seconds] = clockParts(live ? -remaining : remaining);

  // role=timer, not aria-live: a readout that announced itself every second
  // would make the page unusable with a screen reader. The digits carry no
  // text of their own — the spoken form sits beside them, read on demand.
  const spoken = `${Number(hours)} hours ${Number(minutes)} minutes ${Number(
    seconds,
  )} seconds ${
    live ? `since doors opened at ${doorsLabel}` : `until doors open at ${doorsLabel}`
  }`;

  return (
    <div
      ref={rootRef}
      data-launch-clock
      className="absolute left-0 top-0 z-[22] flex size-full flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28"
    >
      <div data-clock-band className="flex items-start justify-between gap-6">
        <Link
          to="/"
          className="font-display text-lg font-black tracking-[-0.02em] text-white outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-[#050505] hover:opacity-70"
        >
          Startathon<span className="text-lime">.</span>
        </Link>
        <div className="flex flex-col items-end gap-2">
          <span className="eyebrow">{live ? "Doors open" : "Counting down"}</span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
            Local {wallClock(new Date(now))}
          </span>
        </div>
      </div>

      <div data-clock-band className="flex flex-col items-center">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-lime/80 sm:text-[0.68rem]">
          {live ? `T+ since doors at ${doorsLabel}` : `T\u2212 to doors at ${doorsLabel}`}
        </p>

        <div className="mt-6 sm:mt-8" role="timer" aria-label={spoken}>
          <div
            aria-hidden="true"
            className={`flex items-baseline justify-center gap-[0.28em] font-display text-[clamp(3rem,14vw,9.5rem)] font-black leading-[0.85] tracking-[-0.03em] ${
              live || remaining <= 60000 ? "text-lime" : "text-white"
            }`}
          >
            <Unit value={hours} label="Hours" reduced={reduced} />
            <Unit value={minutes} label="Minutes" reduced={reduced} />
            <Unit value={seconds} label="Seconds" reduced={reduced} />
          </div>
          <span className="sr-only">{spoken}</span>
        </div>
      </div>

      <div
        data-clock-band
        className="flex w-full flex-wrap items-end justify-between gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-white">
            Sep 5&ndash;6, 2026
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/55">
            SCTCE, Thiruvananthapuram
          </span>
        </div>

        <button type="button" onClick={onAbort} className="cta-pill cta-pill--ghost">
          <span>{live ? "Reset clock" : "Abort"}</span>
          <span className="cta-pill-icon" aria-hidden="true">
            <Undo2 size={15} strokeWidth={2.25} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default LaunchClock;
