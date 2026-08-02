// Labelled bullet list used for the scope, prohibition and measure blocks.
// `loud` marks the lists that carry consequences (what's banned outright).
const ScopeList = ({ title, items, tone = "quiet" }) => (
  <div>
    <p
      className={`mb-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] ${
        tone === "loud" ? "text-lime/80" : "text-white/40"
      }`}
    >
      {title}
    </p>
    <ul className="flex flex-col gap-1.5 pl-5">
      {items.map((item) => (
        <li
          key={item}
          className="list-disc font-general text-[0.9rem] leading-[1.75] text-white/70 marker:text-lime/40"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default ScopeList;
