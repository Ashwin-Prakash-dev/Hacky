import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";

const navItems = ["About", "Perks", "FAQ", "Contact"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setScrolled(currentScrollY > 20);
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

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
      {/* Background layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: scrolled ? "rgba(0,0,0,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        transition: "background 0.35s ease, border-color 0.35s ease",
      }} />

      {/* Subtle lime bottom hairline when scrolled */}
      {scrolled && (
        <div style={{
          position: "absolute", bottom: 0, left: "5%", right: "5%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.15), transparent)",
          pointerEvents: "none",
        }} />
      )}

      <header className="relative h-full w-full">
        <nav
          className="flex h-full items-center justify-between"
          style={{ padding: "0 clamp(1.25rem, 4vw, 2.5rem)" }}
        >
          {/* Logo */}
          <a
            href="#"
            style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.78rem", fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#fff", textDecoration: "none",
              display: "flex", alignItems: "center", gap: "7px",
            }}
          >
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#C8FF00",
              boxShadow: "0 0 8px rgba(200,255,0,0.7)",
              flexShrink: 0,
            }} />
            startathon
          </a>

          {/* Nav links + CTA */}
          <div className="flex items-center" style={{ gap: "0" }}>
            <div className="hidden md:flex items-center">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="nav-link-btn"
                  style={{
                    fontFamily: "var(--font-general, sans-serif)",
                    fontSize: "0.7rem", fontWeight: 500,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.38)",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "0 1.1rem", height: "56px",
                    transition: "color 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
                >
                  {item}
                </button>
              ))}
              <a
                href="/sponsors"
                style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.7rem", fontWeight: 500,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.22)",
                  textDecoration: "none",
                  padding: "0 1.1rem", height: "56px",
                  display: "flex", alignItems: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
              >
                Sponsors
              </a>
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollTo("contact")}
              style={{
                marginLeft: "1.25rem",
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.68rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#000", background: "#C8FF00",
                border: "none", borderRadius: "50px",
                padding: "0.55rem 1.2rem",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                lineHeight: 1,
                boxShadow: "0 0 0 rgba(200,255,0,0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(200,255,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 0 rgba(200,255,0,0)";
              }}
            >
              Get Notified
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
