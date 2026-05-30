import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const socialLinks = [
  { href: "https://instagram.com", icon: <FaInstagram />, label: "Instagram" },
  { href: "https://linkedin.com",  icon: <FaLinkedin />,  label: "LinkedIn"  },
  { href: "https://twitter.com",   icon: <FaTwitter />,   label: "Twitter"   },
];

const Footer = () => (
  <footer
    className="w-screen"
    style={{
      background: "#050505",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      position: "relative",
      paddingTop: "2.5rem",
      paddingBottom: "2.5rem",
    }}
  >
    {/* Gradient top accent */}
    <div style={{
      position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.2), transparent)",
      pointerEvents: "none",
    }} />

    <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row md:gap-4">
      {/* Brand */}
      <div>
        <div style={{ marginBottom: "4px" }}>
          <p
            style={{
              fontFamily: "var(--font-general)",
              fontSize: "0.95rem", fontWeight: 700,
              letterSpacing: "-0.01em", color: "#fff",
            }}
          >
            Startathon<span style={{ color: "#888888" }}>.</span>
          </p>
        </div>
        <p className="font-general text-xs" style={{ color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}>
          Coding Club · SCTCE · Thiruvananthapuram
        </p>
      </div>

      {/* Contact */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {[
          { href: "mailto:hello@sctcoding.club", label: "hello@sctcoding.club" },
          { href: "tel:+917909190948",           label: "+91 79091 90948"      },
          { href: "https://www.sctcoding.club",  label: "www.sctcoding.club", external: true },
        ].map(({ href, label, external }) => (
          <a
            key={href}
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="font-general text-xs"
            style={{
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Socials */}
      <div className="flex items-center gap-5">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            style={{
              color: "rgba(255,255,255,0.22)",
              fontSize: "1.1rem",
              textDecoration: "none",
              display: "flex",
              transition: "color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#C8FF00";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.22)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>

    <p
      className="mt-8 text-center font-general text-xs"
      style={{ color: "rgba(255,255,255,0.1)", letterSpacing: "0.07em" }}
    >
      © 2026 Startathon · Sree Chitra Thirunal College of Engineering
    </p>
  </footer>
);

export default Footer;
