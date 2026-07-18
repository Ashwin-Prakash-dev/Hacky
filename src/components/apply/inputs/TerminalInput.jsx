const TerminalInput = ({ label, error, style: extStyle, ...props }) => (
  <div className="mb-7">
    <label className="mb-[0.55rem] block select-none font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
      {label}
    </label>
    <input
      {...props}
      style={extStyle}
      className="w-full rounded-md border border-white/[0.18] bg-white/5 px-[0.9rem] py-[0.7rem] font-general text-[0.95rem] font-normal text-white caret-lime outline-none transition-[border-color,background,box-shadow] duration-[250ms] focus:border-lime focus:bg-lime/[0.04] focus:shadow-[0_0_0_3px_rgba(200,255,0,0.12)]"
    />
    {error && (
      <p className="mt-[0.45rem] font-general text-[0.85rem] text-[rgba(255,120,120,0.95)]">
        {error}
      </p>
    )}
  </div>
);

export default TerminalInput;
