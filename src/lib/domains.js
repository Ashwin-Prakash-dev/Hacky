import { Accessibility, HeartPulse, ShieldAlert, Workflow } from "lucide-react";

// The four Startathon challenge domains, transcribed from the official
// "Startathon — Problem Domains" document. This file is the single source
// of truth for every string the /domains route renders — the comparison
// table, the per-domain briefs, the shared expectations and the analytics
// appendix all read from here. Wording is quoted directly from the source
// document; the only additions are what the UI needs structurally (chip
// labels decomposed from a single sentence, a numeral, an icon).
//
// `links.guide` / `links.pdf` light up the "want more detail" CTAs at the
// end of each brief once the complete guide / PDF exist. Leave null until then.
export const DOMAINS = [
  {
    slug: "preventive-health",
    number: 1,
    title: "Preventive Health and Everyday Care",
    icon: HeartPulse,

    // Comparison-table row values (page 1), quoted exactly.
    outcome: "Improving health behaviour or care outside a healthcare facility",
    audienceLine: "Patients, caregivers, families",
    comparisonExamples: [
      "Turning discharge instructions into a workable daily routine",
      "Learning a correct brushing or inhaler technique",
      "Coordinating care across family members",
    ],
    successLine: "Better understanding, technique or adherence than a reminder app achieves",
    pitfallLine: "Building another habit tracker",

    hook: "Choose this if your primary outcome is improving health behaviour or care outside a healthcare facility.",

    // Overview → Central Challenge → What Counts as One Problem, in order.
    intro: [
      "Many health outcomes depend on what people do outside hospitals, clinics and dental practices. Patients and caregivers receive instructions, recommendations or treatment plans but struggle to apply them consistently in daily life. Existing solutions rely mainly on reminders and notifications, without addressing understanding, technique, motivation, coordination or changing circumstances.",
      "This domain focuses on helping people carry out everyday health-related activities more effectively, develop practical skills, and recognise when professional help is needed.",
      "The Central Challenge: choose one health-related activity that a specific person must perform correctly and repeatedly outside a clinical setting, and where doing it wrong or inconsistently has real consequences. Build a system that measurably improves how well that activity is understood, performed or sustained — and that escalates to a human professional when it should.",
      "What counts as one problem: one health routine — a bounded set of actions a person must carry out over time to achieve a health outcome. Examples: a post-surgical recovery routine, a child's twice-daily oral-care routine, an elderly parent's medication schedule managed by three family members, a prescribed physiotherapy programme. A routine has a defined owner, a defined frequency, a correct method, and an observable failure mode. If you cannot state all four, narrow your problem further.",
    ],

    // Decomposed from the comparison-table audience line ("Patients,
    // caregivers, families") with one line of grounding per group, drawn
    // from the Overview and Representative Problems.
    audiences: [
      { label: "Patients", note: "Applying medication, technique and recovery instructions outside a clinical setting." },
      { label: "Caregivers", note: "Coordinating medication, hygiene, appointments and diet for someone else." },
      { label: "Families", note: "Splitting one routine across people, notes and messaging apps." },
    ],

    problems: [
      {
        title: "Turning healthcare instructions into daily action.",
        body: "A patient leaves a consultation with instructions on medication, diet, hygiene, exercise and follow-up. They understand each one individually but cannot convert them into a practical routine that fits their day.",
        solution: "A solution could organise instructions, identify dependencies and conflicts, adapt the routine to the person's actual schedule, and record difficulties for discussion with a professional.",
      },
      {
        title: "Improving preventive oral-care techniques.",
        body: "Children and adults may brush regularly but use ineffective technique, miss areas, or stop too early.",
        solution: "A solution could help users learn and practise correct technique and give understandable feedback — without claiming to diagnose dental conditions.",
      },
      {
        title: "Supporting family caregivers.",
        body: "One family member coordinates medication, hygiene, appointments, diet and daily activities for an elderly relative, child or person with a disability. The information lives in conversations, paper notes and messaging apps.",
        solution: "A solution could improve coordination, clarify who is responsible for what, and detect when an important action has been missed.",
      },
      {
        title: "Supporting prescribed physical techniques.",
        body: "Patients are asked to perform physiotherapy exercises, use inhalers or follow wound-care procedures at home, often after a single demonstration.",
        solution: "A solution could support the correct sequence, help the user judge whether steps were completed, and prepare questions for the next consultation.",
      },
      {
        title: "Understanding when to seek help.",
        body: "A person notices a change in symptoms or behaviour but cannot judge whether to keep monitoring, contact a professional, or seek urgent help.",
        solution: "A solution could structure their observations, explain general warning signs from trusted sources, and connect them to appropriate human assistance — without attempting autonomous diagnosis.",
      },
    ],

    mustDemonstrate: [
      { label: "Adaptability", body: "Works across different people, schedules, abilities and living situations, not one idealised user." },
      { label: "Understanding", body: "Addresses why the routine fails for this person (comprehension, technique, motivation, coordination), not just that it was forgotten." },
      { label: "Context and continuity", body: "Takes account of what has already happened: past adherence, previous difficulties, changed circumstances." },
      { label: "Explainability", body: "The user can see why they are being asked to do something and where the guidance came from." },
      { label: "Uncertainty and exception handling", body: "Recognises when it cannot interpret what it is seeing, and says so rather than guessing." },
      { label: "Human collaboration", body: "Has a clear, appropriate escalation path to a professional or caregiver, and prepares information for that handover." },
    ],

    inScope: [
      "Health education", "comprehension of instructions", "practical skill development",
      "behavioural support", "caregiver collaboration", "personal health routines",
      "self-monitoring", "non-diagnostic escalation", "human-in-the-loop support",
      "accessibility for elderly, disabled and low-literacy users",
    ],

    pitfalls: {
      mostCommon: "Building another habit tracker",
      insufficient: [
        "Basic reminder or habit-tracking applications",
        "Generic appointment-booking systems",
        "Patient portals that do not address a new problem",
      ],
      notPermitted: [
        "Autonomous diagnosis",
        "Treatment prescription",
        "Unsupervised medical triage",
        "Any unsupported clinical claim",
      ],
    },

    success: {
      statement: "Better understanding, technique or adherence than a reminder app achieves.",
      measures: [
        "Improvement in understanding of instructions (measured before and after)",
        "Improvement in execution of a technique",
        "Reduction in missed or incorrectly performed steps",
        "Reduction in caregiver coordination effort",
        "Engagement sustained beyond what a basic reminder system achieves",
        "Rate of appropriate escalation when the system is uncertain",
        "Safe and transparent handling of health information",
      ],
    },

    links: { guide: null, pdf: null },
  },

  {
    slug: "intelligent-operations",
    number: 2,
    title: "Intelligent Operations and Case Work",
    icon: Workflow,

    outcome: "Making complex organisational work adaptive, intelligent and efficient",
    audienceLine: "Employees who process cases",
    comparisonExamples: [
      "Following up unpaid insurance claims",
      "Matching invoices to purchase orders",
      "Reviewing university applications",
    ],
    successLine: "Time, manual steps and missed follow-ups per case",
    pitfallLine: "Building a scraper for one website",

    hook: "Choose this if your primary outcome is making complex organisational work adaptive, intelligent and efficient.",

    intro: [
      "Many important organisational processes are still completed manually. A billing employee checks an insurer's portal, reads previous follow-up notes and decides what to do next. A finance employee compares an invoice, purchase order and delivery record before approving payment. A university administrator reviews forms and certificates against eligibility rules.",
      "In each case the person is not just copying data or repeating a fixed sequence of clicks. They must understand the required outcome, gather information from several sources, interpret it in context, apply rules, and decide what should happen next.",
      "The Central Challenge: choose one real administrative or operational process in which a person currently has to collect information from multiple sources, understand what it means, compare it against rules or previous actions, decide the next step, update a system or communicate a result, and follow the case until it is closed. Build a system that meaningfully improves one or more parts of that process. It may assist the employee, prepare work for review, or safely perform a bounded set of actions — and it must recognise when it lacks the information or authority to proceed.",
      "What counts as one problem: one case — a single unit of work taken from an initial request, transaction or problem to a completed outcome. Examples: an unpaid healthcare claim, an insurance approval request, a customer complaint, a vendor-registration application, an employee reimbursement, an invoice awaiting approval, a delayed shipment. A case may stay open for hours, days or weeks, and may involve multiple people, documents, communications and software systems. Improve one case type well rather than attempting a general-purpose operations agent.",
    ],

    // Personas named directly in the Overview and Representative Problems.
    audiences: [
      { label: "Billing employees", note: "Checking an insurer's portal and deciding what a claim needs next." },
      { label: "Finance employees", note: "Comparing invoices, purchase orders and delivery records before approving payment." },
      { label: "Administrators", note: "Reviewing forms and certificates against eligibility rules." },
      { label: "Case handlers", note: "Reconstructing a case's history across people and channels to resolve it." },
    ],

    problems: [
      {
        title: "Insurance eligibility and benefit review.",
        body: "Before treatment, a practice must establish whether cover is active, what is covered, whether limitations apply, what the patient will pay, and whether prior approval is needed. The information appears differently across insurer portals, PDFs, electronic responses and phone calls.",
        solution: "A solution could map varied source formats into one structure, explain how each value was identified, flag contradictions, and prepare the result for human review. A fixed scraper for one insurer's website is not sufficient.",
      },
      {
        title: "Unpaid-claim follow-up.",
        body: "An employee manages claims that have not been paid. For each one they must review previous actions, check the portal, interpret status messages, work out whether documentation is missing, and decide whether to correct, appeal, call, wait or escalate.",
        solution: "A solution could maintain the case history, interpret new responses, and recommend or prepare the next action.",
      },
      {
        title: "Payment reconciliation.",
        body: "Payment information arrives from insurers, banks, remittance files and internal systems. Employees must work out which payment belongs to which claim, whether amounts are correct, whether payments were split or combined, and why records disagree.",
        solution: "A solution could propose matches, explain its reasoning, and route uncertain cases for investigation.",
      },
      {
        title: "Invoice approval.",
        body: "A finance employee compares an invoice against the purchase order, agreed price, delivered quantity, previous payments, tax details and internal approval rules.",
        solution: "A solution could identify mismatches, assemble the supporting evidence, and recommend approval or review.",
      },
      {
        title: "Customer-complaint resolution.",
        body: "A complaint has passed through several employees and channels. The person now handling it must reconstruct what was originally asked, what has already been promised, what was attempted, and whether the stated resolution actually solved the problem.",
        solution: "A solution could rebuild the history, identify what remains unresolved, and recommend the next action.",
      },
    ],

    mustDemonstrate: [
      { label: "Adaptability", body: "Handles different layouts, documents, terminology and input formats without being rewritten for each source, and can be configured for related workflows." },
      { label: "Understanding", body: "Recognises equivalent business concepts expressed differently, and flags when similar terms may not be equivalent." },
      { label: "Context and continuity", body: "Considers previous events, actions and communications before recommending what happens next." },
      { label: "Explainability", body: "Shows which information was used, where it came from, which rules were applied, why an action was chosen, and what was assumed." },
      { label: "Uncertainty and exception handling", body: "Recognises when the normal process does not apply or the available information is insufficient." },
      { label: "Human collaboration", body: "Requests clarification, approval or specialist help at the right point, rather than acting beyond its authority." },
    ],

    inScope: [
      "Case management", "multi-source information collection", "understanding documents, portals and communications",
      "mapping varied information into a common structure", "rule- and policy-aware assistance", "stateful follow-up",
      "exception detection", "work prioritisation", "reconciliation", "human review and approval",
      "explainable recommendations", "bounded automation", "on-demand analytical investigation",
    ],

    pitfalls: {
      mostCommon: "Building a scraper for one website",
      insufficient: [
        "A scraper built for one webpage",
        "Basic OCR and field extraction",
        "Simple CSV, JSON or database transformation",
        "A fixed series of automated clicks",
        "A chatbot that only answers questions from documents",
        "A dashboard that only lists pending work",
        "A generic \"AI employee\"",
        "A workflow tested only against one prepared example",
      ],
      notPermitted: ["Fully autonomous consequential decisions without safeguards or review"],
    },

    success: {
      statement: "Time, manual steps and missed follow-ups — per case.",
      measures: [
        "Time required per case",
        "Number of manual steps eliminated",
        "Accuracy of information captured",
        "Reduction in missed follow-ups",
        "Cases completed without rework",
        "Time taken to identify an exception",
        "Percentage of work safely prepared or completed",
        "Accuracy on previously unseen inputs",
      ],
    },

    links: { guide: null, pdf: null },
  },

  {
    slug: "inclusive-access",
    number: 3,
    title: "Inclusive and Trustworthy Access",
    fullTitle: "Inclusive and Trustworthy Access to Essential Services",
    icon: Accessibility,

    outcome: "Helping people understand and successfully use an essential service",
    audienceLine: "People excluded by language, literacy, disability, age or complexity",
    comparisonExamples: [
      "Explaining an official document and confirming it was understood",
      "Completing a form by conversation",
      "Reliable hand-off to a human",
    ],
    successLine: "Task completion and comprehension for a specific underserved group",
    pitfallLine: "Wrapping a translation API in a new interface",

    hook: "Choose this if your primary outcome is helping people understand and successfully use an essential service.",

    intro: [
      "Essential services increasingly depend on apps, websites, forms, automated calls and digital documents. Many people cannot use these effectively because of language, literacy, disability, age, unfamiliarity with technology, or the sheer complexity of the information.",
      "A technically functional service is not necessarily an accessible one. People must be able to understand the interaction, correct misunderstandings, give informed consent, and reach a human when automation fails. This domain covers healthcare, government, education, finance, utilities and other essential services.",
      "The Central Challenge: choose one essential-service interaction that a specific, identified group of users currently cannot complete without help, and establish why. Build a system that lets them complete it themselves — with the ability to check and correct what the system understood, and a working route to a human when it fails.",
      "What counts as one problem: one service interaction — a bounded exchange between a person and an institution that has a defined completion state. Examples: understanding a hospital discharge summary and acting on it, submitting a pension claim, giving informed consent to a procedure, disputing an incorrect utility bill, completing a scholarship application. You must name the affected user group specifically — \"elderly Malayalam-speaking users with low text literacy\", not \"people who find technology difficult\" — and you should test with at least one representative user.",
    ],

    // Decomposed directly from the comparison line's exclusion criteria.
    audiences: [
      { label: "Excluded by language", note: "Communicating in Malayalam, English, or naturally mixing both." },
      { label: "Excluded by literacy", note: "Fluent out loud, unable to navigate a long written form." },
      { label: "Excluded by disability", note: "Visual, hearing, motor or cognitive — failed by a standard interface." },
      { label: "Excluded by age or complexity", note: "Unfamiliar with technology, or facing information too complex to parse." },
    ],

    problems: [
      {
        title: "Understanding complex documents.",
        body: "A person receives a health, insurance, financial or government document and cannot tell what it means, what action is required, which deadline applies, or what happens if they do nothing.",
        solution: "A solution could explain it in accessible language, preserve the details that matter, cite the original text for each explanation, and confirm the person has understood.",
      },
      {
        title: "Completing services through natural communication.",
        body: "A low-literacy or elderly user can explain their requirement out loud but cannot navigate a long application form.",
        solution: "A solution could turn a conversation into structured information, and let the user review and correct it before anything is submitted.",
      },
      {
        title: "Supporting multilingual and code-switched interaction.",
        body: "Users naturally mix Malayalam, English and domain-specific terms when giving names, dates, addresses, medications or official numbers.",
        solution: "A solution could handle this accurately, identify low-confidence interpretations, and ask for confirmation on exactly those items.",
      },
      {
        title: "Making services usable for people with disabilities.",
        body: "A standard interface is difficult or impossible to use for someone with a visual, hearing, motor or cognitive disability.",
        solution: "A solution could provide an alternative interaction method designed and tested around one specific group's requirements.",
      },
      {
        title: "Creating reliable human hand-offs.",
        body: "An automated system misunderstands a user repeatedly but keeps going, with no meaningful route to a person.",
        solution: "A solution could detect the failure, summarise the interaction, transfer the user, and carry across everything already provided.",
      },
      {
        title: "Confirming meaningful understanding.",
        body: "People accept treatment plans, financial obligations or consent forms they do not understand.",
        solution: "A solution could present the information accessibly and verify comprehension before consent is recorded.",
      },
    ],

    mustDemonstrate: [
      { label: "Adaptability", body: "Works across the real variation in how the target group speaks, reads, hears and interacts." },
      { label: "Understanding", body: "Simplifies without dropping or distorting consequential details; handles mixed languages and informal phrasing." },
      { label: "Context and continuity", body: "Retains what the user has already provided across turns, sessions and channels." },
      { label: "Explainability", body: "The user can see what the system understood and trace an explanation back to the original source text." },
      { label: "Uncertainty and exception handling", body: "Surfaces low-confidence interpretations for confirmation instead of proceeding silently." },
      { label: "Human collaboration", body: "Detects its own failure and hands off to a person with full context preserved." },
    ],

    inScope: [
      "Accessible and multimodal interfaces", "multilingual communication", "code-switching",
      "information simplification", "comprehension verification", "source attribution",
      "user correction and confirmation", "consent-aware systems", "detection of failed automated interactions",
      "context-preserving hand-off", "offline-first access",
    ],

    pitfalls: {
      mostCommon: "Wrapping a translation API in a new interface",
      insufficient: [
        "A generic FAQ chatbot",
        "A standard appointment-booking bot",
        "Basic call routing or IVR",
        "Call transcription without a new user problem being solved",
        "A translation API placed behind a new interface",
        "Accessibility claims made without a specific affected user group in mind",
      ],
      notPermitted: ["Sales and lead-conversion bots", "Fully automated high-consequence decisions"],
    },

    success: {
      statement: "Task completion and comprehension for a specific underserved group.",
      measures: [
        "Task-completion rate for the identified user group",
        "Measured improvement in comprehension",
        "Accuracy of user correction and confirmation steps",
        "Correct handling of low-confidence results",
        "Results of accessibility testing with real users",
        "Whether the human escalation path actually works end to end",
        "Preservation of context and consent across the interaction",
      ],
    },

    links: { guide: null, pdf: null },
  },

  {
    slug: "digital-trust",
    number: 4,
    title: "Digital Trust and Scam Resilience",
    icon: ShieldAlert,

    outcome: "Helping people resist and recover from digital deception",
    audienceLine: "Individuals and small organisations facing fraud",
    comparisonExamples: [
      "Verifying an urgent payment request",
      "Detecting changed bank details on an invoice",
      "Guided recovery after money is lost",
    ],
    successLine: "Whether users pause and verify — and recover well when they don't",
    pitfallLine: "Claiming to detect fraud without explaining the evidence",

    hook: "Choose this if your primary outcome is helping people resist and recover from digital deception.",

    intro: [
      "Digitally enabled fraud increasingly relies on urgency, impersonation and emotional pressure rather than purely technical attacks. Individuals and small organisations receive fraudulent calls, messages, invoices and payment instructions through channels they normally trust.",
      "Existing security tools focus on technical infrastructure. They rarely help at the moment a person must decide: is this request genuine? Should I pay this? How do I verify who sent it? What do I do now that I've been deceived?",
      "The Central Challenge: choose one decision moment at which a person must judge whether a request is genuine, or one recovery moment immediately after they have been deceived. Build a system that improves that specific moment — by interrupting, verifying, explaining or guiding — without blocking legitimate activity and without demanding surveillance of private communications.",
      "What counts as one problem: one decision or recovery moment — a point where a person acts on a request whose authenticity is uncertain, or responds to a deception already under way. Examples: approving an urgent transfer requested by a \"senior colleague\", paying an invoice with changed bank details, responding to a caller claiming to be from a bank, the first thirty minutes after realising an account is compromised. Define what the person sees, what they currently do, how much time they have, and what it costs when they get it wrong.",
    ],

    // "Individuals and small organisations" from the comparison line, plus
    // the vulnerable-user and no-security-staff groups named directly under
    // Opportunity Areas.
    audiences: [
      { label: "Individuals", note: "Deciding in seconds whether an urgent request is genuine." },
      { label: "Vulnerable users", note: "Targeted by impersonation and \"digital arrest\" scams, protected without surveillance." },
      { label: "Small organisations", note: "Receiving fraudulent invoices and payment instructions through trusted channels." },
      { label: "Organisations with no security staff", note: "Needing incident response they can run themselves." },
    ],

    problems: [
      {
        title: "Urgent payment impersonation.",
        body: "An employee receives an urgent payment instruction that appears to come from a senior colleague, customer or vendor, by email, message or voice, with convincing contextual detail.",
        solution: "A solution could introduce proportionate verification, approval or cooling-off steps — without obstructing legitimate work.",
      },
      {
        title: "Changed invoice or bank information.",
        body: "A small organisation receives an invoice that looks genuine but carries modified payment details.",
        solution: "A solution could compare it against previous transactions and trusted records, and explain specifically why verification is warranted.",
      },
      {
        title: "Protecting vulnerable family members.",
        body: "An older adult is pressured by an impersonation, bank-support or \"digital arrest\" scam. Family members want to help without reading their private messages.",
        solution: "A solution could provide privacy-respecting warnings, trusted-contact escalation, or guided verification the user performs themselves.",
      },
      {
        title: "Responding after money or access is lost.",
        body: "A victim knows money has gone or an account is compromised, but not who to contact first, what evidence to preserve, which accounts to secure, or what recovery is still possible.",
        solution: "A solution could provide a guided, time-sensitive response sequence for the first critical hours.",
      },
      {
        title: "Explaining uncertain warnings.",
        body: "A tool labels a message fraudulent without saying why, or declares it safe with false confidence. Users learn to ignore both.",
        solution: "A solution could communicate uncertainty honestly, point to the specific suspicious evidence, and recommend verification proportionate to the risk.",
      },
      {
        title: "Small-business incident response.",
        body: "After phishing or account takeover, employees at a small organisation respond inconsistently and destroy evidence in the process.",
        solution: "A solution could guide containment, documentation, reporting and recovery.",
      },
    ],

    mustDemonstrate: [
      { label: "Adaptability", body: "Works across channels and scam variants, not one message template collected in advance." },
      { label: "Understanding", body: "Identifies the manipulation pattern and the specific evidence behind a judgement, rather than matching keywords." },
      { label: "Context and continuity", body: "Uses prior relationships, previous transactions and normal behaviour to judge what is anomalous." },
      { label: "Explainability", body: "States what is suspicious, why it matters, and how confident it is, in terms a pressured non-expert can act on." },
      { label: "Uncertainty and exception handling", body: "Handles false positives and false negatives deliberately; never claims certainty it does not have." },
      { label: "Human collaboration", body: "Routes to a trusted contact, colleague or institution, and supports approval and cooling-off rather than deciding alone." },
    ],

    inScope: [
      "Social-engineering protection", "identity and payment verification", "trusted-contact mechanisms",
      "dual approval and cooling-off workflows", "provenance checks", "cross-channel verification",
      "guided incident reporting", "evidence preservation", "recovery and containment",
      "explainable risk warnings", "education embedded in real decisions",
    ],

    pitfalls: {
      mostCommon: "Claiming to detect fraud without explaining the evidence",
      insufficient: [
        "Generic vulnerability scanners",
        "Conventional security dashboards",
        "Black-box deepfake detection presented as definitive",
        "Automatic blocking without a review path",
      ],
      notPermitted: [
        "Offensive hacking",
        "Malware development",
        "Credential harvesting",
        "Tools that claim to guarantee authenticity",
        "Designs that expose users to unnecessary surveillance",
      ],
    },

    success: {
      statement: "Whether users pause and verify — and recover well when they don't.",
      measures: [
        "Whether users actually pause and verify suspicious requests",
        "Clarity of communicated uncertainty",
        "False-positive and false-negative rates, and how each is handled",
        "Time to report or contain an incident",
        "Quality and completeness of preserved evidence",
        "Usability of the recovery process under stress",
        "Effectiveness when the user is under time pressure or emotional pressure",
        "Whether protection is achieved without invasive monitoring",
      ],
    },

    links: { guide: null, pdf: null },
  },
];

// "Expectations Across All Domains" — applies to every submission, in every
// domain, verbatim from the source document.
export const EXPECTATIONS = [
  {
    title: "Start with a specific problem",
    body: "State clearly:",
    list: [
      "The user experiencing the problem",
      "The situation in which it occurs",
      "How it is currently handled",
      "Why the current method fails",
      "The consequence of that failure",
      "The assumption you intend to test",
    ],
    note: "Broad ideas such as \"an AI healthcare assistant\", \"a business agent\" or \"a cybersecurity platform\" are not acceptable problem statements.",
  },
  {
    title: "Build for a bounded workflow",
    body: "Solve one important problem well rather than attempting to automate an entire industry. Define your inputs, expected outputs, permitted actions, failure conditions, human-review points and success metrics.",
  },
  {
    title: "Handle uncertainty honestly",
    body: "Systems must not produce confident answers when information is incomplete or ambiguous. Address confidence, verification, missing information, conflicting sources, human escalation, auditability, and correction or rollback.",
  },
  {
    title: "Demonstrate more than a prepared example",
    body: "Test against variation, exceptions and previously unseen inputs. A system that works only on the exact example used during development will not be treated as adaptive or reliable. Expect judges to try inputs you have not seen.",
  },
  {
    title: "Protect users",
    body: "Projects involving health, financial, communication or personal data must apply appropriate safeguards. Avoid unsupported medical claims, unnecessary collection of sensitive data, autonomous consequential decisions without review, misleading accuracy claims, and designs that make human help harder to reach.",
  },
  {
    title: "Show material differentiation",
    body: "You are not expected to invent a new category of technology — but reproducing an existing product with a new interface is not sufficient. If your project resembles an existing solution, demonstrate a material improvement, such as:",
    list: [
      "Serving an overlooked user group",
      "Working in an underserved environment",
      "Handling variation existing automation cannot",
      "Improving accessibility or comprehension",
      "Reducing cost or effort",
      "Better reliability or explainability",
      "Addressing an unresolved part of the user journey",
      "Safer human collaboration",
      "Generalising across multiple workflows",
    ],
    note: "Insufficient differentiation includes: replacing a form with a chatbot · adding voice without improving accessibility · another appointment scheduler · a basic claims dashboard · connecting an LLM to company documents · a fixed scraper for one website · a generic agent claiming to do everything.",
  },
];

// Appendix A — Additional Requirements for Analytics-Type Submissions.
// Applies in any domain; most common in Domain 2. Verbatim from the source.
export const ANALYTICS_APPENDIX = {
  title: "Appendix A — Additional requirements for analytics-type submissions",
  note: "Read this only if your solution generates analyses, charts or data-driven answers on demand. It applies in any domain, and is most common in Domain 2.",
  examplesIntro: "Managers frequently ask questions no existing dashboard covers:",
  examples: [
    "Which insurers and denial categories contributed most to claims ageing past 90 days last quarter?",
    "Which stages cause the greatest delay in application processing?",
    "Which complaint categories are repeatedly reopened?",
  ],
  challenge:
    "The challenge is not turning text into a chart. The system must understand the organisation's data, the meaning of the question, and whether the resulting analysis is actually valid. Such a solution must additionally demonstrate:",
  requirements: [
    { label: "Business language understanding", body: "Interpreting organisational terminology rather than relying on database column names, and recognising when related terms differ in meaning." },
    { label: "Ambiguity clarification", body: "Asking when a question has multiple reasonable readings (does \"this quarter\" mean the calendar or financial quarter?)." },
    { label: "Appropriate data selection", body: "Determining which sources, fields, filters and relationships are needed." },
    { label: "Valid analysis", body: "Choosing a defensible calculation or comparison, not an arbitrary aggregation." },
    { label: "Appropriate visual selection", body: "A chart, table or other form suited to the question and the data." },
    { label: "Verification", body: "Letting users inspect source records, query, filters, calculations, transformations and assumptions." },
    { label: "Analytical context", body: "Understanding follow-ups such as \"show only Kerala\", \"compare with last quarter\", \"break this down by team\", \"why did this increase?\"" },
    { label: "Prevention of misleading conclusions", body: "Flagging insufficient data, missing periods, duplicates, inappropriate comparisons, small samples, conflicting metric definitions, and correlation presented as causation." },
  ],
  insufficient:
    "A fixed dashboard with pre-built charts · a text box that only selects existing dashboard views · basic natural-language-to-SQL · a chart generated without explaining its calculation · analysis on one carefully prepared dataset · conclusions without source traceability · visuals that hide missing data, assumptions or failed queries",
  measures:
    "Accuracy of generated calculations · appropriateness of generated visuals · accuracy across follow-up questions · user comprehension of the analysis · percentage of conclusions traceable to source data",
};
