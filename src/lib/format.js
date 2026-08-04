// What the /format page publishes: how Startathon runs and how it is judged.
//
// Sourced from the organisers' format document. Deliberately excluded from
// this file, because it is internal rather than participant-facing:
//   - mentor staffing rules (who may judge whom, allocation of support)
//   - the reasoning behind the pre-build checks, as opposed to the checks
//   - the checkpoint score split (checkpoint 1 / checkpoint 2 / final), which
//     the source document still marks as "possible" rather than settled
//
// The per-dimension weights below ARE published, confirmed by the organisers.
// They must sum to 100; the page renders the total from the data so a bad
// edit shows up on the page rather than silently misleading teams.

export const WHAT_IT_IS = {
  lead: "Startathon is a compressed simulation of the earliest stage of building a startup: identifying a meaningful problem, reducing uncertainty, building something testable, and explaining why it should continue.",
  arc: [
    "Understand the problem",
    "Form a solution hypothesis",
    "Execute",
    "Test an assumption",
    "Learn",
    "Refine",
  ],
  notThis: [
    "A coding speed competition",
    "A competition for the most complex technology",
    "A polished pitch competition",
    "A place where sponsors prescribe technical solutions",
    "A test of who visibly works the hardest",
  ],
  principles: [
    {
      title: "Problem first, not technology first",
      body: "You get bounded problem areas, not technical themes. Use AI, conventional software, hardware, manual workflows, or any combination that actually fits.",
    },
    {
      title: "Technical appropriateness beats complexity",
      body: "A simple, reliable solution to a real problem outscores a sophisticated system with weak user value. Complexity on its own earns nothing.",
    },
    {
      title: "Evidence-based pivots are rewarded",
      body: "Changing direction is fine when evidence drove it. Be ready to say what you originally believed, what you discovered, why you changed, and what you did differently afterwards.",
    },
    {
      title: "Progress and learning are recognised in the scoring",
      body: "Removing important uncertainty, prioritising well, building the right minimum scope and responding to evidence all count, alongside the quality of what you end up with. Visible effort and sleep deprivation do not.",
    },
  ],
};

export const BEFORE_THE_EVENT = {
  lead: "Most of your user discovery is meant to happen before kickoff, not during it. Come in knowing the problem, the people it affects and what you still need to find out. The one thing to leave alone is the product itself.",
  allowed: [
    "Interview users and observe their workflows",
    "Research competitors and existing solutions",
    "Study the domain and gather publicly available data",
    "Learn relevant technologies",
    "Prepare development environments",
    "Create non-functional sketches",
    "Define your assumptions and the experiments that test them",
  ],
  // "Conceal an existing implementation" deliberately lives in declareNote
  // rather than here. It is a disclosure problem, not a timing one, and
  // mixing it in made this read as a list of bans rather than of things the
  // 30 hours are actually for.
  notAllowed: [
    "Build the project-specific core product",
    "Implement the main user journey",
    "Deploy the proposed solution",
    "Prepare the final demonstration",
  ],
  declare: [
    "Existing repositories",
    "Existing prototypes",
    "Previous versions of the idea",
    "Previous competitions involving the idea",
    "Existing design files",
    "Existing datasets or models",
    "Hosted applications related to the idea",
    "Generic reusable components you plan to use",
  ],
  declareNote:
    "Declaring something does not count against you. Declared prior work can be used where it makes sense, it simply earns no execution credit for the 30 hours. Concealing it is the problem: undeclared substantial prior work can lead to penalties or disqualification.",
};

export const KICKOFF = {
  lead: "At kickoff every team records its starting point, as a short live demo, screenshots, a baseline document, repository state or a recorded walkthrough.",
  baseline: [
    "What already exists",
    "What is still only an idea",
    "What is a sketch",
    "What is already functional",
    "Which reusable components you brought",
    "What you plan to build during the event",
  ],
  deltaNote:
    "Anything already functional at kickoff earns no build or execution credit. What you create, test and learn during the event is judged alongside the quality of your final reasoning, evidence and product. Arriving well prepared is an advantage, not a handicap.",
  probes: [
    "Why an implementation choice was made",
    "What the limitations and failure cases are",
    "How the solution evolved during the event",
  ],
  canvas: [
    "Target user",
    "Problem",
    "Existing alternatives",
    "Evidence collected before the event",
    "Riskiest assumption",
    "Current solution hypothesis",
    "Existing work at kickoff",
    "What you intend to build and test",
  ],
};

export const FLOW = [
  {
    label: "Kickoff and baseline",
    body: "Submit your startup canvas v0 and record what already exists.",
  },
  {
    label: "Product refinement",
    body: "Work with product mentors to sharpen the problem, the user scope, the core value and the minimum thing worth building. Mentors challenge you, but they do not approve, reject or design your product. Every decision stays yours.",
  },
  {
    label: "Checkpoint 1: problem and plan",
    body: "Answer who the user is, what evidence shows the problem matters, what is still uncertain, which assumption you will test, what changed since your application, and the smallest useful thing you will build. This scores reasoning and focus, not completeness.",
  },
  {
    label: "Build the minimum testable solution",
    body: "Build the smallest product or experiment that demonstrates the core value, functional enough for someone else to test or understand.",
  },
  {
    label: "Test one important assumption",
    body: "You do not need to repeat full user discovery. Test at least one assumption that matters, using the prototype, a real or proxy user, a domain expert, realistic data, a simulation, a benchmark, a comparison of approaches, failure-case testing or usability observation.",
  },
  {
    label: "Checkpoint 2: product learning",
    body: "Show what works, what you expected, what actually happened, what you learned, what you changed or deliberately did not change, your largest remaining risk, and what you will finish before judging.",
  },
  {
    label: "Final build and refinement",
    body: "Complete the core user journey, critical integrations, testing, important fixes, evidence capture, demo preparation and your next-step plan.",
  },
];

export const LEARNING_LOOP = [
  "What did we believe?",
  "What did we test?",
  "What happened?",
  "What did we learn?",
  "What did we decide?",
];

export const LEARNING_NOTE =
  "The test does not have to change your direction. A credible result that confirms your original decision counts.";

export const JUDGING = [
  {
    dimension: "Problem insight",
    weight: 20,
    evaluates: [
      "Clarity of the target user",
      "Importance of the problem",
      "Understanding of the current workflow",
      "Understanding of existing alternatives",
    ],
  },
  {
    dimension: "Validation and learning",
    weight: 20,
    evaluates: [
      "Quality of pre-event research",
      "Importance of the assumption tested during the event",
      "Credibility of the test",
      "Honesty in interpreting the result",
      "Whether decisions followed logically from evidence",
    ],
  },
  {
    dimension: "Solution and value proposition",
    weight: 15,
    evaluates: [
      "Whether the solution addresses the identified problem",
      "Whether the core value is clear",
      "Whether unnecessary scope was avoided",
    ],
  },
  {
    dimension: "Product and technical execution",
    weight: 25,
    evaluates: [
      "Functionality of the core workflow",
      "Reliability",
      "Technical appropriateness",
      "Quality of engineering decisions",
      "Ability to explain implementation and trade-offs",
      "Integrity of the live demonstration",
    ],
  },
  {
    dimension: "Team execution and ownership",
    weight: 10,
    evaluates: [
      "Prioritisation",
      "Collaboration",
      "Decision-making",
      "Ownership of the solution",
      "Ability to respond to challenges",
    ],
  },
  {
    dimension: "Communication and continuation plan",
    weight: 10,
    evaluates: [
      "Clarity of explanation",
      "Quality of the demonstration",
      "Honesty regarding limitations",
      "Credibility of the next experiment",
      "Potential to continue after the event",
    ],
  },
];

export const APPLYING = {
  lead: "Teams apply before the main event. Twenty teams are shortlisted.",
  deck: [
    "Who experiences the problem",
    "What happens today, and why it is painful",
    "What evidence supports the existence of the problem",
    "Your current solution hypothesis",
    "What you intend to validate and build",
  ],
  video: [
    "Around 60 seconds",
    "Include every team member",
    "Explain why your team cares about this problem",
    "Production quality is not evaluated",
  ],
  // A worked example for the video, since "60 seconds, everyone on camera,
  // say why you care" is hard to picture from a description. Y Combinator
  // asks applicants for a comparable one-minute founder intro and publishes
  // the ones that got in.
  //
  // This is somebody else's playlist on somebody else's platform. If it goes
  // private or moves, delete this key: the link renders only when it exists,
  // so removing it is the whole fix.
  videoExamples: {
    label: "Watch YC application videos",
    url: "https://www.youtube.com/playlist?list=PLTa6hsGq6YA9qjH-TjS0PwGBRfHCtqp7G",
    note: "Y Combinator asks applicants for a similar one minute video. Watching a few is the quickest way to get the tone right. Yours is about the problem your team picked, not about raising money.",
  },
  notRequired: [
    "Detailed architecture",
    "Large feature lists",
    "Polished UI designs",
    "Five-year financial projections",
    "A fully planned technical solution",
  ],
  evaluation: [
    "Problem clarity and importance",
    "Understanding of the target users and current workflow",
    "Evidence supporting the problem",
    "Team capability and complementarity",
    "Quality of your proposed learning and execution approach",
    "Authenticity and clarity of communication",
  ],
  resetNote:
    "Your application score is used only for shortlisting. Once the twenty teams enter the main event, competition scores reset to zero.",
};
