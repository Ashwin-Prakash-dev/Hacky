import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "startathon-whatsapp-notice-dismissed";
const GROUP_URL = "https://chat.whatsapp.com/Cve43TFFjy0BQ9i5kgoWuA";

// Dismiss is per-visit (unmounts on navigation); "don't show again" persists
// across sessions via localStorage.
const WhatsAppNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
  }, []);

  if (!visible) return null;

  const dismissForever = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 top-[calc(56px+1rem)] z-[200] flex justify-center px-[clamp(1rem,4vw,2rem)]">
      <div className="w-full max-w-[420px] rounded-lg border border-lime/30 bg-[rgba(14,14,14,0.98)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-3">
          <p className="font-general text-[0.85rem] leading-relaxed text-white/85">
            Join the WhatsApp group for faster updates on deadlines and
            announcements.
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setVisible(false)}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-transparent text-white/55 transition-colors duration-200 hover:border-white/30 hover:text-white"
          >
            <X size={13} strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <a
            href={GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-lime px-5 py-[0.55rem] font-mono text-[0.75rem] font-bold uppercase tracking-widest text-black no-underline transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:translate-y-[-2px]"
          >
            Join group
          </a>
          <button
            type="button"
            onClick={dismissForever}
            className="cursor-pointer border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.04em] text-white/40 underline underline-offset-[3px] transition-colors duration-200 hover:text-white/70"
          >
            Never show again
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppNotice;
