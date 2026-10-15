import { heroBar, site } from "@/content";
import { BookingLink } from "@/components/BookingLink";

/**
 * The teal bar under the hero: the category line (the old hero kicker), one
 * sentence with a link to the steps, and the booking link as the page's one
 * above-the-fold CTA. Stacks on phones, where it is also the first CTA after
 * the nav because the question card is hidden there.
 */
export function HeroBar() {
  return (
    <div className="hero-bar" aria-label={heroBar.heading}>
      <div className="hero-bar__text">
        <p className="hero-bar__heading">{heroBar.heading}</p>
        <p className="hero-bar__body">
          {heroBar.body}
          <a href={heroBar.link.href} className="hero-bar__link">
            {heroBar.link.label}
          </a>
        </p>
      </div>
      {site.bookingUrl !== null && <BookingLink place="hero" className="hero-bar__cta" label={heroBar.cta} />}
    </div>
  );
}
