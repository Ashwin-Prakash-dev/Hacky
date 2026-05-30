import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLanguage } from "react-icons/md";

const Footer = () => (
  <footer
    className="w-screen"
    style={{
      background: "#050505",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      position: "relative",
    }}
  >
    {/* Gradient top accent */}
    <div style={{
      position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.2), transparent)",
      pointerEvents: "none",
    }} />

    {/* Main row */}
    <div
      className="footer-main container mx-auto"
      style={{ padding: "3.5rem 1.5rem" }}
    >
      {/* Brand */}
      <div className="footer-brand">
        <p style={{
          fontFamily: "var(--font-general)",
          fontSize: "1rem", fontWeight: 700,
          letterSpacing: "-0.01em", color: "#fff",
          marginBottom: "6px",
        }}>
          Startathon<span style={{ color: "#888888" }}>.</span>
        </p>
        <p className="font-general" style={{
          fontSize: "0.7rem", color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.04em", lineHeight: 1.7,
          maxWidth: "220px",
        }}>
          Kerala's most curated hackathon for builders.<br />
          Organized by Coding Club, SCTCE.
        </p>
      </div>

      {/* Contact */}
      <div className="footer-col">
        <p className="font-general footer-col-label">Contact</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {[
            { href: "mailto:hello@sctcoding.club", label: "hello@sctcoding.club", icon: <MdOutlineEmail /> },
            { href: "tel:+917909190948",           label: "+91 79091 90948",      icon: <MdOutlinePhone /> },
            { href: "https://www.sctcoding.club",  label: "www.sctcoding.club",   icon: <MdOutlineLanguage />, external: true },
          ].map(({ href, label, icon, external }) => (
            <a
              key={href}
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="font-general footer-link"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              <span className="footer-link-icon">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div className="footer-col">
        <p className="font-general footer-col-label">Follow</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {[
            { href: "https://www.instagram.com/codingclubsctce/",       icon: <FaInstagram />, label: "Instagram" },
            { href: "https://www.linkedin.com/company/sct-coding-club", icon: <FaLinkedin />,  label: "LinkedIn"  },
            { href: "https://x.com/sctcodingclub",                      icon: <FaXTwitter />,  label: "X"         },
          ].map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-general footer-link"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C8FF00")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              <span className="footer-link-icon">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="footer-bottom container mx-auto" style={{ padding: "1.1rem 1.5rem" }}>
        <p className="font-general footer-bottom-text">
          © 2026 Startathon · Sree Chitra Thirunal College of Engineering
        </p>
        <p className="font-general footer-bottom-text">
          Thiruvananthapuram, Kerala
        </p>
      </div>
    </div>

    <style>{`
      .footer-main {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 4rem;
        align-items: start;
      }
      .footer-col-label {
        font-size: 0.5rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.2);
        margin-bottom: 1rem;
      }
      .footer-link {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 0.72rem;
        color: rgba(255,255,255,0.3);
        text-decoration: none;
        letter-spacing: 0.03em;
        transition: color 0.2s;
        white-space: nowrap;
      }
      .footer-link-icon {
        font-size: 1rem;
        color: rgba(255,255,255,0.2);
        flex-shrink: 0;
        display: flex;
      }
      .footer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .footer-bottom-text {
        font-size: 0.62rem;
        color: rgba(255,255,255,0.1);
        letter-spacing: 0.06em;
      }

      @media (max-width: 767px) {
        .footer-main {
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }
        .footer-brand {
          grid-column: 1 / -1;
        }
        .footer-bottom {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
        }
      }
    `}</style>
  </footer>
);

export default Footer;
