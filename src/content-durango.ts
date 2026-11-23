/**
 * Every word on /durango/will-they-find-you, the landing page for the Durango
 * small-business packages. Prices, dates and lines match the printed "Will
 * they find you?" packet: change them here and in the packet together.
 *
 * Components carry no copy of their own (same rule as content.ts).
 */

const phone = { display: "(404) 861-9411", tel: "+14048619411" };

export type DurangoPackage = {
  id: string; // the tab and panel ids
  name: string;
  price: string;
  tabLine: string; // under the price on the tab
  promise: string; // under the name in the panel
  gets: { lead: string; rest: string }[]; // "What you get.": bold lead, then the rest
  deposit: string; // "{deposit} holds your spot. Then pick one:"
  pays: { amount: string; note: string }[];
};

export const willTheyFindYou = {
  path: "/durango/will-they-find-you",
  meta: {
    title: "Will they find you? Websites and local marketing for Durango businesses | Nice Line Marketing",
    description:
      "Three fixed-price packages for Durango small businesses: a website customers can book from, a cleaned-up Google listing, and local marketing that keeps both fresh. From $1,250.",
  },

  // The header and footer button on this page
  navCta: { label: "Hold your spot", href: "#spot" },

  hero: {
    kicker: "Local marketing, done for you · Durango, CO",
    headlineLines: ["Your customers are searching.", "Will they "],
    headlineHighlight: "find you?", // on the highlighter band, ends the second line
    body: "We build your website, fix your Google listing and keep both fresh.",
    priceLine: "Three fixed prices, from $1,250.",
    primary: { label: "Pick a package", href: "#packages" },
    secondary: { label: `Text or call ${phone.display}`, href: `tel:${phone.tel}` },
  },

  // The browser picture: one search, today on the left and by spring on the right.
  // The line between them drags.
  visual: {
    label: "A search results page. Today your business is on page 2. By spring it is the first result, with a Book online button.",
    sliderLabel: "Drag to compare today with by spring",
    wordmark: "Search",
    query: "what you do, near me",
    today: {
      chip: "Today",
      results: [
        { title: "A national chain", detail: "Sponsored · 4.8 ★ (772) · Book online" },
        { title: "A bigger competitor", detail: "4.4 ★ (203) · Website · Call" },
        { title: "A directory you've never heard of", detail: "Top 10 lists · Ads" },
      ],
      you: { title: "Your business", detail: "4.8 ★ (115) · No website", tag: "Page 2" },
    },
    spring: {
      chip: "By spring",
      you: { title: "Your business", detail: "4.8 ★ (115) · Open now · Durango", actions: ["Book online", "Website", "Call"] },
      site: { url: "yourbusiness.com", title: "Your own website", detail: "Services, hours and prices, in your words." },
    },
  },

  picker: {
    heading: "Pick a package.",
    tabsLabel: "Packages", // the tab list's accessible name
    gets: "What you get.",
    priceNote: "through December 31",
    pays: "Ways to pay",
    deposit: "{deposit} holds your spot. Then pick one:",
    cta: "Hold a spot for {deposit}",
    // What the button puts in the contact popup's message box
    ctaMessage: "I'd like to hold a spot for {name}.",
  },

  packages: [
    {
      id: "get-found",
      name: "Get Found",
      price: "$1,250",
      tabLine: "One-page site and Google listing, live in 2 weeks.",
      promise: "You show up when people search, with a real one-page website on your own domain.",
      gets: [
        { lead: "A one-page website", rest: "on your own domain, with your hours, map, services and contact info." },
        { lead: "Google Business Profile", rest: "set up, verified and filled out." },
        { lead: "Listings cleaned up", rest: "on Apple Maps, Bing, Yelp and Facebook." },
        { lead: "A review kit:", rest: "counter card with QR code, plus text and email templates." },
        { lead: "Words written for you.", rest: "Send a few photos and we'll do the rest." },
        { lead: "Hosting and care", rest: "for the first month, then $49 a month." },
      ],
      deposit: "$350",
      pays: [
        { amount: "$900", note: "at launch, in one payment" },
        { amount: "3 × $300", note: "monthly, no fee, starting the month we begin" },
      ],
    },
    {
      id: "front-door",
      name: "Front Door",
      price: "$3,900",
      tabLine: "Up to 6 pages with booking or a quote form, in 4 weeks.",
      promise: "A full website where people can book, schedule or ask for a quote, and you can update it yourself.",
      gets: [
        { lead: "Up to 6 pages,", rest: "built mobile-first." },
        { lead: "Words written for you", rest: "from a one-hour interview." },
        { lead: "A photo shoot", rest: "at your shop or office, about an hour." },
        { lead: "One add-on included:", rest: "online booking, a quote form or shop buttons." },
        { lead: "Edit it yourself", rest: "from a simple form, or text us the change." },
        { lead: "Everything in Get Found:", rest: "Google profile, listings and the review kit." },
      ],
      deposit: "$1,000",
      pays: [
        { amount: "2 × $1,450", note: "at kickoff and at launch" },
        { amount: "$484/mo", note: "for 6 months, no fee" },
        { amount: "$260/mo", note: "for 12 months, adds 7.5% to the balance" },
      ],
    },
    {
      id: "full-season",
      name: "Full Season",
      price: "$6,900",
      tabLine: "Up to 10 pages, online booking and 3 months of marketing.",
      promise: "A full website with online reservations before the rush, then 3 months of marketing done for you.",
      gets: [
        { lead: "Up to 10 pages plus a blog,", rest: "built mobile-first." },
        { lead: "Online booking or reservations,", rest: "connected to your system or one we set up." },
        { lead: "A second add-on:", rest: "gift cards, a shop, a quote form or an email list." },
        { lead: "Words and photos", rest: "from an interview and an on-site shoot." },
        { lead: "Everything in Get Found:", rest: "Google profile, listings and the review kit." },
        { lead: "3 months of marketing:", rest: "weekly Google posts, 2 blog posts a month, a newsletter and review follow-up." },
      ],
      deposit: "$1,750",
      pays: [
        { amount: "2 × $2,575", note: "at kickoff and at launch" },
        { amount: "$859/mo", note: "for 6 months, no fee" },
        { amount: "$462/mo", note: "for 12 months, adds 7.5% to the balance" },
      ],
    },
  ] as DurangoPackage[],

  care: {
    headingBefore: "After launch, we keep it ",
    headingHighlight: "fresh.",
    body: "Every site comes with hosting and a care plan, so it never goes stale or expires. Your first month is included.",
    perMonth: "/mo",
    plans: [
      { name: "Starter", price: "$49", detail: "Hosting and SSL certificate." },
      { name: "Essentials", price: "$149", detail: "Starter, plus 30 minutes of edits a month." },
      { name: "Plus", price: "$299", detail: "Up to 2 hours of consulting or web edits, 2 posts a month and analytics." },
      { name: "Growth", price: "$599", detail: "Up to 2 hours of consulting or web edits, 4 posts a month and analytics." },
    ],
    addOnsLabel: "Add-ons:",
    addOns:
      "online booking or reservations $800 · online ordering $800 · 3 posts per month $900 · email list $900 · social media setup and campaign $650/platform · custom work, quoted.",
    finePrint:
      "Deposit due by December 31, refundable until we start. Monthly payments begin the month your project starts. Leave any time after 12 months with a full copy of your site. Your domain always stays in your name.",
  },

  spot: {
    heading: "12 spots at these prices.",
    body: "First come, first served. Sign by December 31.",
    primary: { label: `Text or call ${phone.display}`, href: `tel:${phone.tel}` },
    message: "Send Sophie a message", // opens the contact popup
  },

  // The contact popup on this page. It posts to the same Netlify form as the home
  // page's popup ("contact"), so its notifications go to the same place; the
  // field ids must stay within that form's fields in public/__forms.html.
  contact: {
    netlifyFormName: "contact",
    source: "Durango: Will they find you?", // sent with the message, so the notification says where it came from
    closeLabel: "Close",
    kicker: "Hold your spot",
    heading: "Tell me about your business.",
    fields: [
      { id: "name", label: "Name", type: "text", required: true },
      { id: "company", label: "Business", type: "text", required: false },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone (optional)", type: "tel", required: false },
      { id: "message", label: "What do you need?", type: "textarea", required: false },
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
      signOff: "Talk soon, Sophie",
      closeLabel: "Close",
    },
  },
};
