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

  useEffect(() => {
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
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo */}
          <a
            href="#"
            className="font-general text-sm font-bold uppercase tracking-widest text-blue-50"
            style={{ letterSpacing: "0.08em" }}
          >
            startathon
          </a>

          {/* Nav links + CTA */}
          <div className="flex h-full items-center gap-2">
            <div className="hidden md:flex items-center">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="nav-hover-btn"
                >
                  {item}
                </button>
              ))}
              <a
                href="#sponsors"
                className="nav-hover-btn"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                For Sponsors
              </a>
            </div>

            {/* Get Notified CTA */}
            <button
              onClick={() => scrollTo("contact")}
              className="ml-6 rounded border border-white/20 px-4 py-2 font-general text-xs uppercase tracking-widest text-blue-50 transition-all duration-200 hover:border-white/60 hover:bg-white/5"
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
