import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";

const navItems = ["About", "Perks", "FAQ"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const lastScrollY = useRef(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

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

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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
            <div className="hidden md:flex items-center">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="nav-link"
                >
                  {item}
                </button>
              ))}
              <a href="/sponsors" className="nav-link nav-link--anchor">
                For Sponsors
              </a>
            </div>

            <button onClick={() => scrollTo("contact")} className="nav-cta">
              Get Notified
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
