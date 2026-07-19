import { useRef, useState, useEffect } from "react";
import "./TerminalBridge.css";

/* ── Boot sequence ──────────────────────────────────────────────────────── */
const LINES = [
  { id: 0, prompt: ">", text: "what's in it for me?",       type: "question", delay: 0    },
  { id: 1, prompt: "$", text: "initializing reward systems", type: "process",  delay: 440  },
  { id: 2, prompt: "$", text: "loading prize pool",          type: "process",  delay: 820  },
  { id: 3, prompt: "$", text: "compiling event details",     type: "process",  delay: 1160 },
  { id: 4, prompt: "$", text: "syncing mentors",             type: "process",  delay: 1470 },
  { id: 5, prompt: "$", text: "validating builder access",   type: "process",  delay: 1750 },
  { id: 6, prompt: "$", text: "preparing experience",        type: "process",  delay: 2000 },
  { id: 7, prompt: "✓", text: "ACCESS GRANTED",              type: "granted",  delay: 2520 },
];
const DONE_LAG = 340;

/* ── Interactive command registry ───────────────────────────────────────── */
const COMMANDS = {
  help: {
    output: [
      "Available commands:",
      "  prizes    ->  prize pool breakdown",
      "  mentors   ->  who's guiding you",
      "  apply     ->  registration info",
      "  clear     ->  clear terminal",
    ],
  },
  prizes: {
    output: [
      "Prize Pool: Rs.2L+  (*subject to changes)",
      "",
      "  1st Place  ->  Rs.1L+   (Grand Prize)",
      "  2nd Place  ->  TBA",
      "  3rd Place  ->  TBA",
    ],
  },
  mentors: {
    output: [
      "Mentor cohort includes engineers from:",
      "",
      "  -> Startups and VC-backed companies",
      "  -> Open-source core contributors",
      "  -> SCTCE alumni network",
      "",
      "Full list revealed at launch.",
    ],
  },
  apply: {
    output: [
      "Applications opening soon.",
      "",
      "  Eligibility: any college student",
      "  Team size:   3 to 4 members",
      "  Format:      in-person, Kerala",
      "",
      "Hit 'Register Interest' above to get notified.",
    ],
  },
  clear: { output: null }, // handled specially
};

const UNKNOWN = (cmd) => [`command not found: ${cmd}`, "type 'help' for available commands."];

const MONO_TIGHT = "font-mono text-[clamp(0.72rem,1.4vw,0.88rem)]";

/* ── Component ──────────────────────────────────────────────────────────── */
const TerminalBridge = () => {
  const sectionRef  = useRef(null);
  const inputRef    = useRef(null);
  const bodyRef     = useRef(null);
  const startedRef  = useRef(false);
  const timersRef   = useRef([]);

  const [visible,     setVisible    ] = useState(new Set());
  const [done,        setDone       ] = useState(new Set());
  const [interactive, setInteractive] = useState(false);
  const [inputVal,    setInputVal   ] = useState("");
  const [history,     setHistory    ] = useState([]); // {cmd, output}[]
  const [cmdHistory,  setCmdHistory ] = useState([]); // up-arrow history
  const [histIdx,     setHistIdx    ] = useState(-1);

  const startSequence = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    LINES.forEach((line) => {
      const t1 = setTimeout(() => {
        setVisible((prev) => new Set([...prev, line.id]));
        if (line.type === "process") {
          const t2 = setTimeout(
            () => setDone((prev) => new Set([...prev, line.id])),
            DONE_LAG
          );
          timersRef.current.push(t2);
        }
        if (line.type === "granted") {
          const t3 = setTimeout(() => setInteractive(true), 600);
          timersRef.current.push(t3);
        }
      }, line.delay);
      timersRef.current.push(t1);
    });
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      startedRef.current = true;
      setVisible(new Set(LINES.map((l) => l.id)));
      setDone(new Set(LINES.filter((l) => l.type === "process").map((l) => l.id)));
      setInteractive(true);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll body when history grows
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, interactive]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startSequence(); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") {
      setHistory([]);
      setCmdHistory((prev) => [raw, ...prev]);
      setHistIdx(-1);
      return;
    }
    const entry = COMMANDS[cmd];
    const output = entry ? entry.output : UNKNOWN(cmd);
    setHistory((prev) => [...prev, { cmd: raw, output }]);
    setCmdHistory((prev) => [raw, ...prev]);
    setHistIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInputVal(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInputVal(next === -1 ? "" : cmdHistory[next] ?? "");
    }
  };

  const lastVisibleId = visible.size > 0 ? Math.max(...Array.from(visible)) : -1;

  return (
    <section
      ref={sectionRef}
      data-lens="terminal"
      className="relative overflow-hidden bg-[#050505] px-[clamp(1rem,5vw,3rem)] py-[clamp(4.5rem,9vw,7.5rem)]"
    >
      {/* Scanlines */}
      <div className="tb-scanlines" />

      {/* Ambient lime glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/5 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.22),transparent)]" />

      {/* ── Terminal Panel ─────────────────────────────────────── */}
      <div
        className="relative mx-auto max-w-[720px] rounded-2xl border-[0.5px] border-lime/[0.12] bg-lime/[0.018] shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_24px_80px_rgba(0,0,0,0.5),inset_0_0_60px_rgba(200,255,0,0.012)] backdrop-blur-[2px]"
        onClick={() => interactive && inputRef.current?.focus()}
      >
        {/* ── Header bar ── */}
        <div className="flex items-center gap-2 rounded-t-2xl border-b-[0.5px] border-lime/10 bg-lime/[0.025] px-5 py-[0.7rem]">
          {["rgba(255,255,255,0.12)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.05)"].map((c, i) => (
            <span key={i} className="inline-block size-2 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-auto font-mono text-[0.78rem] tracking-[0.14em] text-lime/75">
            Startathon.sys
          </span>
          <span className="font-mono text-[0.72rem] tracking-widest text-white/55">
            v2026.1.0
          </span>
        </div>

        {/* ── Terminal body ── */}
        <div
          ref={bodyRef}
          className="flex max-h-[480px] min-h-[320px] flex-col gap-0 overflow-y-auto px-[clamp(1.2rem,3.5vw,2.2rem)] py-[clamp(1.5rem,4vw,2.5rem)] [scrollbar-width:none]"
        >
          {/* Boot sequence lines */}
          {LINES.map((line) => {
            const isVisible  = visible.has(line.id);
            const isDone     = done.has(line.id);
            const isLastLine = line.id === lastVisibleId;
            const showCursor = isLastLine && line.type !== "granted" && !interactive;

            const marginBottomClass =
              line.type === "question"
                ? "mb-[clamp(0.9rem,2vw,1.4rem)]"
                : line.type === "process" && line.id === 6
                ? "mb-[clamp(1.2rem,2.5vw,1.8rem)]"
                : line.type === "granted"
                ? "mb-0"
                : "mb-[clamp(0.3rem,0.8vw,0.55rem)]";

            return (
              <div
                key={line.id}
                className={`flex items-baseline gap-0 transition-[opacity,transform] duration-300 ${marginBottomClass} ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-[5px] opacity-0"
                }`}
              >
                {/* Separator before ACCESS GRANTED */}
                {line.type === "granted" && isVisible && (
                  <div className="pointer-events-none absolute inset-x-[clamp(1.2rem,3.5vw,2.2rem)] h-[0.5px] translate-y-[calc(clamp(0.6rem,1.2vw,0.9rem)*-1)] bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.18),transparent)]" />
                )}

                {/* Prompt */}
                <span
                  className={`shrink-0 font-mono leading-normal ${
                    line.type === "granted"
                      ? "min-w-8 text-[clamp(1rem,2.2vw,1.4rem)] text-lime"
                      : line.type === "question"
                      ? "min-w-[1.6rem] text-[clamp(0.72rem,1.4vw,0.88rem)] text-lime/80"
                      : "min-w-[1.6rem] text-[clamp(0.72rem,1.4vw,0.88rem)] text-lime/40"
                  }`}
                >
                  {line.prompt}
                </span>

                {/* Text */}
                {line.type === "process" ? (
                  <span className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="whitespace-nowrap font-mono text-[clamp(0.82rem,1.4vw,0.95rem)] tracking-[0.04em] text-white/80">
                      {line.text}
                    </span>
                    <span className="mb-[0.18em] min-w-4 flex-1 border-b border-dotted border-lime/10" />
                    <span className="shrink-0">
                      {isDone ? (
                        <span className="font-mono text-[clamp(0.75rem,1.2vw,0.85rem)] uppercase tracking-widest text-lime">
                          DONE
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <span className="tb-dot" /><span className="tb-dot" /><span className="tb-dot" />
                        </span>
                      )}
                    </span>
                    {showCursor && <span className="tb-cursor" />}
                  </span>
                ) : line.type === "question" ? (
                  <span className="font-mono text-[clamp(0.82rem,1.8vw,1.08rem)] leading-normal tracking-wider text-white/[0.88]">
                    {line.text}
                    {showCursor && <span className="tb-cursor" />}
                  </span>
                ) : (
                  <span
                    className={`font-mono text-[clamp(1.05rem,2.4vw,1.5rem)] font-bold uppercase leading-[1.4] tracking-[0.18em] text-lime ${isVisible ? "tb-granted-glow" : ""}`}
                  >
                    {line.text}
                  </span>
                )}
              </div>
            );
          })}

          {/* ── Interactive history ── */}
          {interactive && history.map((entry, i) => (
            <div key={i} className="mt-[clamp(0.7rem,1.5vw,1rem)]">
              {/* Command echo */}
              <div className="flex items-baseline gap-0">
                <span className={`min-w-[1.6rem] shrink-0 ${MONO_TIGHT} text-lime/50`}>$</span>
                <span className={`${MONO_TIGHT} tracking-[0.04em] text-white/70`}>{entry.cmd}</span>
              </div>
              {/* Output lines */}
              {entry.output && entry.output.map((line, j) => (
                <div key={j} className="mt-[0.2rem] flex">
                  <span className="min-w-[1.6rem] shrink-0" />
                  <span className={`whitespace-pre font-mono text-[clamp(0.78rem,1.3vw,0.9rem)] tracking-[0.03em] ${line === "" ? "text-transparent" : "text-white/80"}`}>
                    {line || " "}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* ── Input prompt ── */}
          {interactive && (
            <div className="mt-[clamp(0.9rem,2vw,1.3rem)] flex items-center gap-0">
              <span className={`min-w-[1.6rem] shrink-0 ${MONO_TIGHT} text-lime/50`}>$</span>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={`flex-1 border-none bg-transparent p-0 caret-lime outline-none ${MONO_TIGHT} leading-normal tracking-[0.04em] text-white/[0.88]`}
                placeholder="type 'help' for commands..."
              />
            </div>
          )}
        </div>

        {/* ── Footer bar ── */}
        <div className="flex items-center justify-between rounded-b-2xl border-t-[0.5px] border-lime/[0.08] bg-lime/[0.015] px-5 py-[0.6rem]">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/55">
            BUILDER ACCESS TERMINAL
          </span>
          <span className="font-mono text-[0.72rem] tracking-[0.12em] text-lime/60">
            Startathon 2026 // Kerala
          </span>
        </div>
      </div>

      {/* Bottom transition — scan-line sweep into Timeline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-[linear-gradient(to_bottom,transparent_0%,rgba(200,255,0,0.04)_60%,rgba(200,255,0,0.01)_100%)]" />
      {/* Hairline rule at the seam */}
      <div className="pointer-events-none absolute inset-x-[10%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.18)_30%,rgba(200,255,0,0.35)_50%,rgba(200,255,0,0.18)_70%,transparent)]" />
    </section>
  );
};

export default TerminalBridge;
