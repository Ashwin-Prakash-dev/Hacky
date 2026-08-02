import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Footer from "../sections/Footer";

// Chrome for the domain routes. Follows the legal pages in skipping NavBar,
// whose links scroll-anchor to homepage sections that don't exist here.
const DomainsShell = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505]">
      <header className="border-b border-white/[0.07]">
        <div className="container mx-auto flex items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link to="/" className="nav-logo">
            Startathon<span className="nav-logo-dot">.</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="hidden font-mono text-[0.72rem] tracking-[0.04em] text-white/50 no-underline transition-colors duration-200 hover:text-lime sm:inline"
            >
              ← back to site
            </Link>
            <Link to="/apply" className="nav-cta group">
              Apply
              <span className="nav-cta-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <Footer />
    </div>
  );
};

export default DomainsShell;
