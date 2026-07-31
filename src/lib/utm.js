const KEY_UTM = "st_utm";

const FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

// The API validates each field at 100 chars (zod .max(100)) and rejects the
// whole request with a 400 if any is longer, so an over-long param in the URL
// would otherwise break signup entirely. Truncate here to match.
const MAX_LEN = 100;

/**
 * First-touch UTM capture. Call once on app load, before anything renders.
 *
 * Only writes when the visit actually carried attribution params. Storing an
 * empty object on a bare visit would permanently poison first-touch for anyone
 * who browses the site before clicking a campaign link — they'd have a stored
 * value, so the real campaign tags would be discarded on arrival, silently.
 */
export function captureUtm(search = window.location.search) {
  if (localStorage.getItem(KEY_UTM)) return; // first touch wins

  const params = new URLSearchParams(search);
  const utm = {};
  for (const field of FIELDS) {
    const value = params.get(field);
    if (value) utm[field] = value.slice(0, MAX_LEN);
  }

  if (Object.keys(utm).length === 0) return;
  localStorage.setItem(KEY_UTM, JSON.stringify(utm));
}

export function getUtm() {
  try {
    return JSON.parse(localStorage.getItem(KEY_UTM)) || {};
  } catch {
    return {};
  }
}

/**
 * UTM as a query-string fragment, each pair prefixed with "&" so it can be
 * appended to a URL that already has params. Empty string when nothing is
 * stored. Used by the Google OAuth callback, which is a GET.
 */
export function utmQueryString() {
  return Object.entries(getUtm())
    .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
    .join("");
}
