import { Accessibility, HeartPulse, ShieldAlert, Workflow } from "lucide-react";

// The four Startathon challenge domains. Everything the domain picker and
// the per-domain briefs render comes from here — copy, structure, links.
// To add or edit a domain, edit this file only.
//
// Content is condensed from the official domain definitions; the page is
// the short-form brief, the complete guide is the long-form version.
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
    intro: [
      "Many health outcomes depend on what people do outside hospitals, clinics and dental practices. Patients and caregivers leave with instructions, recommendations and treatment plans, then struggle to apply them consistently — and existing tools lean on reminders and notifications without addressing understanding, technique, motivation, coordination or changing circumstances.",
      "The challenge: pick one health-related activity that a specific person must perform correctly and repeatedly outside a clinical setting, where doing it wrong has real consequences. Build a system that measurably improves how well that activity is understood, performed or sustained — and that escalates to a human professional when it should.",
    ],
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
        body: "A patient leaves a consultation with instructions on medication, diet, hygiene, exercise and follow-up — each understood individually, impossible to run as a day. Organise them, catch conflicts, adapt to the person's real schedule, and record difficulties for the next consultation.",
      },
      {
        title: "Better preventive oral care",
        body: "Children and adults brush regularly but with poor technique, missed areas or not for long enough. Help users learn and practise correct technique with understandable feedback — without claiming to diagnose anything.",
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
        body: "A person notices a change in symptoms but can't judge whether to keep monitoring, contact a professional, or act urgently. Structure their observations, explain general warning signs from trusted sources, and connect them to human help — without attempting autonomous diagnosis.",
      },
    ],
    success: {
      statement: "Better understanding, technique or adherence than a reminder app achieves.",
      detail:
        "Judges will measure before-and-after: comprehension of instructions, execution of a technique, missed or incorrectly performed steps, caregiver coordination effort — and whether engagement survives past the first two weeks.",
      signals: [
        "Understanding and technique measured before and after",
        "Engagement sustained beyond what reminders achieve",
        "Appropriate escalation whenever the system is uncertain",
      ],
    },
    pitfalls: [
      {
        title: "Another habit tracker",
        body: "The most common failure in this domain. Reminders and streaks are the baseline you're judged against, not a solution — address why the routine fails: understanding, technique, motivation, coordination.",
      },
      {
        title: "Portals and booking clones",
        body: "Generic appointment-booking systems and patient portals that don't address a new problem are insufficient — unless you demonstrate a substantial new capability.",
      },
      {
        title: "Playing doctor",
        body: "Autonomous diagnosis, treatment prescription, unsupervised medical triage and unsupported clinical claims are not permitted in any form. Escalate to professionals instead.",
      },
      {
        title: "A routine you can't define",
        body: "One routine means a defined owner, a frequency, a correct method and an observable failure mode. If you can't state all four, narrow your problem further.",
      },
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "intelligent-operations",
    title: "Intelligent operations & case work",
    icon: Workflow,
    hook: "Choose this if your primary outcome is making complex organisational work adaptive, intelligent and efficient.",
    intro: [
      "A billing employee checks an insurer's portal, reads previous follow-up notes and decides what to do next. A finance employee compares an invoice, purchase order and delivery record before approving payment. They aren't copying data or repeating fixed clicks — they gather information from several sources, interpret it in context, apply rules, and decide what happens next.",
      "The challenge: pick one real administrative or operational process and build a system that meaningfully improves part of it. It may assist the employee, prepare work for review, or safely perform a bounded set of actions — and it must recognise when it lacks the information or authority to proceed.",
    ],
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
        body: "Whether cover is active, what's covered, what the patient pays — spread across portals, PDFs and phone calls that all phrase it differently. Map varied formats into one structure, explain where each value came from, and flag contradictions for human review.",
      },
      {
        title: "Unpaid-claim follow-up",
        body: "For each unpaid claim someone reviews past actions, interprets new status messages, and decides whether to correct, appeal, call, wait or escalate. Maintain the case history and recommend — or prepare — the next action.",
      },
      {
        title: "Payment reconciliation",
        body: "Payments arrive from insurers, banks, remittance files and internal systems; someone must work out which belongs to which claim and why records disagree. Propose matches, explain the reasoning, and route uncertain cases for investigation.",
      },
      {
        title: "Invoice approval",
        body: "An invoice is checked against the purchase order, agreed price, delivered quantity, previous payments, tax details and approval rules. Identify mismatches, assemble the supporting evidence, and recommend approval or review.",
      },
      {
        title: "Customer-complaint resolution",
        body: "A complaint has passed through several employees and channels. Rebuild what was originally asked, what was promised, what was attempted — and identify what actually remains unresolved.",
      },
    ],
    success: {
      statement: "Time, manual steps and missed follow-ups — per case.",
      detail:
        "Judges will score the process, not the demo: time per case, manual steps eliminated, accuracy of captured information, cases completed without rework, time to spot an exception — and accuracy on inputs you have never seen.",
      signals: [
        "Time and steps per case, measured before and after",
        "Holds up on previously unseen inputs",
        "Exceptions recognised and routed, not guessed at",
      ],
    },
    pitfalls: [
      {
        title: "A scraper for one website",
        body: "The most common failure in this domain. One portal's layout is not the problem — the varied, changing sources are. Handle different formats and terminology without being rewritten for each.",
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
        title: "Acting beyond its authority",
        body: "Fully autonomous consequential decisions without safeguards or review are not permitted. The system must know when to stop and ask for clarification or approval.",
      },
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "inclusive-access",
    title: "Inclusive & trustworthy access",
    icon: Accessibility,
    hook: "Choose this if your primary outcome is helping people understand and successfully use an essential service.",
    intro: [
      "Essential services now run through apps, forms, automated calls and digital documents — and many people cannot use them because of language, literacy, disability, age or sheer complexity. A technically functional service is not an accessible one: people must be able to understand the interaction, correct misunderstandings, give informed consent, and reach a human when automation fails.",
      "The challenge: pick one essential-service interaction that a specific, identified group of users currently cannot complete without help, and establish why. Build a system that lets them complete it themselves — with the ability to check and correct what the system understood, and a working route to a human when it fails.",
    ],
    audiences: [
      {
        label: "Elderly users",
        note: "Navigating pensions, hospital paperwork and digital-first services late in life.",
      },
      {
        label: "People with disabilities",
        note: "Visual, hearing, motor or cognitive — failed by one-size-fits-all interfaces.",
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
    success: {
      statement: "Task completion and comprehension for a specific underserved group.",
      detail:
        "Judges will look for the named user group completing the real task: completion rate, measured improvement in comprehension, correct handling of low-confidence interpretations — and an escalation path to a human that works end to end.",
      signals: [
        "Tested with at least one representative user",
        "Comprehension measurably improved, not assumed",
        "A human hand-off that works, with context intact",
      ],
    },
    pitfalls: [
      {
        title: "A translation API in a new interface",
        body: "The most common failure in this domain. Swapping the language of a broken flow doesn't change who can complete it — handle mixed languages, informal phrasing and low-confidence items.",
      },
      {
        title: "The generic FAQ chatbot",
        body: "FAQ bots, booking bots, call routing and transcription without a new user problem are insufficient. Sales and lead-conversion bots are not permitted at all.",
      },
      {
        title: "Accessibility without a user",
        body: "'People who find technology difficult' is not a user group. Name one specifically — elderly Malayalam-speaking users with low text literacy — and test with a representative user.",
      },
      {
        title: "Automation with no way out",
        body: "A system that misunderstands repeatedly but keeps going. Detect your own failure, summarise the interaction, and hand off to a human with context preserved.",
      },
    ],
    links: { guide: null, pdf: null },
  },
  {
    slug: "digital-trust",
    title: "Digital trust & scam resilience",
    icon: ShieldAlert,
    hook: "Choose this if your primary outcome is helping people resist and recover from digital deception.",
    intro: [
      "Digitally enabled fraud now runs on urgency, impersonation and emotional pressure more than technical attacks. Security tools protect infrastructure — they rarely help at the moment a person must decide: is this request genuine? Should I pay this? How do I verify who sent it? What do I do now that I've been deceived?",
      "The challenge: pick one decision moment where a person must judge whether a request is genuine, or one recovery moment immediately after they've been deceived. Improve that specific moment — by interrupting, verifying, explaining or guiding — without blocking legitimate activity and without demanding surveillance of private communications.",
    ],
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
        body: "An 'urgent' payment instruction arrives from what looks like a senior colleague, customer or vendor, with convincing contextual detail. Introduce proportionate verification, approval or cooling-off steps — without obstructing legitimate work.",
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
        body: "A tool labels a message fraudulent without saying why, or declares it safe with false confidence — users learn to ignore both. Communicate uncertainty honestly, point to the specific suspicious evidence, and recommend verification proportionate to the risk.",
      },
      {
        title: "Small-business incident response",
        body: "After phishing or an account takeover, employees at a small organisation respond inconsistently and destroy evidence in the process. Guide containment, documentation, reporting and recovery.",
      },
    ],
    success: {
      statement: "Do users pause and verify — and recover well when they don't?",
      detail:
        "Judges will measure the moment: whether users actually pause and verify under pressure, how honestly uncertainty is communicated, how false positives and false negatives are each handled, and how quickly an incident is reported and contained after a loss.",
      signals: [
        "Users measurably pause and verify under pressure",
        "Uncertainty stated honestly, with the evidence shown",
        "Protection achieved without invasive monitoring",
      ],
    },
    pitfalls: [
      {
        title: "Fraud detection without evidence",
        body: "The most common failure in this domain. A verdict with no reasoning — 'fraudulent', 'safe' — teaches users to ignore every warning. Show the evidence and state your confidence.",
      },
      {
        title: "The definitive black box",
        body: "Deepfake detection presented as definitive, automatic blocking with no review path, tools that claim to guarantee authenticity. Never claim certainty you don't have.",
      },
      {
        title: "Surveillance as protection",
        body: "Designs that expose users to unnecessary monitoring of their private messages are not permitted. Protect the decision moment, not the whole inbox.",
      },
      {
        title: "Friction that blocks real work",
        body: "Verification that obstructs legitimate payments gets switched off within a week. Use proportionate steps — cooling-off, second approvals, checks through a channel the attacker doesn't control.",
      },
    ],
    links: { guide: null, pdf: null },
  },
];
