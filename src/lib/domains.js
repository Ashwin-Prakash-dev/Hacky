// Startathon problem domains — the single source of truth for /domains, the
// four detail routes, and the homepage teaser. Comparison values and detail
// copy live on the same object so the two can never drift apart.

// Drop the brief at public/startathon-problem-domains.pdf and flip this on.
// Until then the download button doesn't render (no dead links).
export const BRIEF_PDF = null; // "/startathon-problem-domains.pdf"

// The five dimensions teams weigh domains against. One is shown at a time;
// all four domains answer it together.
export const COMPARE_ATTRS = [
  {
    id: "outcome",
    label: "Primary outcome",
    heading: "Choose this if your primary outcome is…",
  },
  {
    id: "audience",
    label: "Who it's for",
    heading: "Who you are building for",
  },
  {
    id: "examples",
    label: "Example problems",
    heading: "Problems that fit this domain",
  },
  {
    id: "success",
    label: "Measured by",
    heading: "Primary measure of success",
  },
  {
    id: "failure",
    label: "How teams fail",
    heading: "The most common way teams fail here",
  },
];

export const DOMAINS = [
  {
    slug: "preventive-health",
    num: "01",
    name: "Preventive Health and Everyday Care",
    short: "Preventive Health",
    glimpse:
      "Most health outcomes are decided outside the clinic — by whether people understand their instructions, perform techniques correctly, and keep going after week two.",
    compare: {
      outcome: "Improving health behaviour or care outside a healthcare facility",
      audience: "Patients, caregivers and families",
      examples: [
        "Turning discharge instructions into a workable daily routine",
        "Learning a correct brushing or inhaler technique",
        "Coordinating care across family members",
      ],
      success: "Better understanding, technique or adherence than a reminder app achieves",
      failure: "Building another habit tracker",
    },
    overview:
      "Patients and caregivers leave with instructions, recommendations or treatment plans, then struggle to apply them in daily life. Existing tools lean almost entirely on reminders and notifications — they never address understanding, technique, motivation, coordination or changing circumstances.",
    challenge:
      "Choose one health-related activity a specific person must perform correctly and repeatedly outside a clinical setting, where doing it wrong or inconsistently has real consequences. Build a system that measurably improves how well that activity is understood, performed or sustained — and that escalates to a human professional when it should.",
    oneProblem: {
      lead: "One health routine: a bounded set of actions a person carries out over time to reach a health outcome.",
      examples:
        "A post-surgical recovery routine. A child's twice-daily oral care. An elderly parent's medication schedule managed by three family members. A prescribed physiotherapy programme.",
      test: "A routine has a defined owner, a defined frequency, a correct method, and an observable failure mode. If you cannot state all four, narrow your problem further.",
    },
    problems: [
      {
        title: "Turning healthcare instructions into daily action",
        body: "A patient leaves a consultation with instructions on medication, diet, hygiene, exercise and follow-up. Each one makes sense alone, but they never become a routine that fits an actual day. A solution could organise the instructions, surface dependencies and conflicts, adapt to the person's real schedule, and record difficulties for the next consultation.",
      },
      {
        title: "Improving preventive oral-care technique",
        body: "Children and adults brush regularly but use ineffective technique, miss areas, or stop too early. A solution could help users learn and practise correct technique and give feedback they can act on — without claiming to diagnose dental conditions.",
      },
      {
        title: "Supporting family caregivers",
        body: "One family member coordinates medication, hygiene, appointments, diet and daily activities for an elderly relative, a child or a person with a disability. The information lives in conversations, paper notes and messaging apps. A solution could clarify who is responsible for what and detect when something important was missed.",
      },
      {
        title: "Supporting prescribed physical techniques",
        body: "Patients perform physiotherapy exercises, use inhalers or follow wound-care procedures at home, often after a single demonstration. A solution could support the correct sequence, help the user judge whether each step was completed, and prepare questions for the next appointment.",
      },
      {
        title: "Knowing when to seek help",
        body: "Someone notices a change in symptoms or behaviour and cannot judge whether to keep watching, call a professional, or seek urgent help. A solution could structure their observations, explain general warning signs from trusted sources, and connect them to the right human — without attempting diagnosis.",
      },
    ],
    strongSolution: [
      {
        term: "Adaptability",
        body: "Works across different people, schedules, abilities and living situations — not one idealised user.",
      },
      {
        term: "Understanding",
        body: "Addresses why the routine fails for this person — comprehension, technique, motivation, coordination — not just that it was forgotten.",
      },
      {
        term: "Context and continuity",
        body: "Takes account of what has already happened: past adherence, previous difficulties, changed circumstances.",
      },
      {
        term: "Explainability",
        body: "The user can see why they are being asked to do something, and where the guidance came from.",
      },
      {
        term: "Uncertainty handling",
        body: "Recognises when it cannot interpret what it is seeing, and says so rather than guessing.",
      },
      {
        term: "Human collaboration",
        body: "Has a clear escalation path to a professional or caregiver, and prepares information for that handover.",
      },
    ],
    opportunities: [
      "Preventive oral and general healthcare — routine care people perform unsupervised",
      "Medication and treatment adherence — understanding and sustaining, not just remembering",
      "Caregiver coordination — information split across people, notes and chat apps",
      "Health education and comprehension — instructions understood individually but not as a whole",
      "Correct execution of techniques — inhaler use, wound care, exercises, injections",
      "Recovery and rehabilitation routines — long programmes with declining motivation",
      "Long-term behaviour change — beyond the first two weeks",
      "Symptom and routine monitoring — recording observations without attempting diagnosis",
      "Preparing for consultations — helping patients bring useful information to professionals",
      "Accessibility for elderly, disabled or low-literacy users",
    ],
    inScope: [
      "Health education",
      "Comprehension of instructions",
      "Practical skill development",
      "Behavioural support",
      "Caregiver collaboration",
      "Personal health routines",
      "Self-monitoring",
      "Non-diagnostic escalation",
      "Human-in-the-loop support",
      "Accessibility for elderly, disabled and low-literacy users",
    ],
    outOfScope: {
      insufficient: [
        "Basic reminder or habit-tracking applications",
        "Generic appointment-booking systems",
        "Patient portals that do not address a new problem",
      ],
      prohibited: [
        "Autonomous diagnosis",
        "Treatment prescription",
        "Unsupervised medical triage",
        "Any unsupported clinical claim",
      ],
    },
    measures: [
      "Improvement in understanding of instructions, measured before and after",
      "Improvement in execution of a technique",
      "Reduction in missed or incorrectly performed steps",
      "Reduction in caregiver coordination effort",
      "Engagement sustained beyond what a basic reminder system achieves",
      "Rate of appropriate escalation when the system is uncertain",
      "Safe and transparent handling of health information",
    ],
  },

  {
    slug: "intelligent-operations",
    num: "02",
    name: "Intelligent Operations and Case Work",
    short: "Intelligent Operations",
    glimpse:
      "Work that looks like data entry but isn't. Someone reads five sources, interprets them in context, applies rules, and decides what happens next — hundreds of times a week.",
    compare: {
      outcome: "Making complex organisational work adaptive, intelligent and efficient",
      audience: "Employees who process cases",
      examples: [
        "Following up unpaid insurance claims",
        "Matching invoices to purchase orders",
        "Reviewing university applications",
      ],
      success: "Time, manual steps and missed follow-ups per case",
      failure: "Building a scraper for one website",
    },
    overview:
      "A billing employee checks an insurer's portal, reads previous follow-up notes and decides what to do next. A finance employee compares an invoice, purchase order and delivery record before approving payment. An administrator reviews forms and certificates against eligibility rules. None of them are copying data or repeating a fixed sequence of clicks — they are interpreting information in context and deciding.",
    challenge:
      "Choose one real administrative or operational process where a person has to gather information from several sources, understand what it means, compare it against rules or previous actions, decide the next step, update a system or send a reply, and follow the case until it closes. Build a system that meaningfully improves part of that process — and that recognises when it lacks the information or the authority to proceed.",
    oneProblem: {
      lead: "One case: a single unit of work taken from an initial request, transaction or problem through to a completed outcome.",
      examples:
        "An unpaid healthcare claim. An insurance approval request. A customer complaint. A vendor-registration application. An employee reimbursement. An invoice awaiting approval. A delayed shipment.",
      test: "A case may stay open for hours, days or weeks, and may involve several people, documents, communications and systems. Improve one case type well rather than attempting a general-purpose operations agent.",
    },
    problems: [
      {
        title: "Insurance eligibility and benefit review",
        body: "Before treatment, a practice must establish whether cover is active, what is covered, which limitations apply, what the patient will pay, and whether prior approval is needed. The same facts appear differently across portals, PDFs, electronic responses and phone calls. A solution could map varied sources into one structure, explain how each value was identified, flag contradictions, and prepare the result for review. A fixed scraper for one insurer's website is not sufficient.",
      },
      {
        title: "Unpaid-claim follow-up",
        body: "An employee works through claims that have not been paid. For each, they review previous actions, check the portal, interpret status messages, work out whether documentation is missing, and decide whether to correct, appeal, call, wait or escalate. A solution could hold the case history, interpret new responses, and recommend or prepare the next action.",
      },
      {
        title: "Payment reconciliation",
        body: "Payment information arrives from insurers, banks, remittance files and internal systems. Employees work out which payment belongs to which claim, whether amounts are correct, whether payments were split or combined, and why records disagree. A solution could propose matches, explain its reasoning, and route uncertain cases for investigation.",
      },
      {
        title: "Invoice approval",
        body: "A finance employee compares an invoice against the purchase order, agreed price, delivered quantity, previous payments, tax details and internal approval rules. A solution could identify mismatches, assemble the supporting evidence, and recommend approval or review.",
      },
      {
        title: "Customer-complaint resolution",
        body: "A complaint has passed through several employees and channels. Whoever holds it now must reconstruct what was originally asked, what was promised, what was attempted, and whether the stated resolution actually solved anything. A solution could rebuild that history, identify what is still unresolved, and recommend the next action.",
      },
    ],
    strongSolution: [
      {
        term: "Adaptability",
        body: "Handles different layouts, documents, terminology and input formats without being rewritten for each source, and can be configured for related workflows.",
      },
      {
        term: "Understanding",
        body: "Recognises equivalent business concepts expressed differently — and flags when similar-looking terms may not be equivalent.",
      },
      {
        term: "Context and continuity",
        body: "Considers previous events, actions and communications before recommending what happens next.",
      },
      {
        term: "Explainability",
        body: "Shows which information was used, where it came from, which rules applied, why an action was chosen, and what was assumed.",
      },
      {
        term: "Uncertainty handling",
        body: "Recognises when the normal process does not apply, or when the available information is insufficient.",
      },
      {
        term: "Human collaboration",
        body: "Requests clarification, approval or specialist help at the right point rather than acting beyond its authority.",
      },
    ],
    opportunities: [
      "Collecting and organising information from portals, PDFs, spreadsheets, emails, call notes and policy documents — showing where each value came from",
      "Handling different and changing sources — recognising that “patient responsibility” and “estimated amount payable by member” may mean the same thing, and that similar labels sometimes don't",
      "Deciding the next action — is the request complete, which rule applies, has a deadline passed, should this be approved, corrected, chased or escalated",
      "Maintaining case history — knowing what has already been tried, and what is therefore appropriate now",
      "Identifying unusual or stuck cases — conflicting records, no progress, repeated failures, approaching deadlines, replies that don't answer the question",
      "Prioritising work across hundreds of pending cases, with the reasoning visible rather than reduced to a score",
      "Learning processes from examples — inferring undocumented steps, decision points and exceptions from completed cases and audit logs",
      "On-demand analytics — answering operational questions no existing dashboard was built for",
    ],
    inScope: [
      "Case management",
      "Multi-source information collection",
      "Understanding documents, portals and communications",
      "Mapping varied information into a common structure",
      "Rule- and policy-aware assistance",
      "Stateful follow-up",
      "Exception detection",
      "Work prioritisation",
      "Reconciliation",
      "Human review and approval",
      "Explainable recommendations",
      "Bounded automation",
      "On-demand analytical investigation",
    ],
    outOfScope: {
      insufficient: [
        "A scraper built for one webpage",
        "Basic OCR and field extraction",
        "Simple CSV, JSON or database transformation",
        "A fixed series of automated clicks",
        "A chatbot that only answers questions from documents",
        "A dashboard that only lists pending work",
        "A generic “AI employee”",
        "A workflow tested only against one prepared example",
      ],
      prohibited: ["Fully autonomous consequential decisions without safeguards or review"],
    },
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
    analytics: true,
  },

  {
    slug: "inclusive-access",
    num: "03",
    name: "Inclusive and Trustworthy Access to Essential Services",
    short: "Inclusive Access",
    glimpse:
      "A service that technically works is not a service people can use. Language, literacy, disability, age and sheer complexity lock people out of things they are entitled to.",
    compare: {
      outcome: "Helping people understand and successfully use an essential service",
      audience: "People excluded by language, literacy, disability, age or complexity",
      examples: [
        "Explaining an official document and confirming it was understood",
        "Completing a form by conversation",
        "Reliable hand-off to a human",
      ],
      success: "Task completion and comprehension for a specific underserved group",
      failure: "Wrapping a translation API in a new interface",
    },
    overview:
      "Essential services increasingly run on apps, websites, forms, automated calls and digital documents — across healthcare, government, education, finance and utilities. People must be able to understand the interaction, correct misunderstandings, give informed consent, and reach a human when automation fails. Many cannot.",
    challenge:
      "Choose one essential-service interaction that a specific, identified group of users currently cannot complete without help, and establish why. Build a system that lets them complete it themselves — with the ability to check and correct what the system understood, and a working route to a human when it fails.",
    oneProblem: {
      lead: "One service interaction: a bounded exchange between a person and an institution that has a defined completion state.",
      examples:
        "Understanding a hospital discharge summary and acting on it. Submitting a pension claim. Giving informed consent to a procedure. Disputing an incorrect utility bill. Completing a scholarship application.",
      test: "Name the affected group specifically — “elderly Malayalam-speaking users with low text literacy”, not “people who find technology difficult” — and test with at least one representative user.",
    },
    problems: [
      {
        title: "Understanding complex documents",
        body: "A person receives a health, insurance, financial or government document and cannot tell what it means, what action it requires, which deadline applies, or what happens if they do nothing. A solution could explain it in accessible language, keep the details that carry consequences, cite the original text behind each explanation, and confirm the person understood.",
      },
      {
        title: "Completing services through natural conversation",
        body: "A low-literacy or elderly user can explain what they need out loud but cannot navigate a long application form. A solution could turn that conversation into structured information, and let the user review and correct it before anything is submitted.",
      },
      {
        title: "Handling multilingual and code-switched speech",
        body: "People mix Malayalam, English and domain-specific terms when giving names, dates, addresses, medications or official numbers. A solution could handle this accurately, identify low-confidence interpretations, and ask for confirmation on exactly those items.",
      },
      {
        title: "Making services usable with a disability",
        body: "A standard interface is difficult or impossible to use for someone with a visual, hearing, motor or cognitive disability. A solution could offer an alternative interaction method designed and tested around one specific group's requirements.",
      },
      {
        title: "Creating reliable human hand-offs",
        body: "An automated system misunderstands a user repeatedly and keeps going, with no meaningful route to a person. A solution could detect the failure, summarise the interaction, transfer the user, and carry across everything already provided.",
      },
      {
        title: "Confirming meaningful understanding",
        body: "People accept treatment plans, financial obligations and consent forms they do not understand. A solution could present the information accessibly and verify comprehension before consent is recorded.",
      },
    ],
    strongSolution: [
      {
        term: "Adaptability",
        body: "Works across the real variation in how the target group speaks, reads, hears and interacts.",
      },
      {
        term: "Understanding",
        body: "Simplifies without dropping or distorting consequential details, and handles mixed languages and informal phrasing.",
      },
      {
        term: "Context and continuity",
        body: "Retains what the user has already provided across turns, sessions and channels.",
      },
      {
        term: "Explainability",
        body: "The user can see what the system understood, and trace any explanation back to the original source text.",
      },
      {
        term: "Uncertainty handling",
        body: "Surfaces low-confidence interpretations for confirmation instead of proceeding silently.",
      },
      {
        term: "Human collaboration",
        body: "Detects its own failure and hands off to a person with full context preserved.",
      },
    ],
    opportunities: [
      "Multilingual and code-switched communication — how people actually speak, not clean single-language input",
      "Accessibility for people with disabilities — designed around one group's requirements, not a compliance checklist",
      "Low-literacy and voice-first interaction — where reading is the barrier",
      "Simplification of complex information — without losing the details that carry consequences",
      "Informed consent and comprehension — verifying understanding, not just recording agreement",
      "Transparent automated assistance — the user knows what the system did and why",
      "Human hand-off and escalation — recognising failure and transferring with context intact",
      "Offline or low-connectivity access — where the service is needed but the network isn't reliable",
      "Multimodal interfaces — voice, text, image and touch used together",
      "Preservation of context across channels, so the user doesn't restart from zero",
    ],
    inScope: [
      "Accessible and multimodal interfaces",
      "Multilingual communication and code-switching",
      "Information simplification",
      "Comprehension verification",
      "Source attribution",
      "User correction and confirmation",
      "Consent-aware systems",
      "Detection of failed automated interactions",
      "Context-preserving hand-off",
      "Offline-first access",
    ],
    outOfScope: {
      insufficient: [
        "A generic FAQ chatbot",
        "A standard appointment-booking bot",
        "Basic call routing or IVR",
        "Call transcription without a new user problem being solved",
        "A translation API placed behind a new interface",
        "Accessibility claims made without a specific affected user group in mind",
      ],
      prohibited: [
        "Sales and lead-conversion bots",
        "Fully automated high-consequence decisions",
      ],
    },
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

  {
    slug: "digital-trust",
    num: "04",
    name: "Digital Trust and Scam Resilience",
    short: "Digital Trust",
    glimpse:
      "Fraud now runs on urgency and impersonation, not exploits. Security tools protect infrastructure; almost nothing helps at the moment a person decides whether to pay.",
    compare: {
      outcome: "Helping people resist and recover from digital deception",
      audience: "Individuals and small organisations facing fraud",
      examples: [
        "Verifying an urgent payment request",
        "Detecting changed bank details on an invoice",
        "Guided recovery after money is lost",
      ],
      success: "Whether users pause and verify — and recover well when they don't",
      failure: "Claiming to detect fraud without explaining the evidence",
    },
    overview:
      "Individuals and small organisations receive fraudulent calls, messages, invoices and payment instructions through channels they normally trust. Existing security tools focus on technical infrastructure. They rarely help at the moment a person has to decide: is this request genuine, should I pay this, how do I verify who sent it, what do I do now that I've been deceived?",
    challenge:
      "Choose one decision moment where a person must judge whether a request is genuine, or one recovery moment immediately after they have been deceived. Build a system that improves that specific moment — by interrupting, verifying, explaining or guiding — without blocking legitimate activity and without demanding surveillance of private communications.",
    oneProblem: {
      lead: "One decision or recovery moment: a point where a person acts on a request whose authenticity is uncertain, or responds to a deception already under way.",
      examples:
        "Approving an urgent transfer requested by a “senior colleague”. Paying an invoice with changed bank details. Responding to a caller claiming to be from a bank. The first thirty minutes after realising an account is compromised.",
      test: "Define what the person sees, what they currently do, how much time they have, and what it costs when they get it wrong.",
    },
    problems: [
      {
        title: "Urgent payment impersonation",
        body: "An employee receives an urgent payment instruction that appears to come from a senior colleague, customer or vendor — by email, message or voice, with convincing contextual detail. A solution could introduce proportionate verification, approval or cooling-off steps without obstructing legitimate work.",
      },
      {
        title: "Changed invoice or bank information",
        body: "A small organisation receives an invoice that looks genuine but carries modified payment details. A solution could compare it against previous transactions and trusted records, and explain specifically why verification is warranted.",
      },
      {
        title: "Protecting vulnerable family members",
        body: "An older adult is pressured by an impersonation, bank-support or “digital arrest” scam. Family want to help without reading their private messages. A solution could offer privacy-respecting warnings, trusted-contact escalation, or guided verification the user performs themselves.",
      },
      {
        title: "Responding after money or access is lost",
        body: "A victim knows money has gone or an account is compromised, but not who to contact first, what evidence to preserve, which accounts to secure, or what recovery is still possible. A solution could provide a guided, time-sensitive response sequence for the first critical hours.",
      },
      {
        title: "Explaining uncertain warnings",
        body: "A tool labels a message fraudulent without saying why, or declares it safe with false confidence. Users learn to ignore both. A solution could communicate uncertainty honestly, point to the specific suspicious evidence, and recommend verification proportionate to the risk.",
      },
      {
        title: "Small-business incident response",
        body: "After phishing or account takeover, employees at a small organisation respond inconsistently and destroy evidence in the process. A solution could guide containment, documentation, reporting and recovery.",
      },
    ],
    strongSolution: [
      {
        term: "Adaptability",
        body: "Works across channels and scam variants — not one message template collected in advance.",
      },
      {
        term: "Understanding",
        body: "Identifies the manipulation pattern and the specific evidence behind a judgement, rather than matching keywords.",
      },
      {
        term: "Context and continuity",
        body: "Uses prior relationships, previous transactions and normal behaviour to judge what is anomalous.",
      },
      {
        term: "Explainability",
        body: "States what is suspicious, why it matters, and how confident it is — in terms a pressured non-expert can act on.",
      },
      {
        term: "Uncertainty handling",
        body: "Handles false positives and false negatives deliberately, and never claims certainty it does not have.",
      },
      {
        term: "Human collaboration",
        body: "Routes to a trusted contact, colleague or institution, and supports approval and cooling-off rather than deciding alone.",
      },
    ],
    opportunities: [
      "Social-engineering resistance — help at the moment of pressure, not in advance training",
      "Impersonation and payment fraud — verifying that the sender is who they claim to be",
      "Cross-channel identity verification — confirming a request through a channel the attacker doesn't control",
      "Trusted-contact and approval workflows — a second pair of eyes, and cooling-off periods",
      "Scam reporting and evidence preservation — capturing proof before it is deleted or lost",
      "Recovery after account compromise — what to do first, second and third",
      "Protection of vulnerable users, without continuous monitoring of their private messages",
      "Explainable fraud warnings — evidence and proportionate action, not an unexplained verdict",
      "Small-business incident response for organisations with no security staff",
      "Safe handling of uncertain authenticity — acting sensibly when you genuinely cannot tell",
    ],
    inScope: [
      "Social-engineering protection",
      "Identity and payment verification",
      "Trusted-contact mechanisms",
      "Dual approval and cooling-off workflows",
      "Provenance checks",
      "Cross-channel verification",
      "Guided incident reporting",
      "Evidence preservation",
      "Recovery and containment",
      "Explainable risk warnings",
      "Education embedded in real decisions",
    ],
    outOfScope: {
      insufficient: [
        "Generic vulnerability scanners",
        "Conventional security dashboards",
        "Black-box deepfake detection presented as definitive",
        "Automatic blocking without a review path",
      ],
      prohibited: [
        "Offensive hacking",
        "Malware development",
        "Credential harvesting",
        "Tools that claim to guarantee authenticity",
        "Designs that expose users to unnecessary surveillance",
      ],
    },
    measures: [
      "Whether users actually pause and verify suspicious requests",
      "Clarity of communicated uncertainty",
      "False-positive and false-negative rates, and how each is handled",
      "Time to report or contain an incident",
      "Quality and completeness of preserved evidence",
      "Usability of the recovery process under stress",
      "Effectiveness when the user is under time or emotional pressure",
      "Whether protection is achieved without invasive monitoring",
    ],
  },
];

export const getDomain = (slug) => DOMAINS.find((d) => d.slug === slug);

// Applies to every submission, in every domain.
export const EXPECTATIONS = [
  {
    num: "01",
    title: "Start with a specific problem",
    body: "State the user experiencing the problem, the situation it occurs in, how it is currently handled, why that fails, what the failure costs, and the assumption you intend to test.",
    note: "“An AI healthcare assistant”, “a business agent” and “a cybersecurity platform” are not problem statements.",
  },
  {
    num: "02",
    title: "Build for a bounded workflow",
    body: "Solve one important problem well rather than automating an industry. Define your inputs, expected outputs, permitted actions, failure conditions, human-review points and success metrics.",
  },
  {
    num: "03",
    title: "Handle uncertainty honestly",
    body: "Systems must not produce confident answers when information is incomplete or ambiguous. Address confidence, verification, missing information, conflicting sources, human escalation, auditability, and correction or rollback.",
  },
  {
    num: "04",
    title: "Demonstrate more than a prepared example",
    body: "Test against variation, exceptions and inputs you have never seen. A system that only works on the exact example you developed against will not be treated as adaptive or reliable.",
    note: "Judges will try inputs you have not seen.",
  },
  {
    num: "05",
    title: "Protect users",
    body: "Projects touching health, financial, communication or personal data must apply appropriate safeguards. Avoid unsupported medical claims, unnecessary collection of sensitive data, autonomous consequential decisions without review, misleading accuracy claims, and designs that make human help harder to reach.",
  },
  {
    num: "06",
    title: "Show material differentiation",
    body: "You are not expected to invent a new category of technology — but reproducing an existing product behind a new interface is not enough. If your project resembles something that exists, show a material improvement: an overlooked user group, an underserved environment, variation existing automation cannot handle, better accessibility or comprehension, lower cost or effort, better reliability or explainability, an unresolved part of the user journey, safer human collaboration, or generalisation across workflows.",
    note: "Not sufficient: replacing a form with a chatbot, adding voice without improving accessibility, another appointment scheduler, a basic claims dashboard, connecting an LLM to company documents, a fixed scraper for one website, a generic agent that claims to do everything.",
  },
];

// Appendix A — extra bar for anything that generates analyses on demand.
export const ANALYTICS = {
  intro:
    "Read this only if your solution generates analyses, charts or data-driven answers on demand. It applies in any domain, and is most common in Intelligent Operations.",
  context:
    "Managers ask questions no dashboard covers: which insurers and denial categories drove claims ageing past 90 days last quarter? Which stages cause the greatest delay in application processing? Which complaint categories are repeatedly reopened? The challenge is not turning text into a chart — it is understanding the organisation's data, the meaning of the question, and whether the resulting analysis is actually valid.",
  requirements: [
    {
      term: "Business language understanding",
      body: "Interpreting organisational terminology rather than database column names, and recognising when related terms differ in meaning.",
    },
    {
      term: "Ambiguity clarification",
      body: "Asking when a question has multiple reasonable readings — does “this quarter” mean the calendar or the financial quarter?",
    },
    {
      term: "Appropriate data selection",
      body: "Determining which sources, fields, filters and relationships the question actually needs.",
    },
    {
      term: "Valid analysis",
      body: "Choosing a defensible calculation or comparison, not an arbitrary aggregation.",
    },
    {
      term: "Appropriate visual selection",
      body: "A chart, table or other form suited to the question and the data.",
    },
    {
      term: "Verification",
      body: "Letting users inspect source records, query, filters, calculations, transformations and assumptions.",
    },
    {
      term: "Analytical context",
      body: "Understanding follow-ups: “show only Kerala”, “compare with last quarter”, “break this down by team”, “why did this increase?”",
    },
    {
      term: "Prevention of misleading conclusions",
      body: "Flagging insufficient data, missing periods, duplicates, inappropriate comparisons, small samples, conflicting metric definitions, and correlation presented as causation.",
    },
  ],
  insufficient: [
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
