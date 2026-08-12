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
    <div className="fixed inset-x-0 top-[calc(56px+0.75rem)] z-[200] flex justify-center px-[clamp(1rem,4vw,2rem)]">
      <div className="flex w-full max-w-[440px] flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-white/10 bg-[rgba(10,10,10,0.85)] px-4 py-[0.7rem] backdrop-blur-lg">
        <p className="min-w-[160px] flex-1 font-general text-[0.8rem] leading-snug text-white/75">
          Join the WhatsApp group for faster updates.
        </p>

        <a
          href={GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-lime/40 px-3 py-[0.35rem] font-mono text-[0.68rem] font-bold uppercase tracking-widest text-lime no-underline transition-colors duration-200 hover:bg-lime hover:text-black"
        >
          Join
        </a>

        <button
          type="button"
          onClick={dismissForever}
          className="cursor-pointer whitespace-nowrap border-none bg-transparent p-0 font-mono text-[0.68rem] tracking-[0.03em] text-white/35 underline underline-offset-[3px] transition-colors duration-200 hover:text-white/65"
        >
          Never show again
        </button>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setVisible(false)}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-white/35 transition-colors duration-200 hover:text-white/70"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default WhatsAppNotice;
