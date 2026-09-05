import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import LaunchHorizon from "../components/three/LaunchHorizon";
import { usePageMeta } from "../lib/seo";

// The launch console. One viewport, no scroll, one axis: the wordmark, the
// clock, and the people backing it. Arm it and it counts down to 10:30; past
// 10:30 it keeps counting, upward, for as long as the room is open.
//
// Entirely client-side and deliberately not persisted — a refresh puts the
// console back to standing by, which is the only way out of an armed clock.

const DOORS_HOUR = 11;
const DOORS_MINUTE = 25;

// The next 10:30 on the wall clock — today's if it has not passed,
// tomorrow's if it has.
const nextDoors = (from = new Date()) => {
  const t = new Date(from);
  t.setHours(DOORS_HOUR, DOORS_MINUTE, 0, 0);
  if (t <= from) t.setDate(t.getDate() + 1);
  return t;
};

const pad = (n) => String(Math.floor(n)).padStart(2, "0");

const clockParts = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [pad(s / 3600), pad((s % 3600) / 60), pad(s % 60)];
};

// The same three companies the landing page credits, reduced to their marks:
// on a launch screen the logo is the whole message.
const SPONSORS = [
  {
    name: "VoiceStack",
    href: "https://voicestack.com?utm_source=startathon",
    src: "/img/sponsors/voicestack.png",
    size: "h-7 sm:h-9",
  },
  {
    name: "CareStack",
    href: "https://carestack.com?utm_source=startathon",
    src: "/img/sponsors/carestack-white.png",
    size: "h-6 sm:h-8",
  },
  {
    name: "CareRevenue",
    href: "https://carerevenue.com?utm_source=startathon",
    src: "/img/sponsors/carerevenue-white.png",
    size: "h-6 sm:h-8",
  },
];

// One digit of the readout. Each cell rolls independently when its own glyph
// changes, so the seconds tick without disturbing the hours.
const Digit = ({ value, reduced }) => {
  const ref = useRef(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return undefined;
    prev.current = value;
    if (reduced || !ref.current) return undefined;
    const tween = gsap.fromTo(
      ref.current,
      { yPercent: -70, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.32, ease: "power3.out" },
    );
    // the seconds cell rolls once a second for hours; a killed tween is one
    // that cannot outlive the digit it was moving
    return () => tween.kill();
  }, [value, reduced]);

  return (
    <span className="inline-block overflow-hidden">
      <span ref={ref} className="inline-block">
        {value}
      </span>
    </span>
  );
};

const Readout = ({ text, reduced, tone }) => (
  <div
    className={`flex items-baseline justify-center font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-black leading-[0.82] tracking-[-0.045em] drop-shadow-[0_6px_60px_rgba(0,0,0,0.75)] ${tone}`}
  >
    {text.split("").map((ch, i) =>
      ch === ":" ? (
        <span key={i} className="px-[0.06em] text-white/25">
          :
        </span>
      ) : (
        <Digit key={i} value={ch} reduced={reduced} />
      ),
    )}
  </div>
);

const AdminPage = () => {
  usePageMeta({
    title: "Launch control",
    description:
      "The console that opens Startathon. Arm the clock and it counts down to doors at 10:30.",
    path: "/admin",
    noindex: true,
  });

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const [target, setTarget] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const rootRef = useRef(null);
  const armedRef = useRef(null);

  // What the canvas reads every frame. Mutated in place — never state.
  const driveRef = useRef({ charge: 0, urgency: 0, flash: 0 });

  const remaining = target === null ? null : target - now;
  const live = remaining !== null && remaining <= 0;
  const running = remaining !== null && remaining > 0;

  // A quarter-second tick keeps the final seconds honest without making the
  // page re-render on every frame.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Urgency: the last minute before doors, and a held hum once open.
  useEffect(() => {
    const d = driveRef.current;
    if (remaining === null) d.urgency = 0;
    else if (remaining <= 0) d.urgency = 0.42;
    else d.urgency = Math.max(0, 1 - remaining / 60000);
  }, [remaining]);

  const flash = useCallback(
    (strength) => {
      if (reduced) return;
      driveRef.current.flash = strength;
      // "auto", not true: charge and flash are tweened on the same object,
      // and a blanket overwrite would kill whichever started first.
      gsap.to(driveRef.current, {
        flash: 0,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [reduced],
  );

  const start = () => {
    setTarget(nextDoors().getTime());
    setNow(Date.now());
    flash(0.85);
    if (reduced) driveRef.current.charge = 1;
    else
      gsap.to(driveRef.current, {
        charge: 1,
        duration: 2.4,
        ease: "power2.out",
        overwrite: "auto",
      });
  };

  // One flash the instant the doors open, then the deck settles.
  const wasLive = useRef(false);
  useEffect(() => {
    if (live && !wasLive.current) flash(1);
    wasLive.current = live;
  }, [live, flash]);

  // The clock replaces the control in the same slot, so it rises into place
  // rather than appearing.
  useGSAP(
    () => {
      if (reduced || !armedRef.current) return;
      gsap.from(armedRef.current, {
        yPercent: 10,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: rootRef, dependencies: [target === null] },
  );

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-rise]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.15,
      });
    },
    { scope: rootRef },
  );

  const doorsLabel = `${pad(DOORS_HOUR)}:${pad(DOORS_MINUTE)}`;
  const parts = clockParts(live ? -remaining : (remaining ?? 0));
  const spoken = `${Number(parts[0])} hours ${Number(parts[1])} minutes ${Number(parts[2])} seconds ${
    live ? `since doors opened at ${doorsLabel}` : `until doors open at ${doorsLabel}`
  }`;

  return (
    <main
      ref={rootRef}
      className="relative flex min-h-dvh w-full flex-col items-center justify-between gap-12 overflow-x-clip bg-[#050505] px-5 py-12 text-center text-white sm:px-8 sm:py-16"
    >
      <LaunchHorizon
        driveRef={driveRef}
        staticMode={reduced}
        revision={target === null ? 0 : live ? 2 : 1}
      />

      {/* An empty first row so the centre stack sits between two rows and
          lands optically centred, rather than being pushed up by the sponsor
          row below it. */}
      <div aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10">
        <h1
          data-rise
          className="font-display text-[clamp(2.6rem,9vw,8rem)] font-black leading-[0.9] tracking-[-0.03em] drop-shadow-[0_6px_60px_rgba(0,0,0,0.75)]"
        >
          Startathon<span className="text-lime">.</span>
        </h1>

        {/* Armed, the readout uses role=timer rather than aria-live: a clock
            that announced itself every second would make the page unusable
            with a screen reader. The digits carry no text of their own — the
            spoken form, now the only place the 10:30 target is named at all,
            sits beside them and is read on demand. */}
        {target === null ? (
          <button
            data-rise
            type="button"
            onClick={start}
            className="bezel bezel--lime group inline-block outline-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-[#050505] active:scale-[0.99] hover:-translate-y-0.5"
          >
            <span className="block rounded-[1.125rem] bg-lime px-6 py-4 font-general text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_14px_44px_rgba(200,255,0,0.28)] sm:px-12 sm:py-5 sm:text-base">
              Launch countdown
            </span>
          </button>
        ) : (
          <div ref={armedRef} role="timer" aria-label={spoken}>
            <div aria-hidden="true">
              <Readout
                text={parts.join(":")}
                reduced={reduced}
                tone={
                  live || (running && remaining <= 60000)
                    ? "text-lime"
                    : "text-white"
                }
              />
            </div>
            <span className="sr-only">{spoken}</span>
          </div>
        )}
      </div>

      <div
        data-rise
        className="relative z-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14"
      >
        {SPONSORS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-50 outline-none transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-[#050505] hover:opacity-100"
          >
            <img
              src={s.src}
              alt={s.name}
              className={`w-auto object-contain ${s.size}`}
            />
          </a>
        ))}
      </div>
    </main>
  );
};

export default AdminPage;
