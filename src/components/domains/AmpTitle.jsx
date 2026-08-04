// Every domain name joins two concerns with an ampersand — rendering the
// "&" through the site's `special-font b` treatment (lime, weight 800)
// makes that pairing the typographic signature of the domains experience.
// Use inside an element carrying the `special-font` class.
const AmpTitle = ({ title }) => {
  const [head, tail] = title.split(" & ");
  if (!tail) return title;
  return (
    <>
      {head} <b>&amp;</b> {tail}
    </>
  );
};

export default AmpTitle;
