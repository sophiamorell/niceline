/**
 * Every word on /durango/will-they-find-you, the landing page for the Durango
 * small-business packages. It mirrors the printed "Will they find you?"
 * packet: change a price, a date or a line here and in the packet together.
 *
 * Components carry no copy of their own (same rule as content.ts).
 */

const phone = { display: "(404) 861-9411", tel: "+14048619411" };

export type DurangoPackage = {
  id: string; // the section anchor
  name: string;
  price: string;
  payLine: string; // under the price in the summary strip
  summary: string; // one sentence in the summary strip
  promise: string; // under the name in the detail block
  ifs: string[]; // "Sounds like you if..."
  gets: { lead: string; rest: string }[]; // "What you get.": bold lead, then the rest
  steps: { when: string; what: string }[]; // "How it goes"
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
    primary: { label: "See the packages", href: "#packages" },
    secondary: { label: `Text or call ${phone.display}`, href: `tel:${phone.tel}` },
  },

  // The browser picture: one search, today on the left and by spring on the right
  visual: {
    label: "A search results page: today your business is on page 2; by spring it is the first result, with a Book online button.",
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

  packagesIntro: {
    heading: "We'll get you found and booked.",
    body: "Pick a package.",
    detailLink: "See what's included",
  },

  packageLabels: {
    kicker: "Package {n} of 3",
    ifs: "Sounds like you if...",
    gets: "What you get.",
    price: "Price",
    priceNote: "through December 31",
    steps: "How it goes",
    pays: "Ways to pay",
    deposit: "{deposit} holds your spot. Then pick one:",
  },

  packages: [
    {
      id: "get-found",
      name: "Get Found",
      price: "$1,250",
      payLine: "or $350 down, then $300/mo",
      summary: "One-page site and Google listing, live in 2 weeks.",
      promise: "You show up when people search, with a real one-page website on your own domain.",
      ifs: [
        "Customers mainly find you by word of mouth or referral.",
        "When people search your name, they land on a directory or another site you don't control.",
        "You may have a Facebook page or Instagram account, but no website where people can learn more, buy or book.",
      ],
      gets: [
        { lead: "A one-page website", rest: "on your own domain, with your hours, map, services and contact info." },
        { lead: "Google Business Profile", rest: "set up, verified and filled out." },
        { lead: "Listings cleaned up", rest: "on Apple Maps, Bing, Yelp and Facebook." },
        { lead: "A review kit:", rest: "counter card with QR code, plus text and email templates." },
        { lead: "Words written for you.", rest: "Send a few photos and we'll do the rest." },
        { lead: "Hosting and care", rest: "for the first month, then $49 a month." },
      ],
      steps: [
        { when: "Day 1", what: "A virtual or in-person meeting. You send photos and your hours." },
        { when: "Week 1", what: "Google profile claimed and filled out. Listings fixed." },
        { when: "Week 2", what: "Your site is written, built and checked on your phone." },
        { when: "Launch", what: "Live on your domain, plus a 15-minute handoff." },
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
      payLine: "or $1,000 down, then $484/mo",
      summary: "Up to 6 pages with booking or a quote form, in 4 weeks.",
      promise: "A full website where people can book, schedule or ask for a quote, and you can update it yourself.",
      ifs: [
        "Your reviews are great, but other businesses show up in search before you.",
        "New customers have to call to schedule or ask what you offer.",
        "You quote and book by phone and email, and your site (if you have one) is dated.",
      ],
      gets: [
        { lead: "Up to 6 pages,", rest: "built mobile-first." },
        { lead: "Words written for you", rest: "from a one-hour interview." },
        { lead: "A photo shoot", rest: "at your shop or office, about an hour." },
        { lead: "One add-on included:", rest: "online booking, a quote form or shop buttons." },
        { lead: "Edit it yourself", rest: "from a simple form, or text us the change." },
        { lead: "Everything in Get Found:", rest: "Google profile, listings and the review kit." },
      ],
      steps: [
        { when: "Week 1", what: "Interview and photos. Google profile goes live." },
        { when: "Week 2", what: "You review the words and a first look at the design." },
        { when: "Week 3", what: "Full site and your add-on, ready to try on your phone." },
        { when: "Week 4", what: "Launch, a 30-minute handoff and your review kit." },
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
      payLine: "or $1,750 down, then $859/mo",
      summary: "Up to 10 pages, online booking and 3 months of marketing.",
      promise: "A full website with online reservations before the rush, then 3 months of marketing done for you.",
      ifs: [
        "Guests can only reserve by phone or through an online form.",
        "Booking sites send you guests, then keep a cut of every stay.",
        "Your busy season starts in spring, and the website has to be ready first.",
      ],
      gets: [
        { lead: "Up to 10 pages plus a blog,", rest: "built mobile-first." },
        { lead: "Online booking or reservations,", rest: "connected to your system or one we set up." },
        { lead: "A second add-on:", rest: "gift cards, a shop, a quote form or an email list." },
        { lead: "Words and photos", rest: "from an interview and an on-site shoot." },
        { lead: "Everything in Get Found:", rest: "Google profile, listings and the review kit." },
        { lead: "3 months of marketing:", rest: "weekly Google posts, 2 blog posts a month, a newsletter and review follow-up." },
      ],
      steps: [
        { when: "Weeks 1-2", what: "Interview, photos and your booking system set up." },
        { when: "Weeks 3-5", what: "Site built. You review it and test a booking." },
        { when: "Week 6", what: "Launch, a 30-minute handoff and your review kit." },
        { when: "Months 1-3", what: "Posts, blog, newsletter and reviews, done for you." },
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
    kicker: "After launch",
    headingBefore: "We keep it ",
    headingHighlight: "fresh.",
    body: "Every site comes with hosting and a care plan, so it never goes stale or expires. Your first month is included.",
    plansHeading: "Care plans.",
    perMonth: "/mo",
    plans: [
      { name: "Starter", price: "$49", detail: "Hosting and SSL certificate." },
      { name: "Essentials", price: "$149", detail: "Starter, plus 30 minutes of edits a month." },
      { name: "Plus", price: "$299", detail: "Up to 2 hours of consulting or web edits, 2 posts a month and analytics." },
      { name: "Growth", price: "$599", detail: "Up to 2 hours of consulting or web edits, 4 posts a month and analytics." },
    ],
    addOnsHeading: "Add-ons, any package.",
    addOns: [
      { name: "Online booking or reservations", price: "$800" },
      { name: "Online ordering", price: "$800" },
      { name: "3 posts per month", price: "$900" },
      { name: "Email list", price: "$900" },
      { name: "Social media setup and campaign", price: "$650/platform" },
      { name: "Custom work", price: "Quoted" },
    ],
    notes: [
      {
        heading: "Posts that bring in business.",
        body: "Each post is written to show up on Google and in AI answers like ChatGPT (SEO and AEO), so more searches end at your site. You can update your own site any time.",
      },
      {
        heading: "The fine print.",
        body: "Deposit due by December 31, refundable until we start. Monthly payments begin the month your project starts. Leave any time after 12 months with a full copy of your site. Your domain always stays in your name.",
      },
    ],
  },

  spot: {
    heading: "12 spots at these prices.",
    body: "First come, first served. Sign by December 31.",
    primary: { label: `Text or call ${phone.display}`, href: `tel:${phone.tel}` },
    // The email button: site.email with this subject line
    email: { label: "Email Sophie", subject: "Will they find you?" },
    signOff: "Sophie Williams · Nice Line Marketing · Durango, Colorado",
  },
};
