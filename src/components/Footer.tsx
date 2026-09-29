import { footer, nav, site } from "@/content";
import { Logo } from "@/components/Logo";
import { LinkedInIcon, MailIcon } from "@/components/Icons";

/**
 * Footer: a 2px ink rule along the top, then the logo, the email and
 * LinkedIn (each when set; LinkedIn opens in a new tab) and the tagline,
 * the nav list, and the CTA.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer__brand">
          <Logo variant="footer" />
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
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      <div className="footer__cta-col">
        <a href={footer.cta.href} className="button button--primary footer__cta">
          {footer.cta.label}
        </a>
      </div>
    </footer>
  );
}
