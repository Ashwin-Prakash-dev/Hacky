import { useState } from "react";
import { Check } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FvoDSxKfOAE8Nuzw1Tar4D?mode=gi_t";

const WhatsAppLink = () => (
  <a
    href={WHATSAPP_GROUP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(37,211,102,0.35)] bg-transparent px-5 py-[0.85rem] font-general text-[0.8rem] font-bold uppercase tracking-widest text-[#25D366] no-underline [transition:background_0.2s,border-color_0.2s,transform_0.25s_cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:border-[rgba(37,211,102,0.6)] hover:bg-[rgba(37,211,102,0.08)]"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    Join the WhatsApp Updates Group
  </a>
);

const WaitlistForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("loading");
    const body = { name: form.name.trim(), email: form.email.trim() };
    if (form.phone.trim()) body.phone = form.phone.trim();
    if (form.college.trim()) body.college = form.college.trim();
    try {
      const res = await fetch("https://api.sctcoding.club/api/v3/events/startathon/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201) setStatus("success");
      else if (res.status === 409) setStatus("duplicate");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[1.75rem] bg-lime/[0.03] p-[clamp(2rem,5vw,3.5rem)] text-center shadow-[inset_0_0_0_1px_rgba(200,255,0,0.18)]">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full border border-lime/35 bg-lime/[0.08] text-lime">
          <Check size={22} strokeWidth={2.5} />
        </div>
        <h3
          className="special-font bento-title text-white"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          You&apos;re <b>i</b>n.
        </h3>
        <p className="mt-3 font-general text-[0.92rem] leading-[1.7] text-white/75">
          Check your email for a confirmation from us.
          <br />We&apos;ll be in touch when registrations open.
        </p>
        <div className="mt-7">
          <WhatsAppLink />
        </div>
      </div>
    );
  }

  return (
    // outer machined shell — a lime border-beam patrols the bezel
    <div className="border-beam relative rounded-[1.75rem] bg-white/[0.03] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
    <div className="relative overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[linear-gradient(145deg,#0d0d0d,#090909)] p-[clamp(2rem,5vw,3.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
      {/* Top gradient accent */}
      <div className="absolute inset-x-[15%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.3),transparent)]" />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-60px] h-[200px] w-[300px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(200,255,0,0.05)_0%,transparent_70%)]" />

      <span className="eyebrow mb-4">Stay in the loop</span>

      <h2
        className="special-font bento-title mb-[0.85rem] text-white"
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          letterSpacing: "-0.03em",
          lineHeight: 0.92,
        }}
      >
        Be <b>f</b>irst<br />in line.
      </h2>

      <p className="mb-9 font-general text-[0.92rem] leading-[1.75] text-white/75">
        We&apos;ll reach out the moment registrations open.
        No spam. Just one email when we&apos;re ready.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col gap-[0.85rem]">
          {[
            { key: "name",    type: "text",  placeholder: "Your name"           },
            { key: "email",   type: "email", placeholder: "Your email"          },
            { key: "college", type: "text",  placeholder: "Your college"        },
            { key: "phone",   type: "tel",   placeholder: "Phone (optional)"    },
          ].map(({ key, type, placeholder }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== "phone"}
              className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-[0.85rem] font-general text-[0.95rem] text-white outline-none transition-[border-color,background] duration-[0.4s] ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-lime/45 focus:bg-lime/[0.03]"
            />
          ))}
        </div>

        {status === "duplicate" && (
          <p className="mb-3 font-general text-[0.85rem] text-[#ff8080]">
            This email is already registered.
          </p>
        )}
        {status === "error" && (
          <p className="mb-3 font-general text-[0.85rem] text-[#ff8080]">
            Something went wrong. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full border-none bg-lime px-0 py-[0.95rem] font-general text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#050505] [transition:transform_0.5s_cubic-bezier(0.32,0.72,0,1),box-shadow_0.5s_cubic-bezier(0.32,0.72,0,1),opacity_0.2s] enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(200,255,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Notify Me When Registrations Open"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-[0.85rem]">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="font-general text-xs uppercase tracking-[0.14em] text-white/60">or</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <WhatsAppLink />

      <p className="mt-5 text-center font-general text-[0.78rem] tracking-[0.04em] text-white/55">
        Organized by Coding Club · SCTCE · Thiruvananthapuram
      </p>
    </div>
    </div>
  );
};

export default WaitlistForm;
