import { useEffect, useState } from "react";
import { APPLICATIONS_CLOSE } from "../../../lib/phase";

// Isolated from the form on purpose: this re-renders once a second, and the
// submission steps must not re-render with it.
//
// The date it counts to is hardcoded in lib/phase.js because no endpoint
// exposes the deadline. This is a convenience, never an authority. The server
// decides, and a 403 from either PUT overrides whatever this shows.

const pad = (n) => String(n).padStart(2, "0");

const remaining = () => Math.max(0, APPLICATIONS_CLOSE.getTime() - Date.now());

const format = (ms) => {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
};

const Countdown = ({ onExpire }) => {
  const [ms, setMs] = useState(remaining);

  useEffect(() => {
    if (ms <= 0) {
      onExpire?.();
      return undefined;
    }
    const timer = setInterval(() => {
      const next = remaining();
      setMs(next);
      if (next <= 0) onExpire?.();
    }, 1000);
    return () => clearInterval(timer);
  }, [ms, onExpire]);

  if (ms <= 0) {
    return (
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[rgba(255,120,120,0.95)]">
        Submissions closed
      </p>
    );
  }

  // Inside the last day the clock stops being background information.
  const urgent = ms < 86400000;

  return (
    <p
      className={`font-mono text-[0.72rem] uppercase tabular-nums tracking-[0.14em] ${
        urgent ? "text-[rgba(255,120,120,0.95)]" : "text-white/50"
      }`}
    >
      Closes in{" "}
      <span className={urgent ? "font-bold" : "text-white/75"}>{format(ms)}</span>
    </p>
  );
};

export default Countdown;
