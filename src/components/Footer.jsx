import { Link } from "react-router-dom";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Mail, Phone, Globe } from "lucide-react";

const linkTransition = "[transition:color_0.2s,transform_0.45s_cubic-bezier(0.32,0.72,0,1)]";

const Footer = () => (
  <footer className="relative w-screen border-t border-white/[0.07] bg-[#050505]">
    {/* Gradient top accent */}
    <div className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.2),transparent)]" />

    {/* Main row */}
    <div className="container mx-auto grid grid-cols-[1fr_1fr] gap-10 px-6 py-14 md:grid-cols-[1fr_auto_auto] md:gap-16">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <p className="mb-[6px] font-display text-[1.2rem] font-normal tracking-[-0.01em] text-white">
          Startathon<span className="text-lime">.</span>
        </p>
        <p className="mb-5 max-w-[220px] font-general text-[0.85rem] leading-[1.7] tracking-[0.02em] text-white/65">
          Kerala&apos;s most curated hackathon for builders.<br />
          Organized by Coding Club, SCTCE.
        </p>

        {/* Associated logos */}
        <p className="mb-[0.65rem] font-general text-[0.7rem] uppercase tracking-[0.14em] text-white/55">Presented by</p>
        <div className="flex items-center gap-4">
          <img
            src="/Coding Club.png"
            alt="Coding Club SCTCE"
            className="h-[52px] w-auto"
          />
          <span className="h-7 w-px bg-white/10" />
          <img
            src="/SCTCElogo.png"
            alt="SCTCE"
            className="h-[52px] w-auto"
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <p className="mb-4 font-general text-[0.72rem] uppercase tracking-[0.16em] text-white/60">Contact</p>
        <div className="flex flex-col gap-[0.7rem]">
          {[
            { href: "mailto:hello@sctcoding.club", label: "hello@sctcoding.club", icon: <Mail size={15} /> },
            { href: "tel:+917909190948",           label: "+91 79091 90948",      icon: <Phone size={15} /> },
            { href: "https://www.sctcoding.club",  label: "www.sctcoding.club",   icon: <Globe size={15} />, external: true },
          ].map(({ href, label, icon, external }) => (
            <a
              key={href}
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`group flex items-center gap-[9px] whitespace-nowrap font-general text-[0.85rem] tracking-[0.02em] text-white/70 no-underline hover:translate-x-1 hover:text-white ${linkTransition}`}
            >
              <span className={`flex shrink-0 text-base text-white/55 group-hover:scale-[1.15] group-hover:text-lime ${linkTransition}`}>{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div>
        <p className="mb-4 font-general text-[0.72rem] uppercase tracking-[0.16em] text-white/60">Follow</p>
        <div className="flex flex-col gap-[0.7rem]">
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
              className={`group flex items-center gap-[9px] whitespace-nowrap font-general text-[0.85rem] tracking-[0.02em] text-white/70 no-underline hover:translate-x-1 hover:text-lime ${linkTransition}`}
            >
              <span className={`flex shrink-0 text-base text-white/55 group-hover:scale-[1.15] group-hover:text-lime ${linkTransition}`}>{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/5">
      <div className="container mx-auto flex flex-col items-start gap-3 px-6 py-[1.1rem] md:flex-row md:items-center md:justify-between md:gap-0">
        <p className="font-general text-[0.8rem] tracking-[0.03em] text-white/50">
          © 2026 Startathon · Sree Chitra Thirunal College of Engineering
        </p>
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-6">
          <p className="font-general text-[0.8rem] tracking-[0.03em] text-white/50">
            Thiruvananthapuram, Kerala
          </p>
          <div className="flex items-center gap-5">
            {[
              { to: "/domains", label: "Domains" },
              { to: "/terms", label: "Terms" },
              { to: "/privacy", label: "Privacy" },
              { to: "/referral-program", label: "Referral rules" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-general text-[0.8rem] tracking-[0.03em] text-white/50 no-underline hover:text-lime ${linkTransition}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
