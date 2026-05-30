import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const socialLinks = [
  { href: "https://instagram.com", icon: <FaInstagram />, label: "Instagram" },
  { href: "https://linkedin.com", icon: <FaLinkedin />, label: "LinkedIn" },
  { href: "https://twitter.com", icon: <FaTwitter />, label: "Twitter" },
];

const Footer = () => (
  <footer
    className="w-screen py-10"
    style={{
      background: "#050505",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row md:gap-4">
      {/* Brand */}
      <div>
        <p
          className="font-open-sauce text-white"
          style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          Startathon<span style={{ color: "#424242" }}>.</span> 
        </p>
        <p
          className="font-general text-xs mt-1"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Coding Club · SCTCE · Thiruvananthapuram
        </p>
      </div>

      {/* Contact */}
      <div className="flex flex-col items-center gap-1 text-center">
        <a
          href="mailto:hello@sctcoding.club"
          className="font-general text-xs transition-colors duration-200 hover:text-white"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          hello@sctcoding.club
        </a>
        <a
          href="tel:+917909190948"
          className="font-general text-xs transition-colors duration-200 hover:text-white"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          +91 79091 90948
        </a>
        <a
          href="https://www.sctcoding.club"
          target="_blank"
          rel="noreferrer"
          className="font-general text-xs transition-colors duration-200 hover:text-white"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          www.sctcoding.club
        </a>
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
            className="text-lg transition-colors duration-200 hover:text-white"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>

    <p
      className="mt-8 text-center font-general text-xs"
      style={{ color: "rgba(255,255,255,0.1)", letterSpacing: "0.06em" }}
    >
      © 2026 Startathon · Sree Chitra Thirunal College of Engineering
    </p>
  </footer>
);

export default Footer;
