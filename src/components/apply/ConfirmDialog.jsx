import { useEffect } from "react";

/**
 * In-page replacement for window.confirm(): states the consequence,
 * makes Cancel the safe default, and matches the panel aesthetic.
 */
const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/[0.72] p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[420px] rounded-lg border-[0.5px] bg-[rgba(14,14,14,0.98)] p-7 ${
          danger ? "border-[rgba(255,120,120,0.35)]" : "border-lime/25"
        }`}
      >
        <p className="mb-[0.6rem] font-general text-[1.1rem] font-bold text-white">
          {title}
        </p>
        {/* A div, not a p: some bodies are a list or a few blocks, and a
            paragraph can't legally hold them. Reads identically for the plain
            sentence most callers pass. */}
        <div className="mb-6 font-general text-[0.88rem] leading-relaxed text-white/70">
          {body}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cursor-pointer rounded border-[0.5px] border-white/20 bg-transparent px-5 py-[0.65rem] font-mono text-[0.78rem] tracking-[0.08em] text-white/85"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded border-none px-5 py-[0.65rem] font-mono text-[0.78rem] font-bold tracking-[0.08em] text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 ${
              danger ? "bg-[#ff6b6b]" : "bg-lime"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
