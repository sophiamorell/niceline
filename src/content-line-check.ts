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
    startOver: "Start over",
    startOverConfirm: "Start over? This clears everything you've entered.",
  },

  progress: {
    label: "Step {current} of {total}",
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
    bestKicker: "Best customer {n}",
    painfulKicker: "Painful customer {n}",
    label: "What do you call this customer?",
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
    textareaLabel: "Or type it here",
    textareaPlaceholder: "Rambling is fine. A few sentences is plenty.",
    submit: "That's them",
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
    listening: "Listening...",
    denied: "No problem. Type it instead.",
    timeLimit: "That's three minutes, so I stopped listening. Edit below or tap to keep going.",
  },

  followUp: {
    kicker: "A quick question about {nickname}",
    counter: "{current} of {total}",
    answer: "Add that",
    skip: "I don't know",
    merging: "Adding that...",
    failed: "That didn't go through. Try again, or skip it.",
  },

  review: {
    headline: "Here's what I heard about {nickname}",
    body: "Fix anything that's wrong. Tap a chip to edit it.",
    notMentioned: "Not mentioned",
    unknown: "Unknown",
    editLabel: "Edit {field}",
    addAnotherBest: "Add another best customer",
    addSecondBest: "Add your second best customer",
    needTwo: "Two best customers is the minimum. Three is better.",
    nextToPainful: "Next: a customer you'd rather forget",
    addAnotherPainful: "Add another painful customer",
    nextToCheck: "Next: check it side by side",
    remove: "Remove this customer",
    removeConfirm: "Remove {nickname}?",
  },

  painIntro: {
    headline: "Now the one you wish you'd never signed",
    body: "This is optional, but it's the most useful part. The difference between your best and worst customers is where your real criteria show up.",
    add: "Add a painful customer",
    skip: "Skip this step",
  },

  grid: {
    headline: "Does this look right?",
    body: "Your best customers are on the left, painful ones on the right. Tap any chip to fix it.",
    best: "Best",
    painful: "Painful",
    button: "Find the pattern",
  },

  draft: {
    kicker: "Your ideal customer profile (draft)",
    loading: "Finding the pattern...",
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
    headline: "Where should I send it?",
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
    kicker: "Your scoring rubric",
    headline: "Score any new lead in under a minute",
    body: "Five criteria, weighted by how clearly they separated your best customers from the rest. Points add up to 100.",
    sharedBody: "Someone shared this rubric with you. Pick a level for each criterion to score a lead.",
    criterion: "Criterion",
    weight: "Weight",
    levels: "Levels",
    pointsSuffix: "pts",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: "Couldn't copy. The link is in your address bar.",
    download: "Download as PDF",
    scorerHeadline: "Check a lead",
    scorerBody: "Pick what you know about the prospect. The score updates as you go.",
    pick: "Pick one",
    score: "Score",
    answered: "{n} of {total} answered",
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
    signOff: "Tips up,",
    name: "Sophie",
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
