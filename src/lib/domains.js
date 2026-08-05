import { Accessibility, HeartPulse, ShieldAlert, Workflow } from "lucide-react";

// The four Startathon challenge domains, plus the standards that sit above
// them. Everything the domain picker and the per-domain briefs render comes
// from here — copy, structure, links. To add or edit a domain, edit this
// file only.
//
// Every brief answers the same ten things in the same order, so teams can
// compare domains directly:
//   hook          primary outcome, as the picker card's one-liner
//   outcome       the same outcome as a bare phrase, for the home-page
//                 comparison list where "Choose this if…" repeats four times
//   intro         the situation, then the central challenge
//   scope         what counts as one problem — the boundary that stops drift
//   audiences     who experiences the problem
//   problems      representative examples, not an exhaustive list
//   demonstrates  the six dimensions a strong solution shows (same six axes
//                 in all four domains — that is the point of them)
//   success       how judges measure it
//   insufficient  allowed, but too shallow on its own
//   prohibited    not permitted in any form, however well built
//   EXPECTATIONS  the six below, which apply to every submission
//
// `links.guide` / `links.pdf` are the "complete guide" destinations shown at
// the end of each brief. Leave them null until the guide page / PDF exists;
// the CTAs appear automatically once a URL is set.
export const DOMAINS = [
  {
    slug: "preventive-health",
    title: "Preventive health & everyday care",
    icon: HeartPulse,
    hook: "Choose this if your primary outcome is improving health behaviour or care outside a healthcare facility.",
    outcome: "Improving health behaviour or care outside a healthcare facility.",
    intro: [
      "Many health outcomes depend on what people do outside hospitals, clinics and dental practices. Patients and caregivers leave with instructions, recommendations and treatment plans, then struggle to apply them consistently. Existing tools lean on reminders and notifications without addressing understanding, technique, motivation, coordination or changing circumstances.",
      "The challenge: pick one health-related routine, technique or decision that a specific person must carry out outside a clinical setting, where doing it wrong has real consequences. Build a system that measurably improves how well that activity is understood, performed or sustained, and that escalates to a human professional when it should.",
    ],
    scope: {
      line: "One health routine, technique or decision: a bounded set of actions a person carries out to reach a health outcome.",
      examples: [
        "A post-surgical recovery routine",
        "A child's twice-daily oral care",
        "An elderly parent's medication schedule managed by three family members",
        "A prescribed physiotherapy programme",
        "Judging whether a change in symptoms needs professional help",
      ],
      note: "A routine has a defined owner, a defined frequency, a correct method and an observable failure mode. A decision moment has a trigger, a time window and a wrong answer that costs something. If you can't state those, narrow your problem further.",
    },
    audiences: [
      {
        label: "Patients",
        note: "Applying medication, technique and recovery instructions at home, unsupervised.",
      },
      {
        label: "Caregivers",
        note: "Coordinating a relative's medication, hygiene, appointments and diet.",
      },
      {
        label: "Families",
        note: "One care routine split across three people, paper notes and a group chat.",
      },
      {
        label: "Elderly & low-literacy users",
        note: "The people for whom instructions, apps and leaflets were never designed.",
      },
    ],
    problems: [
      {
        title: "Turning instructions into daily action",
        body: "A patient leaves a consultation with instructions on medication, diet, hygiene, exercise and follow-up: each understood individually, impossible to run as a day. Organise them, catch conflicts, adapt to the person's real schedule, and record difficulties for the next consultation.",
      },
      {
        title: "Better preventive oral care",
        body: "Children and adults brush regularly but with poor technique, missed areas or not for long enough. Help users learn and practise correct technique with understandable feedback, without claiming to diagnose anything.",
      },
      {
        title: "Supporting the family caregiver",
        body: "One person coordinates medication, hygiene, appointments and diet for a relative, with the information scattered across conversations, paper notes and chat apps. Improve coordination, clarify who owns what, and detect when something important was missed.",
      },
      {
        title: "Getting the technique right at home",
        body: "Physiotherapy exercises, inhalers and wound care are prescribed after a single demonstration. Support the correct sequence, help the user judge whether steps were completed, and prepare questions for the next visit.",
      },
      {
        title: "Knowing when to seek help",
        body: "A person notices a change in symptoms but can't judge whether to keep monitoring, contact a professional, or act urgently. Structure their observations, explain general warning signs from trusted sources, and connect them to human help, without attempting autonomous diagnosis.",
      },
    ],
    demonstrates: [
      {
        label: "Adaptability",
        note: "Works across different people, schedules, abilities and living situations, not one idealised user.",
      },
      {
        label: "Understanding",
        note: "Addresses why the routine fails for this person (comprehension, technique, motivation, coordination), not just that it was forgotten.",
      },
      {
        label: "Context & continuity",
        note: "Takes account of what has already happened: past adherence, previous difficulties, changed circumstances.",
      },
      {
        label: "Explainability",
        note: "The user can see why they are being asked to do something, and where the guidance came from.",
      },
      {
        label: "Uncertainty handling",
        note: "Recognises when it cannot interpret what it is seeing, and says so rather than guessing.",
      },
      {
        label: "Human collaboration",
        note: "Has a clear escalation path to a professional or caregiver, and prepares information for that handover.",
      },
    ],
    success: {
      statement: "Better understanding, technique or adherence than a reminder app achieves.",
      detail:
        "Judges will measure before-and-after: comprehension of instructions, execution of a technique, missed or incorrectly performed steps, caregiver coordination effort, and evidence that the solution can sustain engagement beyond what reminders alone achieve.",
      signals: [
        "Understanding and technique measured before and after",
        "Engagement sustained beyond what reminders achieve",
        "Appropriate escalation whenever the system is uncertain",
      ],
    },
    insufficient: [
      {
        title: "Another habit tracker",
        body: "The most common failure in this domain. Reminders and streaks are the baseline you're judged against, not a solution. Address why the routine fails: understanding, technique, motivation, coordination.",
      },
      {
        title: "Portals and booking clones",
        body: "Generic appointment-booking systems and patient portals that don't address a new problem, unless you demonstrate a substantial new capability.",
      },
    ],
    prohibited: [
      "Autonomous diagnosis",
      "Treatment prescription",
      "Unsupervised medical triage",
      "Any unsupported clinical claim",
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "intelligent-operations",
    title: "Intelligent operations & case work",
    icon: Workflow,
    hook: "Choose this if your primary outcome is reducing delay, error and manual effort in complex case-based work.",
    outcome: "Reducing delay, error and manual effort in complex case-based work.",
    intro: [
      "A billing employee checks an insurer's portal, reads previous follow-up notes and decides what to do next. A finance employee compares an invoice, purchase order and delivery record before approving payment. They aren't copying data or repeating fixed clicks. They gather information from several sources, interpret it in context, apply rules, and decide what happens next.",
      "The challenge: choose one case-based administrative or operational workflow that begins with a request, transaction or exception and ends with a resolved outcome. It should require a person to gather information from multiple sources, interpret it against rules and previous actions, decide or prepare the next step, and maintain context until closure. Build a system that measurably reduces time, error or rework, and that stops when information is missing, an exception occurs, or a decision exceeds its authority.",
    ],
    scope: {
      line: "One case: a single unit of work taken from an initial request, transaction or exception through to a resolved outcome.",
      examples: [
        "An unpaid healthcare claim",
        "A vendor-registration application",
        "An employee reimbursement",
        "A customer complaint",
        "A delayed shipment",
      ],
      note: "A case may stay open for hours, days or weeks, and may involve several people, documents, communications and systems. Improve one case type well rather than attempting a general-purpose operations agent.",
    },
    audiences: [
      {
        label: "Billing & claims staff",
        note: "Chasing unpaid claims across portals, PDFs, status codes and phone calls.",
      },
      {
        label: "Finance teams",
        note: "Matching invoices to purchase orders, payments and approval rules.",
      },
      {
        label: "Administrators",
        note: "Reviewing applications and registrations against eligibility rules.",
      },
      {
        label: "Case handlers",
        note: "Following a complaint or request from first contact to actual closure.",
      },
    ],
    problems: [
      {
        title: "Insurance eligibility and benefit review",
        body: "Whether cover is active, what's covered, what the patient pays, spread across portals, PDFs and phone calls that all phrase it differently. Map varied formats into one structure, explain where each value came from, and flag contradictions for human review.",
      },
      {
        title: "Unpaid-claim follow-up",
        body: "For each unpaid claim someone reviews past actions, interprets new status messages, and decides whether to correct, appeal, call, wait or escalate. Maintain the case history and recommend or prepare the next action.",
      },
      {
        title: "Vendor onboarding and registration",
        body: "A new supplier submits registration forms, tax details, bank information and compliance certificates, each checked against internal policy and existing records before approval. Verify what can be verified, assemble what a reviewer actually needs, and hold the case open until the outstanding documents arrive.",
      },
      {
        title: "Invoice approval",
        body: "An invoice is checked against the purchase order, agreed price, delivered quantity, previous payments, tax details and approval rules. Identify mismatches, assemble the supporting evidence, and recommend approval or review.",
      },
      {
        title: "Customer-complaint resolution",
        body: "A complaint has passed through several employees and channels. Rebuild what was originally asked, what was promised, what was attempted, and identify what actually remains unresolved.",
      },
    ],
    demonstrates: [
      {
        label: "Adaptability",
        note: "Handles different layouts, documents, terminology and input formats without being rewritten for each source.",
      },
      {
        label: "Understanding",
        note: "Recognises equivalent business concepts expressed differently, and flags when similar-looking terms may not be equivalent.",
      },
      {
        label: "Context & continuity",
        note: "Considers previous events, actions and communications before recommending what happens next.",
      },
      {
        label: "Explainability",
        note: "Shows which information was used, where it came from, which rules applied, why an action was chosen, and what was assumed.",
      },
      {
        label: "Uncertainty handling",
        note: "Recognises when the normal process does not apply, or when the available information is insufficient.",
      },
      {
        label: "Human collaboration",
        note: "Requests clarification, approval or specialist help at the right point rather than acting beyond its authority.",
      },
    ],
    success: {
      statement: "Time, manual steps and missed follow-ups per case.",
      detail:
        "Judges will assess improvement to the underlying process, not the polish of the demonstration: time per case, manual steps eliminated, accuracy of captured information, cases completed without rework, time to spot an exception, and accuracy on inputs you have never seen.",
      signals: [
        "Time and steps per case, measured before and after",
        "Holds up on previously unseen inputs",
        "Exceptions recognised and routed, not guessed at",
      ],
    },
    insufficient: [
      {
        title: "A scraper for one website",
        body: "The most common failure in this domain. One portal's layout is not the problem: the varied, changing sources are. Handle different formats and terminology without being rewritten for each.",
      },
      {
        title: "The generic AI employee",
        body: "A general-purpose operations agent that claims to do everything. Take one case type from initial request to closure and improve it well instead.",
      },
      {
        title: "Tested on one prepared example",
        body: "A workflow that only survives its own demo data will not be treated as adaptive or reliable. Expect judges to try inputs you have not seen.",
      },
      {
        title: "A dashboard with a chat box",
        body: "Basic natural-language-to-SQL, or a text box that only selects existing dashboard views. If your solution generates analyses on demand, read Appendix A: the bar is higher than turning text into a chart.",
      },
    ],
    prohibited: [
      "Fully autonomous consequential decisions without safeguards or review",
      "Acting beyond the authority the workflow actually grants the system",
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "inclusive-access",
    title: "Inclusive access to essential services",
    icon: Accessibility,
    hook: "Choose this if your primary outcome is helping people understand and successfully use an essential service.",
    outcome: "Helping people understand and successfully use an essential service.",
    intro: [
      "Essential services now run through apps, forms, automated calls and digital documents, and many people cannot use them because of language, literacy, disability, age or sheer complexity. A technically functional service is not an accessible one: people must be able to understand the interaction, correct misunderstandings, give informed consent, and reach a human when automation fails.",
      "The challenge: pick one essential-service interaction that a specific, identified group of users currently cannot complete without help, and establish why. Build a system that enables them to complete it independently or with appropriate support, with the ability to check and correct what the system understood, and a working route to a human when it fails.",
    ],
    scope: {
      line: "One service interaction: a bounded exchange between a person and an institution that has a defined completion state.",
      examples: [
        "Understanding a hospital discharge summary and acting on it",
        "Submitting a pension claim",
        "Giving informed consent to a procedure",
        "Disputing an incorrect utility bill",
        "Completing a scholarship application",
      ],
      note: "Name the affected group specifically: 'elderly Malayalam-speaking users with low text literacy', not 'people who find technology difficult'.",
    },
    audiences: [
      {
        label: "Elderly users",
        note: "Navigating pensions, hospital paperwork and digital-first services late in life.",
      },
      {
        label: "People with disabilities",
        note: "Visual, hearing, motor or cognitive. Failed by one-size-fits-all interfaces.",
      },
      {
        label: "Low-literacy users",
        note: "Fluent out loud, excluded the moment the interface demands reading.",
      },
      {
        label: "Multilingual users",
        note: "Switching between Malayalam, English and official jargon mid-sentence.",
      },
    ],
    problems: [
      {
        title: "Explaining complex documents",
        body: "A health, insurance, financial or government document arrives and the person can't tell what it means, what action is required, or by when. Explain it in accessible language, keep the details that carry consequences, cite the original text, and confirm it was understood.",
      },
      {
        title: "Forms by conversation",
        body: "A low-literacy or elderly user can explain their requirement out loud but can't navigate a long application form. Turn conversation into structured information the user reviews and corrects before anything is submitted.",
      },
      {
        title: "Malayalam, English and everything between",
        body: "People naturally mix Malayalam, English and official terms when giving names, dates, medications and numbers. Handle it accurately, identify low-confidence interpretations, and ask for confirmation on exactly those items.",
      },
      {
        title: "Interfaces designed around a disability",
        body: "A standard interface is difficult or impossible for someone with a visual, hearing, motor or cognitive disability. Build an alternative interaction method designed and tested around one specific group's requirements.",
      },
      {
        title: "A hand-off that actually works",
        body: "An automated system misunderstands a user repeatedly but keeps going, with no meaningful route to a person. Detect the failure, summarise the interaction, and transfer with everything already provided carried across.",
      },
      {
        title: "Consent that means something",
        body: "People accept treatment plans, financial obligations and consent forms they don't understand. Present the information accessibly and verify comprehension before consent is recorded.",
      },
    ],
    demonstrates: [
      {
        label: "Adaptability",
        note: "Works across the real variation in how the target group speaks, reads, hears and interacts.",
      },
      {
        label: "Understanding",
        note: "Simplifies without dropping or distorting consequential details, and handles mixed languages and informal phrasing.",
      },
      {
        label: "Context & continuity",
        note: "Retains what the user has already provided across turns, sessions and channels.",
      },
      {
        label: "Explainability",
        note: "The user can see what the system understood, and trace any explanation back to the original source text.",
      },
      {
        label: "Uncertainty handling",
        note: "Surfaces low-confidence interpretations for confirmation instead of proceeding silently.",
      },
      {
        label: "Human collaboration",
        note: "Detects its own failure and hands off to a person with full context preserved.",
      },
    ],
    success: {
      statement: "Task completion and comprehension for a specific underserved group.",
      detail:
        "Judges will look for the named user group completing the real task: completion rate, measured improvement in comprehension, correct handling of low-confidence interpretations, and an escalation path to a human that works end to end.",
      signals: [
        "Tested with at least one representative user",
        "Comprehension measurably improved, not assumed",
        "A human hand-off that works, with context intact",
      ],
    },
    insufficient: [
      {
        title: "A translation API in a new interface",
        body: "The most common failure in this domain. Swapping the language of a broken flow doesn't change who can complete it. Handle mixed languages, informal phrasing and low-confidence items.",
      },
      {
        title: "The generic FAQ chatbot",
        body: "FAQ bots, booking bots, call routing and transcription that don't address a new user problem. Show what a named group can now finish that they couldn't before.",
      },
      {
        title: "Accessibility without a user",
        body: "'People who find technology difficult' is not a user group. Name one specifically, such as elderly Malayalam-speaking users with low text literacy, and test with a representative user.",
      },
      {
        title: "Automation with no way out",
        body: "A system that misunderstands repeatedly but keeps going. Detect your own failure, summarise the interaction, and hand off to a human with context preserved.",
      },
    ],
    prohibited: [
      "Sales and lead-conversion bots",
      "Fully automated high-consequence decisions",
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "digital-trust",
    title: "Digital trust & scam resilience",
    icon: ShieldAlert,
    hook: "Choose this if your primary outcome is helping people resist and recover from digital deception.",
    outcome: "Helping people resist and recover from digital deception.",
    intro: [
      "Digitally enabled fraud now runs on urgency, impersonation and emotional pressure more than technical attacks. Security tools protect infrastructure. They rarely help at the moment a person must decide: is this request genuine? Should I pay this? How do I verify who sent it? What do I do now that I've been deceived?",
      "The challenge: pick one decision moment where a person must judge whether a request is genuine, or one recovery moment immediately after they've been deceived. Improve that specific moment by interrupting, verifying, explaining or guiding, without blocking legitimate activity and without demanding surveillance of private communications.",
    ],
    scope: {
      line: "One decision or recovery moment: a point where a person acts on a request whose authenticity is uncertain, or responds to a deception already under way.",
      examples: [
        "Approving an urgent transfer requested by a 'senior colleague'",
        "Paying an invoice with changed bank details",
        "Responding to a caller claiming to be from a bank",
        "The first thirty minutes after realising an account is compromised",
      ],
      note: "Define what the person sees, what they currently do, how much time they have, and what it costs when they get it wrong.",
    },
    audiences: [
      {
        label: "Individuals under pressure",
        note: "Deciding in seconds whether an urgent request is genuine.",
      },
      {
        label: "Vulnerable family members",
        note: "Targeted at home by impersonation, bank-support and 'digital arrest' scams.",
      },
      {
        label: "Employees who pay",
        note: "Approving transfers and invoices that look entirely legitimate.",
      },
      {
        label: "Small organisations",
        note: "Facing the same fraud as enterprises, with no security staff.",
      },
    ],
    problems: [
      {
        title: "Urgent payment impersonation",
        body: "An 'urgent' payment instruction arrives from what looks like a senior colleague, customer or vendor, with convincing contextual detail. Introduce proportionate verification, approval or cooling-off steps, without obstructing legitimate work.",
      },
      {
        title: "Changed bank details on an invoice",
        body: "A small organisation receives an invoice that looks genuine but carries modified payment details. Compare it against previous transactions and trusted records, and explain specifically why verification is warranted.",
      },
      {
        title: "Protecting a parent, respecting their privacy",
        body: "An older adult is pressured by an impersonation or 'digital arrest' scam, and family members want to help without reading their messages. Provide privacy-respecting warnings, trusted-contact escalation, or guided verification the user performs themselves.",
      },
      {
        title: "The first hours after the loss",
        body: "Money is gone or an account is compromised, and the victim doesn't know who to contact first, what evidence to preserve, or what recovery is still possible. Provide a guided, time-sensitive response sequence for the critical window.",
      },
      {
        title: "Warnings people can act on",
        body: "A tool labels a message fraudulent without saying why, or declares it safe with false confidence. Users learn to ignore both. Communicate uncertainty honestly, point to the specific suspicious evidence, and recommend verification proportionate to the risk.",
      },
      {
        title: "Small-business incident response",
        body: "After phishing or an account takeover, employees at a small organisation respond inconsistently and destroy evidence in the process. Guide containment, documentation, reporting and recovery.",
      },
    ],
    demonstrates: [
      {
        label: "Adaptability",
        note: "Works across channels and scam variants, not one message template collected in advance.",
      },
      {
        label: "Understanding",
        note: "Identifies the manipulation pattern and the specific evidence behind a judgement, rather than matching keywords.",
      },
      {
        label: "Context & continuity",
        note: "Uses prior relationships, previous transactions and normal behaviour to judge what is anomalous.",
      },
      {
        label: "Explainability",
        note: "States what is suspicious, why it matters, and how confident it is, in terms a pressured non-expert can act on.",
      },
      {
        label: "Uncertainty handling",
        note: "Handles false positives and false negatives deliberately, and never claims certainty it does not have.",
      },
      {
        label: "Human collaboration",
        note: "Routes to a trusted contact, colleague or institution, and supports approval and cooling-off rather than deciding alone.",
      },
    ],
    success: {
      statement: "Do users verify appropriately under pressure, and recover quickly when deception succeeds?",
      detail:
        "Judges will measure the moment: whether users verify appropriately without excessive friction, how honestly uncertainty is communicated, how false positives and false negatives are each handled, and how quickly an incident is reported and contained after a loss.",
      signals: [
        "Verification proportionate to the risk, not friction on everything",
        "Uncertainty stated honestly, with the evidence shown",
        "Protection achieved without invasive monitoring",
      ],
    },
    insufficient: [
      {
        title: "Fraud detection without evidence",
        body: "The most common failure in this domain. A verdict with no reasoning ('fraudulent', 'safe') teaches users to ignore every warning. Show the evidence and state your confidence.",
      },
      {
        title: "The definitive black box",
        body: "Deepfake detection presented as definitive, automatic blocking with no review path, generic vulnerability scanners and conventional security dashboards. Never present a judgement as more certain than it is.",
      },
      {
        title: "Friction that blocks real work",
        body: "Verification that obstructs legitimate payments gets switched off within a week. Use proportionate steps: cooling-off, second approvals, checks through a channel the attacker doesn't control.",
      },
    ],
    prohibited: [
      "Offensive hacking",
      "Malware development",
      "Credential harvesting",
      "Tools that claim to guarantee authenticity",
      "Designs that expose users to unnecessary surveillance of private communications",
    ],
    links: { guide: null, pdf: null },
  },
];

// The six standards that sit above all four domains. Judges apply them to
// every submission, so every brief links back here.
export const EXPECTATIONS = [
  {
    title: "Start with a specific problem",
    body: "State the user experiencing the problem, the situation it occurs in, how it is currently handled, why that fails, what the failure costs, and the assumption you intend to test.",
    note: "'An AI healthcare assistant', 'a business agent' and 'a cybersecurity platform' are not problem statements.",
  },
  {
    title: "Build for a bounded workflow",
    body: "Solve one important problem well rather than automating an industry. Define your inputs, expected outputs, permitted actions, failure conditions, human-review points and success metrics.",
    note: null,
  },
  {
    title: "Handle uncertainty honestly",
    body: "Systems must not produce confident answers when information is incomplete or ambiguous. Address confidence, verification, missing information, conflicting sources, human escalation, auditability, and correction or rollback.",
    note: null,
  },
  {
    title: "Demonstrate more than a prepared example",
    body: "Test against variation, exceptions and inputs you have never seen. A system that only works on the exact example you developed against will not be treated as adaptive or reliable.",
    note: "Judges will try inputs you have not seen.",
  },
  {
    title: "Protect users",
    body: "Projects touching health, financial, communication or personal data must apply appropriate safeguards. Avoid unsupported medical claims, unnecessary collection of sensitive data, autonomous consequential decisions without review, misleading accuracy claims, and designs that make human help harder to reach.",
    note: null,
  },
  {
    title: "Show material differentiation",
    body: "You are not expected to invent a new category of technology, but reproducing an existing product behind a new interface is not enough. If your project resembles something that exists, show a material improvement: an overlooked user group, an underserved environment, variation existing automation cannot handle, better accessibility or comprehension, lower cost or effort, better reliability or explainability, an unresolved part of the user journey, safer human collaboration, or generalisation across workflows.",
    note: "Not sufficient on its own: replacing a form with a chatbot, adding voice without improving accessibility, another appointment scheduler, a basic claims dashboard, connecting an LLM to company documents, a fixed scraper for one website, a generic agent that claims to do everything.",
  },
];

// Extra bar for submissions that generate analyses, charts or data-driven
// answers on demand. Applies in any domain; most common in Intelligent
// Operations, whose "a dashboard with a chat box" entry points here.
export const ANALYTICS_APPENDIX = {
  applies:
    "Read this only if your solution generates analyses, charts or data-driven answers on demand. It applies in any domain, and is most common in Intelligent Operations.",
  intro:
    "Managers ask questions no dashboard covers. Which insurers and denial categories drove claims ageing past 90 days last quarter? Which stages cause the greatest delay in application processing? Which complaint categories are repeatedly reopened? The challenge is not turning text into a chart. It is understanding the organisation's data, the meaning of the question, and whether the resulting analysis is actually valid.",
  criteria: [
    {
      label: "Business language",
      note: "Interpreting organisational terminology rather than database column names, and recognising when related terms differ in meaning.",
    },
    {
      label: "Ambiguity clarification",
      note: "Asking when a question has multiple reasonable readings. Does 'this quarter' mean the calendar or the financial quarter?",
    },
    {
      label: "Data selection",
      note: "Determining which sources, fields, filters and relationships the question actually needs.",
    },
    {
      label: "Valid analysis",
      note: "Choosing a defensible calculation or comparison, not an arbitrary aggregation.",
    },
    {
      label: "Visual selection",
      note: "A chart, table or other form suited to the question and the data.",
    },
    {
      label: "Verification",
      note: "Letting users inspect source records, query, filters, calculations, transformations and assumptions.",
    },
    {
      label: "Analytical context",
      note: "Understanding follow-ups: 'show only Kerala', 'compare with last quarter', 'break this down by team', 'why did this increase?'",
    },
    {
      label: "Misleading conclusions",
      note: "Flagging insufficient data, missing periods, duplicates, inappropriate comparisons, small samples, conflicting metric definitions, and correlation presented as causation.",
    },
  ],
  notSufficient: [
    "A fixed dashboard with pre-built charts",
    "A text box that only selects existing dashboard views",
    "Basic natural-language-to-SQL",
    "A chart generated without explaining its calculation",
    "Analysis on one carefully prepared dataset",
    "Conclusions without source traceability",
    "Visuals that hide missing data, assumptions or failed queries",
  ],
  measures: [
    "Accuracy of generated calculations",
    "Appropriateness of generated visuals",
    "Accuracy across follow-up questions",
    "User comprehension of the analysis",
    "Percentage of conclusions traceable to source data",
  ],
};
