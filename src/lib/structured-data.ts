import { about, faq, howItWorks, phases, site } from "@/content";

/**
 * JSON-LD for the home page, built from content.ts so it never drifts from
 * the copy on the page: the business (ProfessionalService), Sophie (Person)
 * and the visible FAQ (FAQPage). Rendered once by <StructuredData /> as a
 * single @graph.
 */

const origin = `https://${site.domain}`;
const businessId = `${origin}/#business`;
const personId = `${origin}/#sophie`;

function sameAs(): string[] {
  return site.linkedin === null ? [] : [site.linkedin];
}

export function structuredData(): Record<string, unknown> {
  const business: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": businessId,
    name: site.name,
    url: `${origin}/`,
    description: site.description,
    slogan: site.tagline,
    image: `${origin}/icon-512.png`,
    logo: `${origin}/icon-512.png`,
    founder: { "@id": personId },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Durango",
      addressRegion: "CO",
      addressCountry: "US",
    },
    areaServed: { "@type": "Country", name: "United States" },
    serviceType: "Fractional marketing leadership for B2B companies",
    knowsAbout: [
      "Product marketing",
      "B2B marketing strategy",
      "Ideal customer profile",
      "CRM and pipeline management",
      "First marketing hire",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: howItWorks.heading,
      itemListElement: phases.map((phase) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `${phase.tag}: ${phase.outcome}`,
          description: phase.question,
        },
      })),
    },
    sameAs: sameAs(),
  };
  if (site.email !== null) business.email = site.email;

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: site.owner.name,
    jobTitle: site.owner.jobTitle,
    description: about.paragraphs.map((p) => p.text).join(" "),
    image: `${origin}${about.photo}`,
    worksFor: { "@id": businessId },
    homeLocation: { "@type": "Place", name: site.location },
    url: `${origin}/#about`,
    sameAs: sameAs(),
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${origin}/#faq`,
    mainEntity: faq.items
      .filter((item) => item.show && item.status !== "placeholder")
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
  };

  const webSite = {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: site.name,
    publisher: { "@id": businessId },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [business, person, faqPage, webSite],
  };
}

/** Serialized for a <script type="application/ld+json">; `<` is escaped so the JSON can't close the tag. */
export function structuredDataJson(): string {
  return JSON.stringify(structuredData()).replace(/</g, "\\u003c");
}
