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
    <div className="fixed inset-x-0 bottom-0 z-[200] flex justify-center px-[clamp(1rem,4vw,2rem)] pb-[clamp(1rem,4vw,1.5rem)]">
      <div className="flex w-full max-w-[560px] items-start gap-4 rounded-lg border-[0.5px] border-lime/25 bg-[rgba(14,14,14,0.98)] p-[1.1rem] shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
        <p className="flex-1 font-general text-[0.85rem] leading-relaxed text-white/85">
          Join the WhatsApp group for faster updates on deadlines and
          announcements.
          <a
            href={GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 font-mono text-[0.78rem] font-bold uppercase tracking-widest text-lime underline underline-offset-[3px]"
          >
            Join group
          </a>
        </p>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setVisible(false)}
            className="cursor-pointer border-none bg-transparent p-0 text-white/50 transition-colors duration-200 hover:text-white"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={dismissForever}
            className="cursor-pointer whitespace-nowrap border-none bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.04em] text-white/40 underline underline-offset-[3px] transition-colors duration-200 hover:text-white/70"
          >
            Never show again
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppNotice;
