import type { Metadata } from "next";
import { willTheyFindYou } from "@/content-durango";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WillTheyFindYou } from "@/components/durango/WillTheyFindYou";
import { ContactModal } from "@/components/ContactModal";
import "../durango.css";

/**
 * /durango/will-they-find-you: the landing page for the Durango small-business
 * packages, the web version of the printed packet. It sits under "Durango" in
 * the header and footer; there is no /durango page of its own yet.
 *
 * Shares the site header and footer. Here their links point back to the home
 * page's sections, and the button holds a spot instead of opening the B2B
 * diagnostic. The contact popup is the home page's, with this page's wording;
 * it posts to the same Netlify form.
 */
export const metadata: Metadata = {
  title: willTheyFindYou.meta.title,
  description: willTheyFindYou.meta.description,
  alternates: { canonical: willTheyFindYou.path },
  openGraph: { title: willTheyFindYou.meta.title, description: willTheyFindYou.meta.description },
};

export default function WillTheyFindYouPage() {
  return (
    <div className="page">
      <Nav home={false} cta={willTheyFindYou.navCta} />
      <main id="main">
        <WillTheyFindYou />
      </main>
      <Footer home={false} cta={willTheyFindYou.navCta} />
      <ContactModal copy={willTheyFindYou.contact} source={willTheyFindYou.contact.source} />
    </div>
  );
}
