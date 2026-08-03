// Every domain name is two ideas joined by "and" — styling that word (the
// site's `special-font b` treatment: lime, weight 800) instead of swapping
// it for an ampersand keeps the exact document wording while still giving
// the name a typographic signature. Use inside an element carrying
// `special-font`.
const DomainTitle = ({ title }) => {
  const parts = title.split(" and ");
  if (parts.length < 2) return title;
  const [head, ...rest] = parts;
  return (
    <>
      {head} <b>and</b> {rest.join(" and ")}
    </>
  );
};

export default DomainTitle;
