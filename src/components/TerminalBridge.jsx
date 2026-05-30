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
      "  prizes    — prize pool breakdown",
      "  mentors   — who's guiding you",
      "  apply     — registration info",
      "  clear     — clear terminal",
    ],
  },
  prizes: {
    output: [
      "Prize Pool: ₹1,00,000",
      "",
      "  1st Place  ──  ₹50,000",
      "  2nd Place  ──  ₹30,000",
      "  3rd Place  ──  ₹20,000",
    ],
  },
  mentors: {
    output: [
      "Mentor cohort includes engineers from:",
      "",
      "  → Startups & VC-backed companies",
      "  → Open-source core contributors",
      "  → SCTCE alumni network",
      "",
      "Full list revealed at launch.",
    ],
  },
  apply: {
    output: [
      "Applications open June 2026.",
      "",
      "  Eligibility: any college student",
      "  Team size:   2 – 4 members",
      "  Format:      in-person, Kerala",
      "",
      "Hit 'Register Interest' above to get notified.",
    ],
  },
  clear: { output: null }, // handled specially
};

const UNKNOWN = (cmd) => [`command not found: ${cmd}`, "type 'help' for available commands."];

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

  useEffect(() => {
    if (interactive) inputRef.current?.focus();
  }, [interactive]);

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
      style={{
        position: "relative",
        backgroundColor: "#000",
        overflow: "hidden",
        padding: "clamp(4.5rem, 9vw, 7.5rem) clamp(1rem, 5vw, 3rem)",
      }}
    >
      {/* Scanlines */}
      <div className="tb-scanlines" />

      {/* Ambient lime glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "60%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.22), transparent)",
        pointerEvents: "none",
      }} />

      {/* ── Terminal Panel ─────────────────────────────────────── */}
      <div
        style={{
          position: "relative", zIndex: 1,
          maxWidth: "720px", margin: "0 auto",
          border: "0.5px solid rgba(200,255,0,0.12)",
          borderRadius: "6px",
          background: "rgba(200,255,0,0.018)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.6), 0 24px 80px rgba(0,0,0,0.5), inset 0 0 60px rgba(200,255,0,0.012)",
          backdropFilter: "blur(2px)",
        }}
        onClick={() => interactive && inputRef.current?.focus()}
      >
        {/* ── Header bar ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "0.7rem 1.2rem",
          borderBottom: "0.5px solid rgba(200,255,0,0.1)",
          background: "rgba(200,255,0,0.025)",
          borderRadius: "6px 6px 0 0",
        }}>
          {["rgba(255,255,255,0.12)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.05)"].map((c, i) => (
            <span key={i} style={{
              display: "inline-block", width: "8px", height: "8px",
              borderRadius: "50%", background: c,
            }} />
          ))}
          <span style={{
            marginLeft: "auto", fontFamily: "monospace",
            fontSize: "0.62rem", letterSpacing: "0.18em",
            color: "rgba(200,255,0,0.45)", textTransform: "uppercase",
          }}>
            STARTATHON.SYS
          </span>
          <span style={{
            fontFamily: "monospace", fontSize: "0.56rem",
            letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)",
          }}>
            v2026.1.0
          </span>
        </div>

        {/* ── Terminal body ── */}
        <div
          ref={bodyRef}
          style={{
            padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1.2rem, 3.5vw, 2.2rem)",
            display: "flex", flexDirection: "column", gap: "0",
            minHeight: "320px",
            maxHeight: "480px",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          {/* Boot sequence lines */}
          {LINES.map((line) => {
            const isVisible  = visible.has(line.id);
            const isDone     = done.has(line.id);
            const isLastLine = line.id === lastVisibleId;
            const showCursor = isLastLine && line.type !== "granted" && !interactive;

            return (
              <div
                key={line.id}
                style={{
                  display: "flex", alignItems: "baseline", gap: "0",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(5px)",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  marginBottom:
                    line.type === "question"
                      ? "clamp(0.9rem, 2vw, 1.4rem)"
                      : line.type === "process" && line.id === 6
                      ? "clamp(1.2rem, 2.5vw, 1.8rem)"
                      : line.type === "granted"
                      ? 0
                      : "clamp(0.3rem, 0.8vw, 0.55rem)",
                }}
              >
                {/* Separator before ACCESS GRANTED */}
                {line.type === "granted" && isVisible && (
                  <div style={{
                    position: "absolute",
                    left: "clamp(1.2rem, 3.5vw, 2.2rem)",
                    right: "clamp(1.2rem, 3.5vw, 2.2rem)",
                    height: "0.5px",
                    background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.18), transparent)",
                    transform: "translateY(-clamp(0.6rem, 1.2vw, 0.9rem))",
                    pointerEvents: "none",
                  }} />
                )}

                {/* Prompt */}
                <span style={{
                  fontFamily: "monospace",
                  fontSize: line.type === "granted" ? "clamp(1rem, 2.2vw, 1.4rem)" : "clamp(0.72rem, 1.4vw, 0.88rem)",
                  color:
                    line.type === "granted" ? "#C8FF00"
                    : line.type === "question" ? "rgba(200,255,0,0.8)"
                    : "rgba(200,255,0,0.4)",
                  minWidth: line.type === "granted" ? "2rem" : "1.6rem",
                  flexShrink: 0, lineHeight: 1.5,
                }}>
                  {line.prompt}
                </span>

                {/* Text */}
                {line.type === "process" ? (
                  <span style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "monospace", fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                      {line.text}
                    </span>
                    <span style={{ flex: 1, borderBottom: "1px dotted rgba(200,255,0,0.1)", marginBottom: "0.18em", minWidth: "1rem" }} />
                    <span style={{ flexShrink: 0 }}>
                      {isDone ? (
                        <span style={{ fontFamily: "monospace", fontSize: "clamp(0.62rem, 1.2vw, 0.76rem)", letterSpacing: "0.12em", color: "#C8FF00", textTransform: "uppercase" }}>
                          DONE
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <span className="tb-dot" /><span className="tb-dot" /><span className="tb-dot" />
                        </span>
                      )}
                    </span>
                    {showCursor && <span className="tb-cursor" />}
                  </span>
                ) : line.type === "question" ? (
                  <span style={{ fontFamily: "monospace", fontSize: "clamp(0.82rem, 1.8vw, 1.08rem)", color: "rgba(255,255,255,0.88)", letterSpacing: "0.05em", lineHeight: 1.5 }}>
                    {line.text}
                    {showCursor && <span className="tb-cursor" />}
                  </span>
                ) : (
                  <span
                    className={isVisible ? "tb-granted-glow" : ""}
                    style={{ fontFamily: "monospace", fontSize: "clamp(1.05rem, 2.4vw, 1.5rem)", fontWeight: 700, letterSpacing: "0.18em", color: "#C8FF00", textTransform: "uppercase", lineHeight: 1.4 }}
                  >
                    {line.text}
                  </span>
                )}
              </div>
            );
          })}

          {/* ── Interactive history ── */}
          {interactive && history.map((entry, i) => (
            <div key={i} style={{ marginTop: "clamp(0.7rem, 1.5vw, 1rem)" }}>
              {/* Command echo */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0" }}>
                <span style={{ fontFamily: "monospace", fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)", color: "rgba(200,255,0,0.5)", minWidth: "1.6rem", flexShrink: 0 }}>$</span>
                <span style={{ fontFamily: "monospace", fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)", color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>{entry.cmd}</span>
              </div>
              {/* Output lines */}
              {entry.output && entry.output.map((line, j) => (
                <div key={j} style={{ display: "flex", marginTop: "0.2rem" }}>
                  <span style={{ minWidth: "1.6rem", flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: "clamp(0.68rem, 1.3vw, 0.84rem)", color: line === "" ? "transparent" : "rgba(255,255,255,0.48)", letterSpacing: "0.03em", whiteSpace: "pre" }}>
                    {line || " "}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* ── Input prompt ── */}
          {interactive && (
            <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "clamp(0.9rem, 2vw, 1.3rem)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)", color: "rgba(200,255,0,0.5)", minWidth: "1.6rem", flexShrink: 0 }}>$</span>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "monospace",
                  fontSize: "clamp(0.72rem, 1.4vw, 0.88rem)",
                  color: "rgba(255,255,255,0.88)",
                  letterSpacing: "0.04em",
                  flex: 1,
                  caretColor: "#C8FF00",
                  padding: 0,
                  lineHeight: 1.5,
                }}
                placeholder="type 'help' for commands..."
              />
            </div>
          )}
        </div>

        {/* ── Footer bar ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0.6rem 1.2rem",
          borderTop: "0.5px solid rgba(200,255,0,0.08)",
          background: "rgba(200,255,0,0.015)",
          borderRadius: "0 0 6px 6px",
        }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>
            BUILDER ACCESS TERMINAL
          </span>
          <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(200,255,0,0.3)", textTransform: "uppercase" }}>
            STARTATHON 2026 // KERALA
          </span>
        </div>
      </div>

      {/* Bottom transition gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
        background: "linear-gradient(to top, rgba(200,255,0,0.03) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
    </section>
  );
};

export default TerminalBridge;
