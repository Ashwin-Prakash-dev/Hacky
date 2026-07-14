import { useEffect } from "react";

const SITE_URL = "https://startathon.sctcoding.club";
const DEFAULT_TITLE =
  "Startathon — Kerala's most curated 30-hour hackathon | SCTCE Thiruvananthapuram";
const DEFAULT_DESCRIPTION =
  "Startathon 2026 is Kerala's most curated 30-hour in-person hackathon at SCTCE, Thiruvananthapuram. 20 selected teams, ₹2L+ prize pool, hands-on mentors, and sponsors hiring on the spot.";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route document metadata. Keeps title/description/canonical/robots in
 * sync as the SPA navigates, so crawlers that execute JS index each route
 * with the right tags.
 */
export function usePageMeta({ title, description, path = "/", noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Startathon` : DEFAULT_TITLE;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESCRIPTION;
    setMeta("name", "description", desc);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    const url = `${SITE_URL}${path}`;
    setCanonical(url);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
  }, [title, description, path, noindex]);
}
