# Nice Line Marketing — website

One-page marketing site for the practice. Next.js (App Router), TypeScript,
deployed on Netlify. Built to `BUILD.md`; every word on the page comes from
`src/content.ts`.

## Change the words

Edit `src/content.ts`. Components never carry copy of their own, so that file
is the only place text, prices, lists and the diagnostic questions live.

- Each step has one price in `pricing.steps`, shown on its card in How it
  works. A `null` price renders as `pricing.emptyPrice`, and the "All three
  steps" total only appears when every step has a price.
- The diagnostic runs in a popup (`diagnostic.modal`): the questions one at a
  time, then the verdict and the three gaps on screen (scored in the browser
  from `diagnostic.scoring`, see `src/lib/diagnostic-score.ts`), then the
  email ask for the fixes. Any link to `#diagnostic` opens it.
- Text in `[square brackets]` or marked `status: "placeholder"` renders muted so
  it's obvious on the preview what still needs writing.
- `release.*` flags turn v1 sections on. The components already exist.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build, also what Netlify runs
npm run lint
```

## Netlify

`netlify.toml` carries the build settings and the Next.js runtime plugin.
One-time setup in the Netlify dashboard:

1. **Forms → Enable form detection**, then trigger a deploy. The forms are
   defined in `public/__forms.html`: `diagnostic` holds the full answers plus
   the computed `score`, `verdict` and `gaps`, so the results email can be
   written straight from the notification. `contact` holds the "Let's talk"
   messages from the pricing section. (An earlier `diagnostic-start` form,
   which saved the email before question 1, is gone: the email is now asked
   for after the verdict.)
2. Open that form → **Notifications** → email notification to Sophie's address.
3. **Domain management** → make `niceline.marketing` the primary domain.
   Keep `thefoundersmarketer.com` attached as a domain alias: `netlify.toml`
   redirects it (and `www.`) to `niceline.marketing` with a 301.

Submissions are also listed under Forms in Netlify. No environment variables
are needed.

## Analytics

Umami Cloud (free plan), cookieless. The script tag is in `src/app/layout.tsx`
with `data-domains="niceline.marketing"`, so deploy previews and local builds
send nothing. Pageviews are automatic. Custom events go through
`src/lib/track.ts` (`track(name, props)`): `diagnostic_start`,
`diagnostic_step` (with the step number), `diagnostic_submit` (with the
verdict and score), `booking_click` (with `place`: hero, steps, footer or
diagnostic), and Line Check's `icp_*` events. In development they log to the
console instead.

Google Analytics 4 runs alongside Umami through the Google tag
(`GTM-NL5KMNFG`), also in the `<head>` of `src/app/layout.tsx`. It is the
snippet exactly as Google Analytics supplied it, so it sets cookies and loads
on deploy previews too. Keep it to one Google tag per page. `track()` sends
the custom events above to GA4 as well, under the same names, with the props
as event parameters. To report on a parameter in GA4 (`place`, `step`,
`verdict`, `score`), register it there as a custom dimension or metric.

## Line Check (/line-check)

A free lead-magnet tool: a founder describes their best and worst customers
(talking or typing) and gets a draft ideal customer profile, then, after an
email gate, a scoring rubric with a live scorer. It's a prototype for testing
with a few founders, so it isn't linked from the nav and is set to noindex.

- Copy lives in `src/content-line-check.ts`. Set `bookingUrl` there to show
  the "Book a 30-minute walkthrough" button.
- AI calls go through `/api/line-check/extract` and `/api/line-check/synthesize`
  (Next.js route handlers, which Netlify runs as functions). In Netlify, set
  **`ANTHROPIC_API_KEY`** (scope: Functions). Optional: `ICP_MODEL` to change
  the model (default `claude-sonnet-5-5`).
- Gate submissions arrive as the `line-check` Netlify form. Add an email
  notification for it the same way as the diagnostic.
- Locally, the gate logs to the console instead of posting (Netlify Forms only
  exists on a deploy); the AI routes need `ANTHROPIC_API_KEY` in `.env.local`.

## Durango pages (/durango/...)

The Durango pages are live but unlisted for now: reachable by their address,
not linked from the header or footer, and not in the sitemap or `llms.txt`.

To list them, set `release.showDurangoNav` to `true` in `src/content.ts` (and
add the page to `public/llms.txt`). "Durango" then shows in the header after
About and in the footer, as a label with a location pin, not a page: hovering,
focusing or clicking it opens a short menu of the pages under it
(`nav.durango`). Below 900px the header hides it with the other links, so on
phones it's reached from the footer. The sitemap picks the page up from the
same flag.

- `/durango/will-they-find-you` is the landing page for the Durango
  small-business packages. Its copy lives in `src/content-durango.ts`; the
  prices, dates and lines match the printed packet, so change them in both.
  Styles are in `src/app/durango/durango.css`.
- The hero's browser picture has a dividing line that drags
  (`SearchPicture`), and the packages are tabs that take one tour when they
  scroll into view (`PackagePicker`). Both skip their motion under
  reduced-motion.
- "Hold a spot" and "Send Sophie a message" open the home page's contact
  popup with this page's wording (`willTheyFindYou.contact`). It posts to the
  same Netlify form, `contact`, with two extra fields: `phone` and `source`.
  Messages from this page arrive with `source` set, so they are told apart
  from the home page's in the same notification.
- To add a page: add its route under `src/app/durango/`, then an item to
  `nav.durango.items` and a sitemap entry.
- The page's own header and footer button ("Hold your spot") jumps to its
  closing card; the other header links go back to the home page's sections.
- There is no `/durango` page yet. When there is one, make the label a link.

## Layout

```
src/app/            layout (font, meta), page (section order), icon, robots
src/components/     one file per section; DiagnosticModal is the diagnostic
src/content.ts      all the words
src/lib/            copy helpers, track() analytics seam, public-file check
public/__forms.html Netlify Forms definition (field names must match the form)
```
