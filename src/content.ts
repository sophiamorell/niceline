/**
 * Nice Line Marketing: site content
 *
 * Single source of truth for every string, price, placeholder and diagnostic
 * rule on the page. Components read from here and never carry copy of their own.
 * Copy and structure: the site v2 design handoff (Claude Design),
 * with the standing rules from site-edits.md applied to it (American English,
 * no em or en dashes; ranges use a plain hyphen).
 *
 * Conventions
 *   TODO(sophie)        copy Sophie owns; the placeholder ships if still open at build
 *   [square brackets]   placeholder copy; renders muted so it's visible on the preview
 *   status: "draft"     real copy, renders normally
 *   release.*           what's visible; flip flags, don't fork the file
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PhaseId = 1 | 2 | 3;
export type CopyStatus = "final" | "draft" | "placeholder";

export interface Phase {
  id: PhaseId;
  tag: string; // "Step 1"
  duration: string;
  weeks: number; // this step's share of the duration bar (4, then about 6 for a 4-8 week step)
  question: string;
  outcome: string; // what you have at the end of the step: the card's heading
  yourTime: string | null;
  youKeep: string[];
  win?: string; // a campaign in market: shown last in the list, styled as an outcome
  status: CopyStatus;
}

export interface StepPrice {
  phase: PhaseId;
  price: number | null;
  featured?: boolean; // gets the badge
}

export interface DiagnosticOption {
  id: string;
  label: string;
  score: number | null; // null = not scored (hiring intent / free text)
}

export interface DiagnosticQuestion {
  id: number;
  prompt: string;
  kind: "single" | "twoNumbers" | "freeText";
  options?: DiagnosticOption[];
  fields?: { id: string; label: string; placeholder?: string }[]; // twoNumbers
  required?: boolean; // default true; Q10 is optional
  gap?: string; // what a low score means
  freeFix?: string; // the free-fix line in the results email
  phase?: string; // which step addresses it
}

export interface FaqItem {
  question: string;
  answer: string;
  status: CopyStatus;
  show: boolean;
}

/* ------------------------------------------------------------------ */
/*  Release switches                                                   */
/* ------------------------------------------------------------------ */

export const release = {
  version: "v1" as "v0" | "v1",
  directDiagnosticRoute: false, // /diagnostic
  showWhatYouGet: true, // the deliverables grid (titles final, bodies and screenshots pending)
  showProof: false, // testimonials: off until real quotes arrive
  showPricingTerms: false, // payment terms + add-ons under the bundle row
  showLocalsNote: false, // the Durango locals footnote under the bundle row
  showPrices: false, // step prices and the total; off for now (the prices stay in pricing.steps)
  showExclusionsFaq: false, // until exclusions are decided
};

/* ------------------------------------------------------------------ */
/*  Site                                                               */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Nice Line Marketing",
  domain: "niceline.marketing",
  title: "Nice Line Marketing: marketing for B2B companies before their first marketing hire",
  description:
    "Fractional marketing for B2B companies with product-market fit and no marketing team. A fixed-price program in three steps, run by Sophie Williams in Durango, Colorado.",
  tagline: "People buy what you built. I'll help you sell more of it.",
  location: "Durango, Colorado",
  email: "sophie@niceline.marketing" as string | null,
  linkedin: "https://www.linkedin.com/in/sophiamwilliams/" as string | null, // About and the footer
  bookingUrl: null as string | null, // TODO(sophie): Calendly or equivalent; used in thank-you state and results email only
  bookingLabel: "Book the free 45-minute walkthrough",
};

export const anchors = {
  top: "top",
  howItWorks: "how",
  deliverables: "deliverables",
  pricing: "pricing",
  about: "about",
  testimonials: "testimonials",
  diagnostic: "diagnostic",
};

/* ------------------------------------------------------------------ */
/*  Logo (Nice Line Marketing: S-curve mark and wordmark) and nav      */
/* ------------------------------------------------------------------ */

export const logo = {
  // Stacked ski line and wordmark (public/brand), in the header and the footer
  header: { src: "/brand/nice-line-logo-nav.svg", width: 899, height: 211 },
  // Flat, one colour, no echoes: the scrolled header's teal bar only
  simple: { src: "/brand/nice-line-logo-simple-white.svg", width: 899, height: 198 },
  ariaLabel: "Nice Line Marketing, home",
  alt: "Nice Line Marketing",
};

export const nav = {
  links: [
    { label: "Steps & pricing", href: `#${anchors.howItWorks}` },
    { label: "What you get", href: `#${anchors.deliverables}` },
    { label: "About", href: `#${anchors.about}` },
  ],
  cta: { label: "See what to fix first", href: `#${anchors.diagnostic}` }, // matches every other CTA
};

/* ------------------------------------------------------------------ */
/*  1 · Hero                                                           */
/* ------------------------------------------------------------------ */

export const hero = {
  kicker: "Fractional marketing leadership for B2B companies", // small line above the opener; the name no longer says who this is for
  opener: "You built something people buy.", // the 40px regular line; hover shows the tooltip
  tooltip: "Nice", // what you say at the bottom of a good run
  headline: "Now build the marketing to",
  headlineHighlight: "sell more", // on the highlighter band
  headlineAfter: " of it.",
  subhead: "Growth stalls when nobody owns marketing.",
  bullets: [
    "Pipeline shows up when it feels like it, so the forecast is mostly hope",
    "Nobody owns the story, so everyone tells it differently",
    "You know you'll eventually need a marketer, but not who or when",
  ],
  primaryCta: { label: "See what to fix first", href: `#${anchors.diagnostic}` },
  secondaryCta: { label: "Steps & pricing", href: `#${anchors.howItWorks}` },
  // The clickable card on the right: a picture of question 1 that opens the diagnostic popup
  card: {
    ariaLabel: "See what to fix first: start the 10-question diagnostic",
    progressLabel: "Question 1 of 10",
    prompt: "Who owns marketing at your company today?",
    options: ["Nobody. Marketing, who?", "Someone, on the side", "We're about to hire for it"], // the three answers founders give most
    selectedIndex: 0, // drawn as selected
    buttonLabel: "See what to fix first",
  },
};

/* ------------------------------------------------------------------ */
/*  2 · Why marketing, why now (the timeline)                          */
/* ------------------------------------------------------------------ */

export const whyNow = {
  kicker: "Why marketing, why now",
  headingLines: ["You built product. You built sales.", "Next up, marketing."], // second line in terracotta
  badge: "You are here",
  steps: [
    {
      numeral: "01",
      status: "Built",
      title: "Product",
      lead: "You found product-market fit.",
      body: "Nice work. That's the hardest part.",
      current: false,
    },
    {
      numeral: "02",
      status: "Built",
      title: "Sales",
      lead: "You've perfected your pitch.",
      body: "Awesome, and now you have real, dependable revenue.",
      current: false,
    },
    {
      numeral: "03",
      status: "Next up",
      title: "Marketing",
      lead: "Marketing, who?",
      body: "Without marketing, you aren't building pipeline and ",
      bodyHighlight: "growth is capped", // on the highlighter band
      bodyAfter: ".",
      current: true,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  3 · Does this sound like you?                                      */
/* ------------------------------------------------------------------ */

export const checklist = {
  heading: "Does this sound like you?",
  subheading: "Check all that feel true to you.",
  items: [
    "Your CRM has thousands of contacts and no way to tell which ones matter",
    "You'd hesitate to show the board your pipeline report",
    "Most of your wins come from referrals and personal connections, and you can't forecast either",
    "Ask five people who your ideal customer is and you'll get five answers",
    "Your website says one thing, your deck says another, and every rep says something else",
    "You can't point to hard numbers on what's actually filling your pipeline",
  ], // no closing periods: they read as list items next to the checkboxes
  // The verdict bar under the checks. {n} = checked count, {total} = items.length
  verdicts: {
    none: "Nothing checked yet. Most teams check three.",
    one: "{n} of {total}. Definitely worth a free check.",
    two: "{n} of {total}. Yeah ... probably want to see what to fix first.",
    threeOrMore: "{n} of {total}. This is your sign to click the button.",
  },
  threshold: 3,
  ctaLabel: "See what to fix first",
  ctaHref: `#${anchors.diagnostic}`,
};

/* ------------------------------------------------------------------ */
/*  4 · How it works: three step cards and the bundle row (option 1a)  */
/* ------------------------------------------------------------------ */

export const howItWorks = {
  kicker: "The line",
  heading: "A marketing function in about four months.",
  // {today} and {target} are filled in the visitor's browser (today, and today
  // plus targetMonths) as date pills; nothing shows until then. No "?" at the end.
  datedIntro: "Today is {today} ... wouldn't it be great to have a marketing function in place by {target}",
  targetMonths: 4, // matches the "about four months" heading (the steps run 12-20 weeks)
  // Phones: each step card collapses; the +/− button's accessible names
  toggleShow: "Show what {step} includes",
  toggleHide: "Hide what {step} includes",
  yourTimeLabel: "Your time: {time}",
};

export const phases: Phase[] = [
  {
    id: 1,
    tag: "Step 1",
    duration: "4 weeks",
    weeks: 4,
    question: "What can we win now?",
    outcome: "A campaign in market and first results inside a month.",
    yourTime: "about 5 hours in meetings, plus async approvals.",
    youKeep: [
      "A triage of your contact database: what's usable, what isn't, what to suppress",
      "Provisional sales stages and lead qualification criteria",
      "A prioritized list of near-term segments",
      "A campaign dashboard and baseline report",
    ],
    win: "One campaign live, built from the proof you already have",
    status: "final",
  },
  {
    id: 2,
    tag: "Step 2",
    duration: "4-8 weeks",
    weeks: 6,
    question: "Who do we sell to, and how?",
    outcome: "A sales process and CRM your team actually runs on.",
    yourTime: "about 8 hours, mostly with you and whoever owns the CRM.",
    youKeep: [
      "Product Market Fit & Customer Proof Study, built from 4-6 customer interviews",
      "Your ICP Rubric & AI Evaluator",
      "Deal Qualifying Framework, with sales stages and entry criteria",
      "A CRM you can report from",
    ], // the tool names match "The tools you keep"
    win: "2-3 additional campaigns in market",
    status: "final",
  },
  {
    id: 3,
    tag: "Step 3",
    duration: "4-8 weeks",
    weeks: 6,
    question: "How do we reach them?",
    outcome: "The right accounts reached, and numbers you can trust.",
    yourTime: "about 6 hours, plus one weekly 30-minute review.",
    youKeep: [
      "Activated CRM data: segments and live lists your campaigns run on",
      "Pipeline and forecast dashboards built on metrics you can trust",
      "Competitive Intel Agent",
      "Product Marketing Toolkit, with playbooks and documentation for everything I built",
      "Team enablement, so whoever owns marketing next can run it",
      "Marketing Budget & Next Steps, including when to make your first hire",
    ], // the tool names match "The tools you keep"
    win: "2-3 additional campaigns in market",
    status: "final",
  },
];

/* ------------------------------------------------------------------ */
/*  5 · What you get (the deliverables grid)                            */
/* ------------------------------------------------------------------ */

/* The built visuals in each tool's slot: small UI illustrations drawn on a
   560 x 280 artboard. Figures are illustrative; no client names or frameworks. */
export type Tone = "sea" | "mid" | "sun" | "pink" | "deep"; // sea glass, sea mid, sunflower, pink, sea ink

export type ToolVisual =
  | {
      kind: "proof";
      kicker: string;
      rows: { label: string; share: number; value: string; tone: Tone }[];
      footer: { before: string; bold: string; after: string };
      quote: { mark: string; text: string; who: string };
    }
  | {
      kind: "score";
      score: string;
      outOf: string;
      tier: string;
      campaign: string;
      kicker: string;
      rows: { label: string; share: number; value: string; tone: Tone }[]; // also drawn as the stacked bar
      mix: { share: number; tone: Tone }[];
    }
  | {
      kind: "qualify";
      chips: string[];
      own: string; // the pink chip
      joiner: string;
      tiles: { letter: string; word: string; pop?: boolean }[];
    }
  | {
      kind: "intel";
      kicker: string;
      was: string;
      now: string;
      unit: string;
      changed: string;
      note: { before: string; bold: string };
      card: { kicker: string; badge: string; heading: string; points: string[] };
    }
  | {
      kind: "toolkit";
      tabs: string[];
      active: string;
      quote: { open: string; text: string; close: string };
      answer: { before: string; bold: string; after: string };
      usedBy: string;
      users: string[];
    }
  | {
      kind: "budget";
      kicker: string;
      split: { label: string; share: number; tone: Tone }[];
      card: { kicker: string; heading: string; items: string[] };
    };

export const whatYouGet = {
  kicker: "What you get",
  heading: "The tools you keep",
  introLines: [
    "You get quick wins in Step 1.",
    "Steps 2 and 3 ship the tools, built on your data, and they stay with you when I'm done.",
  ], // each on its own line
  stepLabel: "Built in Step {n}",
  items: [
    {
      numeral: "01",
      title: "Product Market Fit & Customer Proof Study",
      visualLabel: "Illustration: where wins come from, with a customer quote",
      step: 2 as PhaseId,
      body: "Where your wins actually come from, how fast they close, and why you lose. Plus the customer quotes and references that prove it.",
      image: "/images/deliverables/pmf-proof-study.png",
      visual: {
        kind: "proof",
        kicker: "Where wins come from",
        rows: [
          { label: "Segment A", share: 1, value: "58%", tone: "sea" },
          { label: "Segment B", share: 0.46, value: "27%", tone: "mid" },
          { label: "Segment C", share: 0.26, value: "15%", tone: "mid" },
        ],
        footer: { before: "Closes in ", bold: "41 days", after: ", median" },
        quote: { mark: "\u201c", text: "We cut reporting time in half.", who: "Happy customer" },
      },
    },
    {
      numeral: "02",
      title: "Your ICP Rubric & AI Evaluator",
      visualLabel: "Illustration: a prospect scored 90 of 100",
      step: 2 as PhaseId,
      body: "A weighted scoring rubric for your best-fit customer, built into a tool your team can run on any prospect.",
      image: "/images/deliverables/icp-rubric-evaluator.png",
      visual: {
        kind: "score",
        score: "90",
        outOf: "of 100",
        tier: "Tier 1",
        campaign: "Primary campaign",
        kicker: "Where the score comes from",
        rows: [
          { label: "Company type", share: 1, value: "30/30", tone: "sea" },
          { label: "Volume", share: 0.72, value: "18/25", tone: "sun" },
          { label: "Cost to serve", share: 1, value: "20/20", tone: "pink" },
          { label: "Complexity", share: 0.8, value: "12/15", tone: "mid" },
          { label: "Buyer mix", share: 1, value: "10/10", tone: "deep" },
        ],
        mix: [
          { share: 0.3, tone: "sea" },
          { share: 0.18, tone: "sun" },
          { share: 0.2, tone: "pink" },
          { share: 0.12, tone: "mid" },
          { share: 0.1, tone: "deep" },
        ],
      },
    },
    {
      numeral: "03",
      title: "Deal Qualifying Framework",
      visualLabel: "Illustration: a qualifying framework spelling FOCUS",
      step: 2 as PhaseId,
      body: "The questions a lead has to pass before it becomes a deal. They double as your discovery script.",
      image: "/images/deliverables/qualifying-framework.png",
      visual: {
        kind: "qualify",
        chips: ["BANT", "MEDDIC"],
        own: "Your qualifications",
        joiner: "+",
        tiles: [
          { letter: "F", word: "Fit" },
          { letter: "O", word: "Owner" },
          { letter: "C", word: "Cost", pop: true },
          { letter: "U", word: "Urgency" },
          { letter: "S", word: "Size" },
        ],
      },
    },
    {
      numeral: "04",
      title: "Competitive Intel Agent",
      visualLabel: "Illustration: a competitor price change and a battlecard",
      step: 3 as PhaseId,
      body: "Monitors your competitors' sites, pricing and messaging, flags what changed, and keeps a battlecard your reps can use on the next call.",
      image: "/images/deliverables/competitive-intel-agent.png",
      visual: {
        kind: "intel",
        kicker: "Competitor A · Pricing",
        was: "$49",
        now: "$59",
        unit: "/seat",
        changed: "Changed today",
        note: { before: "Homepage now says ", bold: '"built for enterprise"' },
        card: {
          kicker: "Battlecard",
          badge: "Updated",
          heading: "When they bring up price",
          points: ["Ask what the extra $10 buys", "Lead with setup time"],
        },
      },
    },
    {
      numeral: "05",
      title: "Product Marketing Toolkit",
      visualLabel: "Illustration: an objection-handling page in the toolkit",
      step: 3 as PhaseId,
      body: "Messaging, personas, objection handling and proof in one place that your team and your website pull from.",
      image: "/images/deliverables/pmm-toolkit.png",
      visual: {
        kind: "toolkit",
        tabs: ["Messaging", "Personas", "Objections", "Proof"],
        active: "Objections",
        quote: { open: "\u201c", text: "It's too expensive.", close: "\u201d" },
        answer: {
          before: "Show the cost of the current process first. Then the proof: Customer B paid it back in ",
          bold: "5 months",
          after: ".",
        },
        usedBy: "Used by",
        users: ["Sales", "Website"],
      },
    },
    {
      numeral: "06",
      title: "Marketing Budget & Next Steps",
      visualLabel: "Illustration: a year-one budget split and a first-hire plan",
      step: 3 as PhaseId,
      body: "Recommended next steps, marketing budget, and access to tools. I'll even help you find your next marketing hire.",
      image: "/images/deliverables/budget-first-hire.png",
      visual: {
        kind: "budget",
        kicker: "Year one budget",
        split: [
          { label: "Content", share: 0.4, tone: "sea" },
          { label: "Paid", share: 0.25, tone: "sun" },
          { label: "Events", share: 0.2, tone: "pink" },
          { label: "Tools", share: 0.15, tone: "mid" },
        ],
        card: {
          kicker: "Your first hire",
          heading: "Marketing manager",
          items: ["Job description", "90-day plan", "Scorecard"],
        },
      },
    },
  ] as {
    numeral: string;
    title: string;
    visualLabel: string; // names the illustration for screen readers
    step: PhaseId;
    body: string;
    image: string; // a real screenshot, if one lands in public/, replaces the visual
    visual: ToolVisual;
  }[],
  status: "draft" as CopyStatus, // titles final; bodies are draft copy
};

/* ------------------------------------------------------------------ */
/*  Pricing (rendered inside 4 · How it works) and the contact popup   */
/* ------------------------------------------------------------------ */

export const pricing = {
  badge: "Start here", // on the featured step
  emptyPrice: "TBD", // fills a null price
  steps: [
    { phase: 1, price: 7000, featured: true },
    { phase: 2, price: 14000 },
    { phase: 3, price: 14000 },
  ] as StepPrice[],
  // The ink strip under the cards (#pricing): "All three steps · $35,000", the note and
  // the button. The total is computed from steps, and shows as emptyPrice until every step has a price.
  bundle: {
    label: "All three steps", // the strip's title while release.showPrices is off
    title: "All three steps · {total}", // with prices on; {total} renders in sunflower
    campaigns: "5-7 campaigns live", // a pink pill, like the campaign boxes in the cards
    note: "About half the cost of a senior marketer for four months, with no three-month search first.",
  },
  ctaLabel: "Let's talk", // opens the contact popup
  // Shown while release.showLocalsNote is true
  localsNote: {
    before: "Own a business in Durango, CO? Let's ",
    emphasis: "definitely", // bold, on the highlighter band
    after: " talk.",
  },
  // Shown while release.showPricingTerms is true
  terms:
    "50% of each step at kickoff, 50% on delivery. Net 15. Ad spend, data and tool costs are passed through at cost. Add-ons by change order: conference-to-pipeline, regulated-buyer messaging, community setup, website.",
};

/* The "Let's talk" popup: a short contact form posted to Netlify Forms */
export const contact = {
  netlifyFormName: "contact",
  closeLabel: "Close",
  kicker: "Let's talk",
  heading: "Tell me where marketing stands.",
  fields: [
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Work email", type: "email", required: true },
    { id: "company", label: "Company", type: "text", required: false },
    { id: "message", label: "What's going on?", type: "textarea", required: false },
  ],
  errors: {
    required: "Please fill this in.",
    email: "That email doesn't look right.",
  },
  submitLabel: "Send to Sophie",
  sendingLabel: "Sending…",
  sendFailed: "That didn't send. Email {email} directly.",
  sent: {
    kicker: "Sent",
    heading: "Thanks. I'll be in touch.",
    sub: "Expect a reply within two business days.",
    signOff: "Tips up, Sophie",
    closeLabel: "Close",
  },
};

/* ------------------------------------------------------------------ */
/*  7 · About                                                          */
/* ------------------------------------------------------------------ */

export const about = {
  kicker: "Who you'll work with",
  heading: "Hi, I'm Sophie.",
  photo: "/images/sophie.jpg", // renders as the arch placeholder if the file is missing
  photoAlt: "Sophie Williams, Nice Line Marketing",
  photoPlaceholder: "Portrait goes here",
  // `lead` renders bold at the start of its paragraph
  paragraphs: [
    {
      text: "I co-founded and ran an enterprise software company for eleven years, through its acquisition in 2022. I wrote the positioning, built the decks, ran the launches, and enabled our revenue team to close deals. That was the first marketing function I built.",
    },
    {
      text: "After the acquisition, I built the product marketing function at the acquirer from zero. That was the second.",
    },
    {
      text: "Both times, I saw the same thing: an intentional, owned marketing function is what gets a company over the headwall and into sustainable growth.",
    },
    {
      lead: "Why Nice Line?",
      text: "Because there's nothing better than a beautiful ski line. And picking the right line, with intention and the goal in mind, is most of this job. (A good line of copy never hurts, either.)",
    },
  ] as { lead?: string; text: string }[],
  linkedinLabel: "Connect on LinkedIn", // under the paragraphs, when site.linkedin is set; opens in a new tab
  status: "final" as CopyStatus,
};

/* ------------------------------------------------------------------ */
/*  8 · FAQ                                                            */
/* ------------------------------------------------------------------ */

export const faq = {
  kicker: "Questions",
  heading: "Maybe you're wondering ...",
  items: [
    {
      question: "What do you need from us before starting Step 1?",
      answer: "Access to your CRM (or a CRM export), access to whatever analytics you have, and two hours of your calendar in week one.",
      status: "final",
      show: true,
    },
    {
      question: "We don't have a CRM, or ours is a spreadsheet.",
      answer: "That is common, and it is fine. Step 1 works from the spreadsheet; Step 2 is where I decide whether a real CRM is worth standing up.",
      status: "final",
      show: true,
    },
    {
      question: "Will you hire our first marketer?",
      answer: "I'm not a search firm, but Step 3's Marketing Budget & Next Steps includes a first-hire plan: the job description, the first 90 days, and a scorecard to hire against.",
      status: "final",
      show: true,
    },
    {
      question: "Will you talk to our customers?",
      answer: "Yes, in Step 2. I'll speak to 4-6 customers for the Product Market Fit & Customer Proof Study. This is the fastest way to find out whether your positioning resonates with buyers.",
      status: "final",
      show: true,
    },
    {
      question: "What happens after Step 3?",
      answer: "It depends. At this point the marketing function is built, documented and running. Some clients continue to work with me, and some hire their first marketer.",
      status: "final",
      show: true,
    },
    {
      question: "Who is this not for?",
      answer: "Companies in very early stages that have not found product-market fit, agencies looking to white-label, and anyone who wants a strategy deck rather than a campaign in market.",
      status: "final",
      show: true,
    },
    {
      question: "We're not a software company. Does this apply?",
      answer: "For sure! Start with clicking \"See what to fix first\" and I'll see where I can help.",
      status: "final",
      show: true,
    },
    {
      question: "What don't you do?",
      answer: "[Placeholder: four exclusions, one line each, with the change-order or partner route for each.]",
      status: "placeholder",
      show: release.showExclusionsFaq,
    },
  ] as FaqItem[],
};

/* ------------------------------------------------------------------ */
/*  9 · Testimonials                                                   */
/* ------------------------------------------------------------------ */

export const proof = {
  kicker: "From clients",
  heading: "What clients say",
  // TODO(sophie): real quotes, names and photos. These are the design's slots.
  testimonials: [
    {
      quote: "Testimonial one goes here, ideally a sentence that names a number and the decision it changed.",
      name: "Founder name",
      title: "Title, Company",
      photo: null as string | null,
    },
    {
      quote: "Testimonial two goes here: what the team does differently now, in the founder's own words.",
      name: "Founder name",
      title: "Title, Company",
      photo: null as string | null,
    },
    {
      quote: "Testimonial three goes here: the moment they knew it was working.",
      name: "Founder name",
      title: "Title, Company",
      photo: null as string | null,
    },
  ],
  status: "placeholder" as CopyStatus,
};

/* ------------------------------------------------------------------ */
/*  10 · The diagnostic                                                */
/* ------------------------------------------------------------------ */

export const diagnostic = {
  heading: "See what to fix first.",
  intro: "Ten questions, results and the three things to fix first will be emailed to you.",
  startLabel: "See what to fix first",
  comesBack: {
    label: "What comes back",
    items: [
      "Your three biggest gaps, prioritized",
      "One fix per gap you can run yourself",
      "Recommended next step",
    ],
    note: "Your answers are used to write your results and nothing else.",
  },
  netlifyFormName: "diagnostic",
  netlifyStartFormName: "diagnostic-start", // the email alone, saved before question 1
  // The popup: email first, then the questions one at a time, then done
  modal: {
    closeLabel: "Close",
    email: {
      heading: "See what to fix first.",
      body: "Ten questions, results and the three things to fix first will be emailed to you.",
      label: "Work email",
      placeholder: "you@company.com",
      invalid: "That email doesn't look right.",
      submitLabel: "Start the 10 questions",
    },
    progressLabel: "Question {current} of {total}",
    backLabel: "Back",
    nextLabel: "Next",
    finishLabel: "Finish",
    sendFailed: "That didn't send. Please try again, or email Sophie at {email}.",
    done: {
      kicker: "{total} of {total}",
      heading: "That's all ten.",
      bodyBefore: "Your three things to fix first will land in ",
      bodyAfter: " within two business days.",
      closeLabel: "Back to the site",
      bookingLabel: site.bookingLabel, // shown only when site.bookingUrl is set
    },
  },

  questions: [
    {
      id: 1,
      prompt: "Who owns marketing today?",
      kind: "single",
      options: [
        { id: "nobody", label: "Nobody", score: 0 },
        { id: "founder", label: "The founder or CEO", score: 0 },
        { id: "generalist", label: "A generalist", score: 1 },
        { id: "marketer", label: "A marketer", score: 2 },
      ],
      gap: "No function",
      freeFix: "Name an owner for the next 90 days, even if it's you.",
      phase: "All",
    },
    {
      id: 2,
      prompt: "Where do most of your wins come from?",
      kind: "single",
      options: [
        { id: "unknown", label: "Don't know", score: 0 },
        { id: "referrals", label: "Referrals", score: 1 },
        { id: "network", label: "Leadership's network", score: 1 },
        { id: "outbound", label: "Outbound", score: 2 },
        { id: "inbound", label: "Inbound", score: 2 },
      ],
      gap: "Winning motion isn't systematized or known",
      freeFix: "Write down the source of your last ten wins.",
      phase: "1",
    },
    {
      id: 3,
      prompt: "Do you trust your win rate?",
      kind: "single",
      options: [
        { id: "no", label: "No", score: 0 },
        { id: "roughly", label: "Roughly", score: 1 },
        { id: "yes", label: "Yes, it's in the CRM", score: 2 },
      ],
      gap: "Data can't be built on",
      freeFix: "Check whether deals enter the CRM at first call or at \"nearly closed\".",
      phase: "1",
    },
    {
      id: 4,
      prompt: "Is your ICP written down somewhere sales uses it?",
      kind: "single",
      options: [
        { id: "head", label: "In one person's head", score: 0 },
        { id: "rough", label: "A rough idea", score: 1 },
        { id: "yes", label: "Yes", score: 2 },
      ],
      gap: "ICP undefined",
      freeFix: "One page: the five things your best ten customers have in common.",
      phase: "2",
    },
    {
      id: 5,
      prompt: "How many contacts are in your CRM, and how many would you email tomorrow?",
      kind: "twoNumbers",
      fields: [
        { id: "contactsTotal", label: "Contacts in the CRM", placeholder: "e.g. 17,000" },
        { id: "contactsEmailable", label: "You'd email tomorrow", placeholder: "e.g. 900" },
      ],
      gap: "Contacts ≠ pipeline",
      freeFix: "Run a deliverability check; archive what bounces.",
      phase: "2",
    },
    {
      id: 6,
      prompt: "If three people described your product, how many versions would you get?",
      kind: "single",
      options: [
        { id: "three", label: "Three", score: 0 },
        { id: "two", label: "Two", score: 1 },
        { id: "one", label: "One", score: 2 },
      ],
      gap: "Messaging inconsistent",
      freeFix: "Agree one sentence and put it at the top of the deck.",
      phase: "3",
    },
    {
      id: 7,
      prompt: "Is there a written definition of a qualified lead?",
      kind: "single",
      options: [
        { id: "no", label: "No", score: 0 },
        { id: "sortOf", label: "Sort of", score: 1 },
        { id: "yes", label: "Yes", score: 2 },
      ],
      gap: "Qualification undefined",
      freeFix: "Write the three things that must be true before a lead becomes a deal.",
      phase: "2",
    },
    {
      id: 8,
      prompt: "When did you last ask a customer for a quote or reference?",
      kind: "single",
      options: [
        { id: "never", label: "Never", score: 0 },
        { id: "thisYear", label: "This year", score: 1 },
        { id: "thisMonth", label: "This month", score: 2 },
      ],
      gap: "Referrals happen by accident",
      freeFix: "Ask your three happiest customers this week.",
      phase: "1→3",
    },
    {
      id: 9,
      prompt: "Are you planning to hire a marketer?",
      kind: "single",
      options: [
        { id: "no", label: "No, not soon", score: null },
        { id: "maybe", label: "Maybe within a year", score: null },
        { id: "yes", label: "Yes, budgeted or hiring now", score: null },
      ],
      gap: "Hiring intent; shapes the walkthrough and the Step 3 hiring plan",
      phase: "3",
    },
    {
      id: 10,
      prompt: "What one number do you want to move in 90 days?",
      kind: "freeText",
      required: false, // optional in the stepper
      gap: "Their words",
      phase: "1 kickoff",
    },
  ] as DiagnosticQuestion[],

  /* Scoring: applied by hand for now, in code later */
  scoring: {
    scoredQuestions: [1, 2, 3, 4, 5, 6, 7, 8],
    maxScore: 16,
    // Q5: emailable / total
    q5RatioBands: [
      { belowRatio: 0.25, score: 0 },
      { belowRatio: 0.75, score: 1 },
      { belowRatio: Infinity, score: 2 },
    ],
    // Three lowest-scoring of Q1-Q8; ties broken in this order (data, then who, then message, then system)
    gapTieBreak: [3, 4, 2, 6, 7, 5, 8, 1],
    gapsReported: 3,
    verdicts: [
      { minScore: 0, maxScore: 5, id: "notYet", label: "Not yet: do the free fixes first" },
      { minScore: 6, maxScore: 12, id: "phase1", label: "Step 1 is the right next step" },
      { minScore: 13, maxScore: 16, id: "dontNeed", label: "You don't need this program", requires: { q1: "marketer" } },
      { minScore: 13, maxScore: 16, id: "phase1", label: "Step 1 is the right next step" }, // 13-16 without a marketer
    ],
    q9MaybeNote: "Noted in the results email as the hiring conversation to have after Step 1.",
  },

  /* Results email: hand-written for now, templated later */
  resultsEmail: {
    includes: [
      "Where their marketing stands today (from Q1)",
      "The three things to fix first, one line each on what they cost",
      "The free-fix list in full",
      "The verdict",
      "One link: book the free 45-minute walkthrough",
      "Signed off: Tips up, Sophie",
    ],
    excludes: ["Pricing recap", "Attachments", "Anything else"],
    responseTime: "within two business days",
  },
};

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

export const footer = {
  taglineLines: [site.tagline, site.location],
  linkedinLabel: "LinkedIn", // under the email, when site.linkedin is set; opens in a new tab
  cta: { label: "See what to fix first", href: `#${anchors.diagnostic}` },
};

/* ------------------------------------------------------------------ */
/*  Analytics                                                          */
/* ------------------------------------------------------------------ */

export const analytics = {
  // diagnostic_start: first answer given; diagnostic_step: each advance, with the step number
  v0: ["diagnostic_start", "diagnostic_step", "diagnostic_submit", "booking_click"],
  v1: ["diagnostic_start", "diagnostic_step", "diagnostic_submit", "booking_click"],
};

/* ------------------------------------------------------------------ */
/*  Everything, for components that want one import                    */
/* ------------------------------------------------------------------ */

export const content = {
  release,
  site,
  anchors,
  logo,
  nav,
  hero,
  whyNow,
  checklist,
  howItWorks,
  phases,
  whatYouGet,
  pricing,
  contact,
  about,
  faq,
  proof,
  diagnostic,
  footer,
  analytics,
};

export default content;
