/**
 * Line Check: content
 *
 * Every user-facing string for the Line Check tool (/line-check). Components
 * under src/components/line-check read from here and carry no copy of their
 * own. Same rules as src/content.ts: American English, no em or en dashes.
 *
 * Conventions
 *   TODO(sophie)   a value Sophie owns; the placeholder ships if still open
 *   {token}        replaced at render time with fill() from src/lib/copy.ts
 *
 * The AI system prompts are not user-facing copy and live with the API
 * routes in src/lib/line-check/prompts.ts.
 */

import type { CategoryKey, FieldKey } from "@/lib/line-check/types";

export const lineCheck = {
  meta: {
    title: "Line Check: find out which customers are worth chasing | Nice Line Marketing",
    description:
      "A free five-minute tool. Describe your best and worst customers and get a draft ideal customer profile and a scoring rubric for new leads.",
  },

  // TODO(sophie): the booking link for the closing block. null hides the button.
  bookingUrl: null as string | null,

  // Shown on the intro screen and next to the mic on first use (brief, section 9).
  privacy:
    "Your voice is turned into text by your browser's speech service, and the text is sent to an AI model to sort it into categories. Nothing is saved until you choose to send it to me. Nicknames are fine.",

  header: {
    homeLabel: "Nice Line Marketing, home",
    startOverConfirm: "Start over? This clears everything you've entered.",
  },

  progress: {
    counter: "{current}/{total}",
    label: "Step {current} of {total}: {stage}",
    stages: ["Best customers", "Painful customers", "Check", "Draft profile", "Your details", "Rubric"],
  },

  back: "Back",
  next: "Next",

  intro: {
    kicker: "Line Check · Free tool",
    headline: "Find out which customers are worth chasing, in five minutes.",
    body: "Tell me about a few of your best customers and one you wish you'd never signed. I'll find what the good ones have in common and turn it into a profile and a scoring tool your team can use on any new lead.",
    note: "You can talk or type. Use nicknames instead of real company names if you like.",
    button: "Start with your best customer",
  },

  nickname: {
    bestKicker: "Best customer · {n} of 3",
    painfulKicker: "Painful customer · {n} of 2",
    label: "What do you call this customer?",
    body: "Pick one you'd clone if you could. A nickname is fine.",
    placeholder: "the eye surgery center in Tucson",
    required: "Give them a nickname so I can keep them straight.",
  },

  tell: {
    bestPrompt: "Tell me about {nickname}.",
    bestHelper:
      "Who are they? What was going on when they bought? Who signed, and who uses it? What were they doing before you? What's it been like since?",
    painfulPrompt: "Tell me about {nickname}.",
    painfulHelper:
      "Why were they hard? Slow to close, discounted, churned, never used it, wrong buyer?",
    textareaLabel: "Type it",
    divider: "or type it",
    textareaPlaceholder: "Start anywhere. I'll sort it out.",
    submit: "Sort what I said",
    reading: "Reading that...",
    tooShort: "Say or type a little more first.",
    extractFailed: "Something went wrong reading that. Try again, or edit the fields by hand.",
    fillByHand: "Fill in the fields by hand",
    retry: "Try again",
  },

  mic: {
    start: "Tap to talk",
    stop: "Stop",
    hint: "Tap and talk for a minute or two. Rambling is fine.",
    listening: "Listening",
    followUpHint: "Talk, or type below.",
    denied: "No problem. Type it instead.",
    timeLimit: "That's three minutes, so I stopped listening. Edit below or tap to keep going.",
  },

  followUp: {
    kicker: "One quick question · {current} of {total}",
    answerLabel: "Your answer",
    answer: "Add to the profile",
    skip: "I don't know",
    merging: "Adding that...",
    failed: "That didn't go through. Try again, or skip it.",
  },

  review: {
    headline: "Here's what I heard about {nickname}",
    body: "Fix anything that's wrong. Tap a chip to edit it.",
    notMentioned: "{field}: not mentioned",
    unknown: "{field}: unknown",
    // After a role prefix ("PUSHED not mentioned")
    notMentionedShort: "not mentioned",
    unknownShort: "unknown",
    editLabel: "Edit {field}",
    evidence: "You said: \u201c{evidence}\u201d",
    // Prefixes inside the "Who bought it" chips
    roles: { signer: "Signed", champion: "Pushed", users: "Uses" } as Record<string, string>,
    looksRight: "Looks right",
    addAnotherPainfulGhost: "Add another painful customer",
    remove: "Remove this customer",
    removeConfirm: "Remove {nickname}?",
  },

  bestList: {
    headlines: ["One good one so far.", "Two good ones. Nice.", "Three good ones. Nice."],
    bodies: [
      "Two is the minimum. Three is better.",
      "That's enough to see a pattern. A third makes it sharper.",
      "That's plenty to see a pattern.",
    ],
    edit: "Edit",
    editLabel: "Edit {nickname}",
    addSecond: "Add your second best customer",
    addAnother: "Add another best customer",
    next: "Next: a customer you'd rather forget",
  },

  painIntro: {
    kicker: "Optional · most useful part",
    headline: "Now the one you wish you'd never signed",
    body: "This is optional, but it's the most useful part. The difference between your best and worst customers is where your real criteria show up.",
    nicknameLabel: "What do you call them?",
    placeholder: "the hospital outpatient wing",
    helper: "Why were they hard? Slow to close, discounted, churned, never used it, wrong buyer?",
    add: "Add a painful customer",
    skip: "Skip this step",
    needNickname: "Give them a nickname first.",
  },

  grid: {
    headline: "Does this look right?",
    hint: "Swipe sideways for more customers. Tap any cell to edit it.",
    // Short row labels for the grid
    rows: {
      company: "Who they are",
      situation: "What was happening",
      buyer: "Who bought it",
      before: "Used before",
      economics: "How it went",
    } as Record<CategoryKey, string>,
    empty: "Nothing yet",
    editing: "{nickname} · {category}",
    done: "Done",
    button: "Find the pattern",
  },

  draft: {
    kicker: "Your ideal customer profile (draft)",
    loadingKicker: "Reading {n} customers",
    loadingAgainst: "Comparing your best against {nickname} ...",
    loadingBest: "Comparing your best customers ...",
    stages: ["What the good ones share", "What the painful one doesn't", "Writing it up plainly"],
    stagesNoPainful: ["What the good ones share", "Where they differ", "Writing it up plainly"],
    failed: "Something went wrong finding the pattern. Try again in a moment.",
    retry: "Try again",
    sharedHeading: "What your best customers share",
    avoidHeading: "Who to say no to",
    avoidEmpty: "Add a painful customer to see who to avoid",
    confidence:
      "This is built from {n} customers, so treat it as a starting hypothesis. The next step is checking it against your CRM to see if it holds across all your deals.",
    explainerHeading: "What's an ICP?",
    explainer:
      "An ideal customer profile describes the companies most likely to buy quickly, pay full price, stay, and refer others. It tells your team where to spend time and who to politely pass on.",
    teaserHeadline: "Turn this into a tool your team can use",
    teaserBody:
      "Get a weighted scoring rubric built from your answers, and a live scorer to check any new lead against it in under a minute.",
    teaserButton: "Get my scoring rubric",
  },

  gate: {
    headline: "Where should I send your rubric?",
    firstName: "First name",
    company: "Company",
    email: "Work email",
    optIn: "Send me occasional notes from Sophie on building a marketing function.",
    small: "I'll email you a copy of your profile and rubric. I won't share your answers with anyone.",
    button: "Show my rubric",
    sending: "Sending...",
    required: "Fill in all three so I know who you are.",
    invalidEmail: "That email doesn't look right.",
    failed: "That didn't send. Try again, or email me at {email}.",
  },

  rubric: {
    kicker: "Scoring rubric · 100 points",
    headline: "Nice work, {name}. Here's how to score a lead.",
    headlineNoName: "Here's how to score a lead.",
    sharedBody: "Someone shared this rubric with you. Pick a level for each criterion to score a lead.",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: "Couldn't copy. The link is in your address bar.",
    download: "Download PDF",
    scorerKicker: "Score a new lead",
    scorerHeadline: "Is this one worth chasing?",
    prospectLabel: "Prospect",
    prospectPlaceholder: "the vet clinic in Boise",
    pick: "Pick one",
    option: "{label} · {points}",
    scoreOf: "{score} / 100",
    emptyTier: "Pick what you know below",
    emptyLetter: "?",
    tiers: [
      { min: 75, tier: "A", label: "Go after them" },
      { min: 50, tier: "B", label: "Worth a conversation" },
      { min: 0, tier: "C", label: "Probably not a fit right now" },
    ],
    profileHeading: "Your profile",
    makeYourOwn: "Make your own with Line Check",
  },

  closing: {
    headline: "Want to check this against your real pipeline?",
    body: "Three customers make a good hypothesis. Your CRM tells you whether it holds. That's the first thing I do in Step 1 of working together.",
    button: "Book a 30-minute walkthrough",
    signOff: "Tips up, Sophie",
    startOver: "Start over with new customers",
  },

  categories: {
    company: "Who they are",
    situation: "What was happening",
    buyer: "Who bought it",
    before: "What they used before",
    economics: "How it went",
  } satisfies Record<CategoryKey, string>,

  fields: {
    industry: "Industry",
    size: "Size",
    geography: "Location",
    ownership: "Ownership",
    trigger: "What was going on",
    signer: "Who signed",
    champion: "Who pushed for it",
    users: "Who uses it",
    previousSolution: "Before you",
    salesCycle: "Sales cycle",
    discounting: "Discounting",
    retention: "Stayed or left",
    expansion: "Grew the account",
    referred: "Referred others",
  } satisfies Record<FieldKey, string>,

  // Field names for the Netlify form (public/__forms.html, form "line-check").
  netlifyFormName: "line-check",

  // Analytics event names (brief, section 10)
  events: {
    start: "icp_start",
    customerAdded: "icp_customer_added",
    dictationUsed: "icp_dictation_used",
    typed: "icp_typed",
    followUpAnswered: "icp_followup_answered",
    followUpSkipped: "icp_followup_skipped",
    synthesisShown: "icp_synthesis_shown",
    gateSubmitted: "icp_gate_submitted",
    scorerUsed: "icp_scorer_used",
    bookingClicked: "icp_booking_clicked",
    abandoned: "icp_abandoned",
  },
};
