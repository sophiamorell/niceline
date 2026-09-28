# Nice Line Marketing — v0 build (Claude Code handoff)

Put this file and `content.ts` in the repo, then start Claude Code with:

> Read BUILD.md and src/content.ts, then build the site exactly as BUILD.md describes. Ask me nothing you can answer from those two files. When you're done, give me the report BUILD.md asks for.

---

## What you're building

A one-page marketing site for a consulting practice. One buyer, one action.

- **Buyer:** the founder (or whoever owns growth) of a B2B company with no marketing function — grown organically, newly funded, or newly acquired.
- **Action:** every call to action on the page leads to the free diagnostic at `#diagnostic`. Nothing is sold from the page; the diagnostic sells a call.
- **This release (v0)** has one job: a founder who met Sophie in person will look the practice up that evening. In ten seconds the page has to answer *is this real, does she know what she's talking about, what does it cost and what happens next*. It does not need to convert cold traffic; that's v1.

Reference for structure, not visuals: fletchpmm.com (problem → checklist → product → schedule → proof → FAQ → CTA).

## Inputs and the one rule about copy

`src/content.ts` is the single source of truth for every string, price, list and rule on the page. Components import from it and carry no copy of their own. Rules:

- **Never edit a string in `content.ts`.** If something reads wrong or is missing, list it in your final report; don't fix it.
- `null` prices render as `pricing.emptyPrice` (`$—`). If `pricing.floor` is set, also render `pricing.floorLabel` under the pricing table.
- Text marked `status: "draft"` is real copy — render it normally.
- Text marked `status: "placeholder"` or wrapped in `[square brackets]` renders as-is but visually muted, so Sophie can see on the preview what still needs writing. Do not hide it and do not invent replacement text.
- `release.*` flags control what's visible. Build every component, including the hidden ones; render a section only when its flag is true. The v1 pieces (`weekByWeek`, `showProof`, `showWhatYouGet`, `showPricingTerms`, the stepper diagnostic) should exist in code so v1 is a flag flip plus content, not a rebuild.

## Stack and deploy

- Next.js (App Router), TypeScript, deployed on Netlify. Match the conventions of the existing Next.js/Netlify sites in this account (Netlify plugin, `netlify.toml`, Node version) rather than inventing new ones.
- No CMS, no database, no auth, no client-side storage of any kind.
- One route `/`. Add `/diagnostic` only if `release.directDiagnosticRoute` is true (it's false in v0; the anchor is enough).
- Custom domain `niceline.marketing` — configure in Netlify; DNS is being pointed separately. (The old `thefoundersmarketer.com` redirects to it; see `netlify.toml`.)
- Keep dependencies to Next, React and the font loader. No UI kit, no animation library, no analytics SDK.

## Page structure and behaviour

Sticky nav, eleven sections in this order, footer. Section anchors come from `anchors` in `content.ts`.

| # | Section | Source in `content.ts` | Behaviour |
| --- | --- | --- | --- |
| — | Nav | `nav` | Sticky. Wordmark left, three anchor links, one button to `#diagnostic`. Collapses to wordmark + button on mobile. |
| 1 | Hero | `hero` | Wordmark, headline, body, two buttons. Primary → `#diagnostic`, secondary → `#how-it-works`. No image. |
| 2 | Two ways in | `twoWaysIn` | Two equal cards; stacked on mobile. |
| 3 | Checklist | `checklist` | Client component. Six checkboxes. Below them, one line: `ctaBefore` + the CTA button. When the checked count reaches `threshold`, that line becomes `ctaCounted` with `{n}` replaced + the same button. State lives in React only. |
| 4 | How it works | `howItWorks`, `phases` | Heading, three connected cards (question, duration, summary), then `footnote`. Clicking a card scrolls to section 5 and opens that phase's panel. Cards stack vertically on mobile. |
| 5 | Phase detail | `phases` | Accordion, one panel per phase, Phase 1 open by default. Each panel: `job`, then a list under `youGetHeading`, then `yourTime` (skip the line when null). Render `weekByWeek` only when `release.showPhase1WeekByWeek` is true. |
| 6 | Pricing | `pricing` | Heading, subheading, a table: columns = tiers (label, `whoLine`), rows = Phase 1–3 prices. Then `floorLabel` if `floor` is set, then `terms` and `addOns` only when `release.showPricingTerms` is true, then the CTA. On mobile the table becomes three stacked tier cards. |
| 7 | What you get | `whatYouGet` | Four 4:3 thumbnails with lightbox. Render only when `release.showWhatYouGet` is true. |
| 8 | About | `about` | Photo left, heading and three paragraphs right; stacked on mobile. Photo path may 404 in v0 — render a neutral placeholder block at the same aspect, not a broken image. |
| 9 | Proof | `proof` | Testimonial cards and a before → after strip. Render only when `release.showProof` is true. |
| 10 | FAQ | `faq` | Accordion. Render items where `show` is true. |
| 11 | Diagnostic | `diagnostic` | See below. |
| — | Footer | `footer`, `site` | Wordmark, `footer.line`, LinkedIn and email links (omit a link whose value is null), `privacyNote`. |

## The diagnostic (v0: one form, no scoring)

- All ten questions on one screen; on mobile it may split into two steps after Q5. Radio groups for `kind: "single"`, two numeric inputs for `kind: "twoNumbers"`, a textarea for `kind: "freeText"`. Then the three contact fields and the submit button. Show `stageNote` above the questions.
- Field names are the long-run contract for the v1 scoring function — use `q1`…`q10` for questions (radio value = option `id`), `q5_contactsTotal` and `q5_contactsEmailable` for the two numbers, and `name`, `company`, `email` for contact.
- Submit via Netlify Forms with the form name `diagnostic.netlifyFormName`. Netlify's build bot can't see forms rendered by React, so use the documented Next.js pattern: a static HTML file in `public/` (e.g. `__forms.html`) containing the same form with every field name and the `netlify` attribute, and submit from the React component with a `fetch` POST of `application/x-www-form-urlencoded` data that includes `form-name`. Verify the current Netlify docs for this pattern before implementing.
- Netlify form notifications go to Sophie's email (configured in Netlify, not in code). Nothing is emailed to the founder automatically in v0.
- On success, replace the form with the thank-you state: `thankYou.heading`, `thankYou.body`, and a booking button using `site.bookingLabel` linking to `site.bookingUrl`. If `bookingUrl` is null, render the heading and body only.
- On failure, keep the form and show a plain inline message that the send didn't work and to email Sophie directly (use `site.email` if set).
- The stepper variant (`release.diagnostic === "stepper"`, one question per step, progress, back button, client-side scoring from `diagnostic.scoring`) is v1. Leave a clear seam for it — the form component takes the questions array and a mode prop — but don't build the scoring now.

## Design constraints for v0

The design direction proper arrives in v1. v0 is deliberately plain and should read as confident, not unfinished.

- One typeface family for everything, loaded through `next/font` with a real fallback stack. Headings and body differ by size and weight only.
- Black text on a white background. One accent colour, used for the two kinds of CTA button and links, nowhere else.
- Max line length around 70 characters for body text. Generous vertical space between sections; sections are separated by space, not rules or background bands.
- Phases are a real sequence, so numbering them (1, 2, 3) is correct. Nothing else gets numbers, eyebrows, all-caps labels, badges or icons.
- No cards with drop shadows; where a boundary is needed (two-ways-in, tiers on mobile) use a single hairline border.
- No motion on load or scroll. The only transitions are the ones that answer a click: accordion open, checklist count change, form → thank-you.
- Visible keyboard focus on every interactive element. Semantic `<section>` with headings, labelled form controls, `prefers-reduced-motion` respected.
- Mobile first. Check the page at 360px, 768px and 1280px.

## Analytics

Implement `track(eventName: string)` in one file. In development it logs to the console; in production it calls `window.plausible` if present and otherwise does nothing. Wire the two v0 events from `analytics.v0`: `diagnostic_submit` on successful form submission and `booking_click` on the thank-you booking button. No analytics script is added in v0.

## Meta

`<title>` and description from `site`. A minimal Open Graph title/description (no image). A plain favicon — the wordmark's initial letter is fine. `robots` allow.

## Acceptance checklist

- [ ] Every string on the page traces to `content.ts`; grep the components for hard-coded copy and find none.
- [ ] Hidden sections (7, 9, exclusions FAQ, pricing terms) exist in code and don't render.
- [ ] Checklist counter changes the CTA line at three checks and back below three.
- [ ] Phase card click opens the matching panel.
- [ ] Pricing renders `$—` for every null price and stacks to cards on mobile.
- [ ] Diagnostic form submits to Netlify Forms on a deploy preview and the submission appears in the Netlify Forms UI with all thirteen field values.
- [ ] Thank-you state replaces the form; booking button present only when `bookingUrl` is set.
- [ ] Placeholder and bracketed text is visible and muted, not hidden.
- [ ] Lighthouse on the deploy preview: performance and accessibility both 95+.
- [ ] Works at 360px with no horizontal scroll.

## Don't

- Don't add sections, copy, images, icons, illustrations or a blog.
- Don't add animation, a UI library, Tailwind (unless it's already the convention in the account's other sites), analytics scripts, cookie banners or localStorage.
- Don't implement the diagnostic scoring, results email or `/diagnostic` route.
- Don't edit `content.ts`.

## Report back with

1. The deploy preview URL.
2. A screenshot at 360px and 1280px.
3. Confirmation that a test submission reached Netlify Forms, with the field names as received.
4. Every `TODO(sophie)`, `status: "draft"`, `status: "placeholder"` and `null` you found in `content.ts`, as a single checklist — that's Sophie's list for the week before launch.
5. Anything in `content.ts` that read wrong or contradicted this brief. Listed, not fixed.
