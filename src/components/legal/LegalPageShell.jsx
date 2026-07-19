import { Link } from "react-router-dom";
import Footer from "../Footer";

// Shared chrome for standalone long-form pages (Terms, Privacy, Referral
// rules). Skips Navbar since its nav links scroll-anchor to homepage
// sections that don't exist here.
const LegalPageShell = ({ eyebrow, title, updated, children }) => (
  <div className="min-h-dvh bg-[#050505]">
    <header className="border-b border-white/[0.07]">
      <div className="container mx-auto flex items-center justify-between p-6">
        <Link
          to="/"
          className="font-display text-[1.2rem] font-normal tracking-[-0.01em] text-white no-underline"
        >
          Startathon<span className="text-lime">.</span>
        </Link>
        <Link
          to="/"
          className="font-mono text-[0.8rem] tracking-[0.04em] text-white/55 no-underline hover:text-lime"
        >
          ← back to site
        </Link>
      </div>
    </header>

    <main className="container mx-auto max-w-[720px] px-6 py-[clamp(3rem,8vw,5rem)]">
      <span className="eyebrow mb-5">{eyebrow}</span>
      <h1 className="mb-2 font-display text-[clamp(2rem,6vw,3rem)] font-normal leading-[1.05] tracking-[-0.01em] text-white">
        {title}
      </h1>
      <p className="mb-12 font-mono text-[0.78rem] tracking-[0.04em] text-white/45">
        Last updated {updated}
      </p>
      <div className="flex flex-col gap-10">{children}</div>
    </main>

    <Footer />
  </div>
);

export const LegalSection = ({ title, children }) => (
  <section>
    <h2 className="mb-3 font-general text-[1.05rem] font-bold tracking-[-0.01em] text-white">
      {title}
    </h2>
    <div className="flex flex-col gap-3 font-general text-[0.92rem] leading-[1.75] tracking-[0.01em] text-white/70">
      {children}
    </div>
  </section>
);

export const LegalLink = ({ to, href, children }) =>
  to ? (
    <Link to={to} className="text-lime/90 underline underline-offset-[3px] hover:text-lime">
      {children}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-lime/90 underline underline-offset-[3px] hover:text-lime"
    >
      {children}
    </a>
  );

export const LegalList = ({ items }) => (
  <ul className="flex flex-col gap-1.5 pl-5">
    {items.map((item, i) => (
      <li key={i} className="list-disc marker:text-lime/50">
        {item}
      </li>
    ))}
  </ul>
);

export default LegalPageShell;
