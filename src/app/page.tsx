import type { Metadata } from "next";
import { release } from "@/content";
import { Nav } from "@/components/Nav";
import { StructuredData } from "@/components/StructuredData";
import { Hero } from "@/components/Hero";
import { WhyNow } from "@/components/WhyNow";
import { Checklist } from "@/components/Checklist";
import { HowItWorks } from "@/components/HowItWorks";
import { Deliverables } from "@/components/Deliverables";
import { About } from "@/components/About";
import { Faq } from "@/components/Faq";
import { Testimonials } from "@/components/Testimonials";
import { Diagnostic } from "@/components/Diagnostic";
import { Footer } from "@/components/Footer";
import { DiagnosticModal } from "@/components/DiagnosticModal";
import { ContactModal } from "@/components/ContactModal";

/**
 * The one route: header, hero, why now, the checklist, how it works (with
 * pricing), what you get, about, FAQ, testimonials, the diagnostic, footer,
 * and the diagnostic and contact popups. Sections behind a release flag exist in code and
 * render only when the flag is true.
 */

/* The canonical URL, resolved against metadataBase in the layout: one
   preferred address for the page whether it's reached with or without a
   trailing slash, a hash, or a tracking parameter. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="page">
      <StructuredData />
      <Nav />
      <main id="main">
        <Hero />
        <WhyNow />
        <Checklist />
        <HowItWorks />
        {release.showWhatYouGet && <Deliverables />}
        <About />
        <Faq />
        {release.showProof && <Testimonials />}
        <Diagnostic />
      </main>
      <Footer />
      <DiagnosticModal />
      <ContactModal />
    </div>
  );
}
