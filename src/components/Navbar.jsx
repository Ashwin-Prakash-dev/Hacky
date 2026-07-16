import { useWindowScroll } from "react-use";
import { useEffect, useState } from "react";

const navItems = [
  { label: "What is it", id: "what-is-it" },
  { label: "Perks", id: "timeline" },
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
          <a href="#" className="nav-logo">
            Startathon<span className="nav-logo-dot">.</span>
          </a>

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
            <a href="/apply" className="nav-cta">
              Apply
              <span className="nav-cta-icon" aria-hidden="true">↗</span>
            </a>

            {/* Hamburger — mobile only */}
            <button
              className="flex cursor-pointer flex-col items-center justify-center gap-[5px] border-none bg-transparent p-2 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                style={{
                  display: "block", width: "18px", height: "1.5px",
                  background: menuOpen ? "#C8FF00" : "rgba(255,255,255,0.7)",
                  transition: "transform 0.5s cubic-bezier(0.32,0.72,0,1), background 0.3s",
                  transform: menuOpen ? "translateY(3.25px) rotate(45deg)" : "none",
                }}
              />
              <span
                style={{
                  display: "block", width: "18px", height: "1.5px",
                  background: menuOpen ? "#C8FF00" : "rgba(255,255,255,0.7)",
                  transition: "transform 0.5s cubic-bezier(0.32,0.72,0,1), background 0.3s",
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
        style={{
          position: "fixed", inset: 0, zIndex: 55,
          background: "rgba(5,5,5,0.86)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.55s cubic-bezier(0.32,0.72,0,1)",
          display: "flex", alignItems: "center",
        }}
      >
        <nav
          style={{
            width: "100%",
            padding: "0 clamp(2rem, 8vw, 4rem)",
            display: "flex", flexDirection: "column", gap: "0.25rem",
          }}
        >
          {navItems.map((item, i) => (
            <div key={item.id} style={{ overflow: "hidden" }}>
              <button
                onClick={() => { scrollTo(item.id); setMenuOpen(false); }}
                style={{
                  textAlign: "left", background: "none", border: "none",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.2rem, 9vw, 3.2rem)",
                  fontWeight: 400, letterSpacing: "0.01em",
                  color: "#fff",
                  padding: "0.55rem 0", cursor: "pointer",
                  display: "block", width: "100%", lineHeight: 1,
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(110%)",
                  transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.07}s, opacity 0.5s ease ${0.08 + i * 0.07}s`,
                }}
              >
                {item.label}
              </button>
            </div>
          ))}
          <div style={{ overflow: "hidden", marginTop: "2rem" }}>
            <a
              href="/apply"
              className="cta-pill"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(110%)",
                transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.08 + navItems.length * 0.07}s, opacity 0.5s ease ${0.08 + navItems.length * 0.07}s`,
              }}
            >
              Apply now
              <span className="cta-pill-icon" aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
