import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePageMeta } from "../lib/seo";

// kill·shell — a tiny typing-defense game for the 404 page. Rogue processes
// (named after real failure modes) descend toward the prompt; type a
// process's name to kill it before it reaches the bottom. Reuses the site's
// existing terminal motif (see TerminalBridge) instead of inventing a new one.
const TOKENS = ["segv", "fork", "leak", "null", "worm", "zomb", "loop", "void"];
const ROWS = 12;
const KILLS_TO_WIN = 15;
const MAX_MEM = 100;
const MEM_PER_LEAK = 25;
const TICK_START = 700;
const TICK_MIN = 420;
const SPAWN_START = 1800;
const SPAWN_MIN = 950;
const MAX_ONSCREEN = 6;
const FRAME = 100;

const tickInterval = (kills) => Math.max(TICK_MIN, TICK_START - kills * 20);
const spawnInterval = (kills) => Math.max(SPAWN_MIN, SPAWN_START - kills * 50);
const randToken = () => TOKENS[Math.floor(Math.random() * TOKENS.length)];
const randPid = () => 4000 + Math.floor(Math.random() * 999);

const ProcessRow = ({ process, input, danger }) => {
  if (!process) return <div className="h-[1.6em]" />;
  const matched = input && process.token.startsWith(input);
  return (
    <div
      className={`flex h-[1.6em] items-center gap-3 px-2 ${
        danger ? "bg-lime text-black" : "text-white/70"
      }`}
    >
      <span className={danger ? "text-black/60" : "text-white/35"}>PID {process.pid}</span>
      <span>
        ./
        {matched ? (
          <>
            <span className={danger ? "font-bold text-black" : "font-bold text-lime"}>{input}</span>
            {process.token.slice(input.length)}
          </>
        ) : (
          process.token
        )}
        {" --loop"}
      </span>
    </div>
  );
};

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  usePageMeta({ title: "404", path: location.pathname, noindex: true });

  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost
  const [processes, setProcesses] = useState([]);
  const [input, setInput] = useState("");
  const [mem, setMem] = useState(0);
  const [kills, setKills] = useState(0);
  const [wrong, setWrong] = useState(false);

  const inputRef = useRef(null);
  const idRef = useRef(0);
  const wrongTimer = useRef(null);

  const beginGame = useCallback(() => {
    setProcesses([]);
    setMem(0);
    setKills(0);
    setInput("");
    setPhase("playing");
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [phase]);

  // Latest kills value for the loop below, so the interval doesn't need to
  // restart on every kill.
  const killsRef = useRef(0);
  useEffect(() => {
    killsRef.current = kills;
  }, [kills]);

  // Win/lose are derived from state, not fired as side effects nested inside
  // another updater — StrictMode's dev-only double-invoke of functional
  // setState updaters would otherwise run those nested calls twice.
  useEffect(() => {
    if (phase === "playing" && kills >= KILLS_TO_WIN) setPhase("won");
  }, [kills, phase]);
  useEffect(() => {
    if (phase === "playing" && mem >= MAX_MEM) setPhase("lost");
  }, [mem, phase]);

  // Main loop: descend processes and spawn new ones on independent clocks,
  // both of which tighten as kills climb.
  useEffect(() => {
    if (phase !== "playing") return undefined;
    let elapsedTick = 0;
    let elapsedSpawn = 0;
    const id = setInterval(() => {
      const k = killsRef.current;
      elapsedTick += FRAME;
      elapsedSpawn += FRAME;

      if (elapsedSpawn >= spawnInterval(k)) {
        elapsedSpawn = 0;
        setProcesses((prev) => {
          if (prev.length >= MAX_ONSCREEN) return prev;
          idRef.current += 1;
          return [...prev, { id: idRef.current, token: randToken(), row: 0, pid: randPid() }];
        });
      }

      if (elapsedTick >= tickInterval(k)) {
        elapsedTick = 0;
        setProcesses((prev) => {
          const next = [];
          let leaks = 0;
          for (const p of prev) {
            const row = p.row + 1;
            if (row >= ROWS) leaks += 1;
            else next.push({ ...p, row });
          }
          if (leaks > 0) setMem((m) => Math.min(MAX_MEM, m + leaks * MEM_PER_LEAK));
          return next;
        });
      }
    }, FRAME);
    return () => clearInterval(id);
  }, [phase]);

  const processChar = useCallback((ch) => {
    const candidate = input + ch;
    const matches = processes.filter((p) => p.token.startsWith(candidate));
    if (matches.length === 0) {
      setInput("");
      setWrong(true);
      clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrong(false), 150);
      return;
    }
    const target = matches.reduce((a, b) => (b.row > a.row ? b : a));
    if (target.token === candidate) {
      setInput("");
      setProcesses((prev) => prev.filter((p) => p.id !== target.id));
      setKills((k) => k + 1);
      return;
    }
    setInput(candidate);
  }, [input, processes]);

  const handleKeyDown = (e) => {
    if (phase === "intro") {
      e.preventDefault();
      beginGame();
      return;
    }
    if (phase === "won" || phase === "lost") {
      e.preventDefault();
      if (e.key.toLowerCase() === "r") beginGame();
      else if (e.key === "Enter") navigate("/");
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setInput((s) => s.slice(0, -1));
      return;
    }
    if (e.key.toLowerCase() === "r" && input === "") {
      e.preventDefault();
      beginGame();
      return;
    }
    if (!/^[a-z]$/i.test(e.key)) e.preventDefault();
  };

  const handleChange = (e) => {
    const val = e.target.value;
    e.target.value = "";
    if (phase !== "playing" || !val) return;
    const ch = val[val.length - 1].toLowerCase();
    if (/[a-z]/.test(ch)) processChar(ch);
  };

  const grid = Array.from({ length: ROWS }, (_, row) => processes.find((p) => p.row === row) ?? null);
  const memBlocks = Math.round((mem / MAX_MEM) * 10);
  const memBar = "█".repeat(memBlocks) + "░".repeat(10 - memBlocks);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-5 py-16">
      {/* Ambient lime glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/5 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.22),transparent)]" />

      <p className="mb-6 max-w-[36ch] text-center font-mono text-[0.78rem] tracking-wider text-white/55">
        404: route not found. the shell took it personally.
      </p>

      <div
        className="relative w-full max-w-[560px] cursor-text rounded-2xl border-[0.5px] border-lime/[0.12] bg-lime/[0.018] shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_24px_80px_rgba(0,0,0,0.5)]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 rounded-t-2xl border-b-[0.5px] border-lime/10 bg-lime/[0.025] px-5 py-[0.7rem]">
          {["rgba(255,255,255,0.12)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.05)"].map((c, i) => (
            <span key={i} className="inline-block size-2 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-auto font-mono text-[0.78rem] tracking-[0.14em] text-lime/75">
            sh — recovery mode
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => phase !== "intro" && inputRef.current?.focus()}
          className="absolute size-px opacity-0"
          aria-label="game input"
        />

        {/* Body */}
        <div className="px-5 py-6 font-mono text-[0.8rem] leading-[1.6]">
          {phase === "intro" && (
            <div className="flex flex-col gap-1 text-white/70">
              <p>$ cd /this-page</p>
              <p className="text-white/45">sh: no such file or directory</p>
              <p className="mt-2 text-white/70">
                rogue processes detected. type their names to kill them.{" "}
                {KILLS_TO_WIN} kills restores the shell.
              </p>
              <p className="mt-4 animate-pulse text-lime/70">[ press any key ]</p>
            </div>
          )}

          {phase === "playing" && (
            <>
              <div className="mb-3 flex items-center justify-between text-white/60">
                <span>
                  MEM <span className="text-lime">{memBar}</span> {mem}%
                </span>
                <span>
                  KILLS {String(kills).padStart(2, "0")}/{KILLS_TO_WIN}
                </span>
              </div>
              <div className="flex flex-col">
                {grid.map((p, row) => (
                  <ProcessRow key={row} process={p} input={input} danger={row >= ROWS - 2} />
                ))}
              </div>
              <div className={`mt-2 flex items-center gap-1 ${wrong ? "text-[#ff6b6b]" : "text-white/80"}`}>
                <span className="text-lime/60">$</span>
                <span>{input}</span>
                <span className="h-[1.1em] w-[7px] animate-pulse bg-lime/70" />
              </div>
            </>
          )}

          {phase === "won" && (
            <div className="flex flex-col gap-1">
              <p className="text-lime">
                ✓ SHELL RESTORED — {KILLS_TO_WIN} processes down, {mem.toFixed(2)}% memory leaked.
                you&apos;d last the 30 hours.
              </p>
              <p className="mt-3 text-white/60">
                $ cd ~ <span className="text-lime/70">[enter]</span> · run again{" "}
                <span className="text-lime/70">[r]</span>
              </p>
            </div>
          )}

          {phase === "lost" && (
            <div className="flex flex-col gap-1">
              <p className="text-[#ff6b6b]">
                ✗ KERNEL PANIC — memory exhausted at {kills} {kills === 1 ? "kill" : "kills"}.
              </p>
              <p className="mt-3 text-white/60">
                respawn <span className="text-lime/70">[r]</span> · give up and go home{" "}
                <span className="text-lime/70">[enter]</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="mt-8 font-mono text-[0.8rem] tracking-[0.03em] text-lime/70 underline underline-offset-[3px] hover:text-lime"
      >
        ← back to Startathon
      </Link>
    </div>
  );
};

export default NotFoundPage;
