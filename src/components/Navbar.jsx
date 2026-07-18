import { useWindowScroll } from "react-use";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { label: "Prizes", id: "prizes" },
  { label: "What is it", id: "what-is-it" },
  { label: "FAQ", id: "faq" },
];

const NavBar = () => {
  const { y: currentScrollY } = useWindowScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setScrolled(currentScrollY > 10);
  }, [currentScrollY]);

  // Lock page scroll behind the full-screen mobile menu
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="nav-shell">
        <div className={`nav-island ${scrolled ? "nav-island--scrolled" : ""}`}>
          <Link to="#" className="nav-logo">
            Startathon<span className="nav-logo-dot">.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="nav-link"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/apply" className="nav-cta group">
              <span className="relative inline-flex overflow-hidden">
                <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                  Apply
                </span>
                <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                  Apply
                </span>
              </span>
              <span className="cta-pill-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </span>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="flex cursor-pointer flex-col items-center justify-center gap-[5px] border-none bg-transparent p-2 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className={`block h-[1.5px] w-[18px] transition-[transform,background] duration-500 ${menuOpen ? "bg-lime" : "bg-white/70"}`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                  transform: menuOpen ? "translateY(3.25px) rotate(45deg)" : "none",
                }}
              />
              <span
                className={`block h-[1.5px] w-[18px] transition-[transform,background] duration-500 ${menuOpen ? "bg-lime" : "bg-white/70"}`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                  transform: menuOpen ? "translateY(-3.25px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen mobile overlay */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[55] flex items-center bg-[rgba(5,5,5,0.86)] transition-opacity duration-500 [backdrop-filter:blur(28px)_saturate(160%)] ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
      >
        <nav className="flex w-full flex-col gap-1 px-[clamp(2rem,8vw,4rem)]">
          {navItems.map((item, i) => (
            <div key={item.id} className="overflow-hidden">
              <button
                onClick={() => {
                  scrollTo(item.id);
                  setMenuOpen(false);
                }}
                className="block w-full cursor-pointer border-none bg-none py-[0.55rem] text-left font-display text-[clamp(2.2rem,9vw,3.2rem)] font-normal leading-none tracking-[0.01em] text-white"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(110%)",
                  transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.07}s, opacity 0.5s ease ${0.08 + i * 0.07}s`,
                }}
              >
                {item.label}
              </button>
            </div>
          ))}
          <div className="mt-8 overflow-hidden">
            <Link
              to="/apply"
              className="cta-pill group"
              onClick={() => setMenuOpen(false)}
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(110%)",
                transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.08 + navItems.length * 0.07}s, opacity 0.5s ease ${0.08 + navItems.length * 0.07}s`,
              }}
            >
              <span className="relative inline-flex overflow-hidden">
                <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                  Apply Now
                </span>
                <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                  Apply Now
                </span>
              </span>
              <span className="cta-pill-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
