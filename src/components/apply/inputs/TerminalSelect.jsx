import { Children, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const TerminalSelect = ({ label, error, value, onChange, children, disabled }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const options = Children.toArray(children)
    .filter((child) => child.type === "option")
    .map((child) => ({
      value: child.props.value,
      label: child.props.children,
      disabled: !!child.props.disabled,
    }));

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (opt) => {
    if (opt.disabled) return;
    onChange({ target: { value: opt.value } });
    setOpen(false);
  };

  return (
    <div className="mb-7" ref={rootRef}>
      <label className="mb-[0.55rem] block select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`w-full rounded-md border bg-white/5 px-[0.9rem] py-[0.7rem] text-left font-general text-[0.95rem] font-normal outline-none transition-[border-color,background,box-shadow] duration-[250ms] ${
            open
              ? "border-lime bg-lime/[0.04] shadow-[0_0_0_3px_rgba(200,255,0,0.12)]"
              : "border-white/[0.18]"
          } ${selected ? "text-white" : "text-white/40"} ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          {selected ? selected.label : "Select"}
        </button>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`pointer-events-none absolute right-[0.9rem] top-1/2 -translate-y-1/2 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        {open && (
          <ul
            role="listbox"
            className="absolute z-10 mt-[0.4rem] w-full overflow-hidden rounded-md border border-white/[0.18] bg-[rgba(12,12,12,0.98)] py-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
          >
            {options
              .filter((opt) => !opt.disabled)
              .map((opt) => (
                <li key={opt.value} role="option" aria-selected={opt.value === value}>
                  <button
                    type="button"
                    onClick={() => choose(opt)}
                    className={`block w-full px-[0.9rem] py-[0.55rem] text-left font-general text-[0.9rem] outline-none transition-colors duration-150 focus-visible:bg-lime/[0.08] ${
                      opt.value === value
                        ? "text-lime"
                        : "text-white/85 hover:bg-white/[0.06]"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
          </ul>
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

export default TerminalSelect;
