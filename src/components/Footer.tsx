import { footer, nav, site } from "@/content";
import { Logo } from "@/components/Logo";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/**
 * Footer: the logo, the email (when set) and the tagline,
 * the nav list (plus LinkedIn when set), and the CTA.
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
        {site.linkedin !== null && (
          <li>
            <a href={site.linkedin} rel="me">
              {/* content.ts has no label for this link; the network's name is used. */}
              LinkedIn
            </a>
          </li>
        )}
      </ul>
      <div>
        <a href={footer.cta.href} className="button button--primary footer__cta">
          {footer.cta.label}
        </a>
      </div>
    </footer>
  );
}
