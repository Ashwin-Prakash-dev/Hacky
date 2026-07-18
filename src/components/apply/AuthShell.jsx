import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Stepper from "./Stepper";

const AuthShell = ({ label, step = null, right = null, children }) => (
  <div className="relative min-h-dvh bg-[#0a0a0a]">
    {/* Lime glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(200,255,0,0.05),transparent_70%)]"
    />

    {/* CRT scanlines */}
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.07)_2px,rgba(0,0,0,0.07)_4px)]"
    />

    {/* Top bar */}
    <header className="fixed inset-x-0 top-0 z-[100] flex h-14 items-center justify-between border-b border-white/[0.06] bg-[rgba(10,10,10,0.92)] px-[clamp(1.25rem,4vw,2.5rem)] backdrop-blur-[20px]">
      <Link to="/" className="font-general text-[0.95rem] font-bold tracking-[-0.01em] text-white no-underline">
        Startathon<span className="text-[#888]">.</span>
      </Link>

      <span className="font-mono text-[0.8rem] tracking-[0.12em] text-[rgba(200,255,0,0.8)]">
        [{label}]
      </span>

      {right ?? (
        <Link
          to="/"
          className="flex items-center gap-[0.35rem] font-general text-[0.8rem] uppercase tracking-widest text-white/70 no-underline"
        >
          <X size={14} /> Exit
        </Link>
      )}
    </header>

    {/* Content */}
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-[clamp(1rem,4vw,2rem)] pb-12 pt-[calc(56px+2rem)]">
      {step && <Stepper current={step} />}
      {children}
    </main>
  </div>
);

export default AuthShell;
