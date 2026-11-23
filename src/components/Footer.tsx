import { footer, nav, release, site } from "@/content";
import { BookingLink } from "@/components/BookingLink";
import { Logo } from "@/components/Logo";
import { LinkedInIcon, MailIcon, PinIcon } from "@/components/Icons";

/**
 * Footer: a 2px ink rule along the top, then the logo, the email and
 * LinkedIn (each when set; LinkedIn opens in a new tab) and the tagline,
 * the nav list (with the Durango pages under their label while
 * release.showDurangoNav is true), and the CTA with the booking link under it.
 *
 * On any page but the home page (home false) the nav links point back to the
 * home page's sections, and the page can pass its own CTA.
 */
export function Footer({ home = true, cta = footer.cta }: { home?: boolean; cta?: { label: string; href: string } }) {
  const base = home ? "" : "/";
  return (
    <footer className="footer">
      <div>
        <div className="footer__brand">
          <Logo variant="footer" home={home} />
        </div>
        {site.email !== null && (
          <a href={`mailto:${site.email}`} className="footer__email">
            <MailIcon />
            {site.email}
          </a>
        )}
        {site.linkedin !== null && (
          <a href={site.linkedin} className="footer__email" target="_blank" rel="me noopener noreferrer">
            <LinkedInIcon />
            {footer.linkedinLabel}
          </a>
        )}
        <p className="footer__tagline">
          {footer.taglineLines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>
      <ul className="footer__links">
        {nav.links.map((link) => (
          <li key={link.href}>
            <a href={`${base}${link.href}`}>{link.label}</a>
          </li>
        ))}
        {release.showDurangoNav && (
          <li className="footer__group">
            <span className="footer__group-label">
              <PinIcon />
              {nav.durango.label}
            </span>
            <ul>
              {nav.durango.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
      <div className="footer__cta-col">
        <a href={cta.href} className="button button--primary footer__cta">
          {cta.label}
        </a>
        <BookingLink place="footer" className="button button--outline footer__cta" />
      </div>
    </footer>
  );
}
