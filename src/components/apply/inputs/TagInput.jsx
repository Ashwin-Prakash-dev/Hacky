import { useState } from "react";
import { X } from "lucide-react";

/** Chip input for short string lists (e.g. tech stack). Enter or comma adds a tag. */
const TagInput = ({ label, value, onChange, error, max = 10, maxItemLength = 50, disabled, placeholder }) => {
  const [draft, setDraft] = useState("");

  const addTag = (raw) => {
    const tag = raw.trim().slice(0, maxItemLength);
    if (!tag || value.length >= max || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="mb-7">
      <div className="mb-[0.55rem] flex items-baseline justify-between gap-3">
        <label className="select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
          {label}
        </label>
        <span className="shrink-0 font-mono text-[0.72rem] text-white/40">
          {value.length}/{max}
        </span>
      </div>
      <div
        className={`flex w-full flex-wrap items-center gap-[0.4rem] rounded-md border border-white/[0.18] bg-white/5 px-[0.7rem] py-[0.55rem] transition-[border-color,background,box-shadow] duration-[250ms] focus-within:border-lime focus-within:bg-lime/[0.04] focus-within:shadow-[0_0_0_3px_rgba(200,255,0,0.12)]`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-[0.3rem] rounded border border-lime/25 bg-lime/[0.08] px-2 py-[0.2rem] font-mono text-[0.78rem] text-lime/90"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="cursor-pointer text-lime/60 hover:text-lime"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </span>
        ))}
        {!disabled && value.length < max && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => { addTag(draft); setDraft(""); }}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent font-general text-[0.9rem] text-white caret-lime outline-none placeholder:text-white/30"
          />
        )}
      </div>
      {error && (
        <p className="mt-[0.45rem] font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
          {error}
        </p>
      )}
    </div>
  );
};

export default TagInput;
