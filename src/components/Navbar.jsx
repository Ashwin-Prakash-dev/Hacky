import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "What is it", id: "what-is-it" },
  { label: "Perks", id: "timeline" },
  { label: "FAQ", id: "faq" },
];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const lastScrollY = useRef(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navContainerRef.current;
    if (!nav) return;

    setScrolled(currentScrollY > 20);

    if (currentScrollY === 0) {
      setIsNavVisible(true);
      nav.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY.current) {
      setIsNavVisible(false);
      nav.classList.add("floating-nav");
      setMenuOpen(false);
    } else {
      setIsNavVisible(true);
      nav.classList.add("floating-nav");
    }

    lastScrollY.current = currentScrollY;
  }, [currentScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{ height: "56px" }}
    >
      <div className={`nav-bg ${scrolled ? "nav-bg--scrolled" : ""}`} />
      {scrolled && <div className="nav-hairline" />}

      <header className="relative h-full w-full">
        <nav className="flex h-full items-center justify-between nav-inner">
          <a href="#" className="nav-logo">
            Startathon<span className="nav-logo-dot">.</span>
          </a>

          <div className="flex items-center">
            {/* Desktop links */}
            <div className="hidden md:flex items-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="nav-link"
                >
                  {item.label}
                </button>
              ))}
              <a href="/sponsors" className="nav-link nav-link--anchor">
                For Sponsors
              </a>
            </div>

            <a href="/apply" className="nav-cta" style={{ textDecoration: "none" }}>
              Apply Now
            </a>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", justifyContent: "center",
                gap: "5px", padding: "8px", marginLeft: "0.5rem",
              }}
            >
              <span style={{
                display: "block", width: "20px", height: "1.5px",
                background: menuOpen ? "#C8FF00" : "rgba(255,255,255,0.65)",
                transition: "transform 0.3s ease, background 0.25s",
                transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              }} />
              <span style={{
                display: "block", width: "20px", height: "1.5px",
                background: menuOpen ? "#C8FF00" : "rgba(255,255,255,0.65)",
                transition: "opacity 0.2s, background 0.25s",
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: "block", width: "20px", height: "1.5px",
                background: menuOpen ? "#C8FF00" : "rgba(255,255,255,0.65)",
                transition: "transform 0.3s ease, background 0.25s",
                transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile dropdown menu */}
      <div
        style={{
          position: "absolute", top: "56px", left: 0, right: 0,
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: menuOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
          overflow: "hidden",
          maxHeight: menuOpen ? "280px" : "0",
          transition: "max-height 0.4s cubic-bezier(0.76, 0, 0.24, 1), border-bottom 0.1s",
          zIndex: -1,
        }}
      >
        <nav style={{
          padding: "1rem clamp(1.25rem, 4vw, 2.5rem) 1.5rem",
          display: "flex", flexDirection: "column",
        }}>
          {navItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { scrollTo(item.id); setMenuOpen(false); }}
              style={{
                textAlign: "left", background: "none", border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-general)", fontSize: "0.72rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                padding: "0.9rem 0", cursor: "pointer",
                transition: "color 0.2s",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
                transitionDelay: menuOpen ? `${i * 0.05}s` : "0s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/sponsors"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block", marginTop: "0",
              fontFamily: "var(--font-general)", fontSize: "0.72rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              padding: "0.9rem 0",
              textDecoration: "none", transition: "color 0.2s",
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
              transitionDelay: menuOpen ? `${navItems.length * 0.05}s` : "0s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            For Sponsors
          </a>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
