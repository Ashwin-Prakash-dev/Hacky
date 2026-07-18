// Single source of truth for the lens journey: chapter order, in-scene
// copy, and the assets each chapter draws. The DOM overlay, the WebGL
// scene, the anchor rail, and the screen-reader outline all read from
// here so the scroll math never drifts out of sync with the content.

// Troika (drei <Text>) can't parse woff2, so the in-scene type uses the
// Open Sauce ttf cuts that already ship in /public/fonts.
export const FONT_DISPLAY = "/fonts/open-sauce-sans-latin-800-normal.ttf";
export const FONT_LABEL = "/fonts/open-sauce-sans-latin-500-normal.ttf";

// Scene colors mirror the site tokens (--lime, blue-50 / --bg).
export const LIME = "#C8FF00";
export const INK = "#F0F0EC";

// Chapter order defines the scroll track: one viewport of scroll per
// chapter. `anchor` ids keep the navbar + in-page links working — they
// land on invisible rails positioned along the track.
export const CHAPTERS = [
  { id: "arrival" },
  { id: "positioning" },
  { id: "builders", anchor: "what-is-it" },
  { id: "briefing", anchor: "briefing" },
  { id: "prizes", anchor: "timeline" },
  { id: "sponsors", anchor: "sponsors" },
  { id: "threshold" },
];

export const CHAPTER_COUNT = CHAPTERS.length;

// Chapter 3 — the builder wall (from VideoCards)
export const BUILDERS = [
  {
    name: "ANTHROPIC",
    src: "/videos/feature-1.webm",
    blurb:
      "A few people who believed AI should be built carefully. Now they're shaping the whole industry.",
  },
  {
    name: "SPACEX",
    src: "/videos/feature-2.webm",
    blurb:
      "Everyone said private rockets were impossible. They just started building anyway.",
  },
  {
    name: "PALANTIR",
    src: "/videos/feature-3.webm",
    blurb:
      "Boring data infrastructure. Until governments couldn't run without it.",
  },
  {
    name: "OPENAI",
    src: "/videos/feature-4.webm",
    blurb:
      "Started in a room with a research paper. Changed what a billion people think is possible.",
  },
  {
    name: "ANDURIL",
    src: "/videos/feature-5.webm",
    blurb:
      "Defense tech hadn't changed in decades. They walked in like it was a startup.",
  },
];

// Chapter 4 — the briefing, condensed to its four load-bearing lines
// in-scene; the full three blocks live in the outline below.
export const BRIEFING_LINES = [
  "30-hour build sprint",
  "Expert mentors in the room",
  "20 curated teams. Builders, not attendees",
  "Fast-track interviews for top performers",
];

// Chapter 6 — sponsors (links live in the outline; the scene shows marks)
export const SPONSORS = [
  {
    name: "VoiceStack",
    href: "https://voicestack.com?utm_source=startathon",
    src: "/img/sponsors/voicestack.png",
    h: 1.0,
    blurb:
      "AI phone systems that capture every missed call for healthcare practices.",
  },
  {
    name: "CareStack",
    href: "https://carestack.com?utm_source=startathon",
    src: "/img/sponsors/carestack-white.png",
    h: 0.85,
    blurb: "Cloud-based practice management software for dental teams.",
  },
  {
    name: "CareRevenue",
    href: "https://carerevenue.com?utm_source=startathon",
    src: "/img/sponsors/carerevenue-white.png",
    h: 0.85,
    blurb: "Dental revenue cycle management — billing, claims, and collections.",
  },
];

// Full briefing content, preserved verbatim for the screen-reader /
// search-engine outline (the scene shows the condensed lines above).
export const BRIEFING_BLOCKS = [
  {
    heading: "What to Expect",
    rows: [
      ["30-Hour Build Sprint", "Non-stop building from kickoff to demo day"],
      ["Expert Mentors", "Technical founders and engineers in the room with you"],
      ["Curated Teams Only", "20 selected teams. Builders, not attendees"],
      ["Fast-track Interviews", "Top performers skip the cold application queue entirely"],
    ],
  },
  {
    heading: "Mentors",
    rows: [
      ["Technical Founders", "Startup builders who've shipped products to real users"],
      ["Domain Specialists", "Engineers with deep expertise in AI, fintech, healthtech"],
      ["Hands-on Help", "They sit with your team, look at your code, push you harder"],
      ["Real 1:1s", "Sit across from founders and CTOs. Not a panel from 20 rows back"],
    ],
  },
  {
    heading: "Rules",
    rows: [
      ["Teams of 3–4", "Squad up — every team needs 3 to 4 members to compete"],
      ["Original work only", "All code written during the 30-hour window. No pre-built projects"],
      ["Must be deployable", "A working product or clear prototype. Slides don't count"],
      ["Fair play", "Respect fellow builders, mentors, and the community you're in"],
    ],
  },
];

export const PRIZE_LADDER = [
  ["First Place", "₹1,00,000"],
  ["Second Place", "₹60,000"],
  ["Third Place", "₹40,000"],
];
