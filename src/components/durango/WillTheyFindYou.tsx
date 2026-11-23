import { site } from "@/content";
import { willTheyFindYou as page, type DurangoPackage } from "@/content-durango";
import { fill } from "@/lib/copy";
import { CheckIcon, SearchIcon } from "@/components/Icons";

/**
 * /durango/will-they-find-you: the Durango packages, in the order of the
 * printed packet. A hero with the search picture, the three packages side by
 * side, each package in full, the care plans and add-ons, and the closing
 * "hold your spot" card. Static: no state, no forms. Every word comes from
 * src/content-durango.ts.
 */

/** The browser picture: one search, split into today and by spring. */
function SearchPicture() {
  const { visual } = page;
  return (
    <div className="dgo-browser" role="img" aria-label={visual.label}>
      <div className="dgo-browser__bar" aria-hidden="true">
        <span className="dgo-browser__dot dgo-browser__dot--pink" />
        <span className="dgo-browser__dot dgo-browser__dot--sun" />
        <span className="dgo-browser__dot dgo-browser__dot--mist" />
        <span className="dgo-browser__address" />
      </div>
      <div className="dgo-browser__search" aria-hidden="true">
        <span className="dgo-browser__wordmark">{visual.wordmark}</span>
        <span className="dgo-browser__field">
          <SearchIcon />
          {visual.query}
        </span>
      </div>
      <div className="dgo-split" aria-hidden="true">
        <div className="dgo-split__half dgo-split__half--today">
          <span className="dgo-chip">{visual.today.chip}</span>
          {visual.today.results.map((result) => (
            <div key={result.title} className="dgo-result">
              <span className="dgo-result__title">{result.title}</span>
              <span className="dgo-result__detail">{result.detail}</span>
            </div>
          ))}
          <div className="dgo-result dgo-result--buried">
            <div>
              <span className="dgo-result__title">{visual.today.you.title}</span>
              <span className="dgo-result__detail">{visual.today.you.detail}</span>
            </div>
            <span className="dgo-result__tag">{visual.today.you.tag}</span>
          </div>
        </div>
        <div className="dgo-split__half dgo-split__half--spring">
          <span className="dgo-chip dgo-chip--sun">{visual.spring.chip}</span>
          <div className="dgo-listing">
            <span className="dgo-listing__title">{visual.spring.you.title}</span>
            <span className="dgo-listing__detail">{visual.spring.you.detail}</span>
            <span className="dgo-listing__actions">
              {visual.spring.you.actions.map((action, i) => (
                <span key={action} className={i === 0 ? "dgo-pill dgo-pill--sun" : "dgo-pill"}>
                  {action}
                </span>
              ))}
            </span>
          </div>
          <div className="dgo-result">
            <span className="dgo-result__detail">{visual.spring.site.url}</span>
            <span className="dgo-result__title">{visual.spring.site.title}</span>
            <span className="dgo-result__detail">{visual.spring.site.detail}</span>
          </div>
        </div>
        <span className="dgo-split__handle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6-5 6 5 6" />
            <path d="m15 6 5 6-5 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/** One package in full: the words on the left, the numbers in a panel on the right. */
function PackageDetail({ pkg, n }: { pkg: DurangoPackage; n: number }) {
  const labels = page.packageLabels;
  const headingId = `${pkg.id}-heading`;
  return (
    <section id={pkg.id} className="dgo-package" aria-labelledby={headingId}>
      <div className="dgo-package__words">
        <p className="kicker">{fill(labels.kicker, { n })}</p>
        <h2 id={headingId} className="dgo-package__name">
          {pkg.name}
        </h2>
        <p className="dgo-package__promise">{pkg.promise}</p>

        <h3 className="dgo-h3">{labels.ifs}</h3>
        <ul className="dgo-list dgo-list--dots">
          {pkg.ifs.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <h3 className="dgo-h3">{labels.gets}</h3>
        <ul className="dgo-list dgo-list--checks">
          {pkg.gets.map((item) => (
            <li key={item.lead}>
              <CheckIcon />
              <span>
                <strong>{item.lead}</strong> {item.rest}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="dgo-panel" aria-label={`${pkg.name}: ${labels.price}`}>
        <div>
          <p className="dgo-panel__label">{labels.price}</p>
          <p className="dgo-panel__price">{pkg.price}</p>
          <p className="dgo-panel__note">{labels.priceNote}</p>
        </div>
        <div>
          <p className="dgo-panel__label">{labels.steps}</p>
          <dl className="dgo-steps">
            {pkg.steps.map((step) => (
              <div key={step.when}>
                <dt>{step.when}</dt>
                <dd>{step.what}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="dgo-panel__label">{labels.pays}</p>
          <p className="dgo-panel__deposit">{fill(labels.deposit, { deposit: pkg.deposit })}</p>
          <ul className="dgo-pays">
            {pkg.pays.map((pay) => (
              <li key={pay.amount}>
                <strong>{pay.amount}</strong>
                <span>{pay.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  );
}

export function WillTheyFindYou() {
  const { hero, packagesIntro, packages, care, spot } = page;
  return (
    <>
      <section id="top" className="section dgo-hero" aria-labelledby="dgo-heading">
        <div className="dgo-hero__words">
          <p className="kicker">{hero.kicker}</p>
          <h1 id="dgo-heading" className="dgo-hero__headline">
            {hero.headlineLines[0]}
            <br />
            {hero.headlineLines[1]}
            <span className="highlight">{hero.headlineHighlight}</span>
          </h1>
          <p className="dgo-hero__body">{hero.body}</p>
          <div className="dgo-actions">
            <a href={hero.primary.href} className="button button--primary">
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className="button button--outline">
              {hero.secondary.label}
            </a>
          </div>
        </div>
        <SearchPicture />
      </section>

      <section id="packages" className="section" aria-labelledby="dgo-packages-heading">
        <h2 id="dgo-packages-heading" className="h2">
          {packagesIntro.heading}
        </h2>
        <p className="intro dgo-intro">{packagesIntro.body}</p>
        <div className="dgo-summary">
          {packages.map((pkg) => (
            <div key={pkg.id} className="dgo-summary__col">
              <h3 className="dgo-summary__name">{pkg.name}</h3>
              <p className="dgo-summary__price">{pkg.price}</p>
              <p className="dgo-summary__pay">{pkg.payLine}</p>
              <p className="dgo-summary__text">{pkg.summary}</p>
              <a href={`#${pkg.id}`} className="dgo-summary__link">
                {packagesIntro.detailLink}
                <span className="dgo-visually-hidden"> ({pkg.name})</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="section dgo-packages">
        {packages.map((pkg, i) => (
          <PackageDetail key={pkg.id} pkg={pkg} n={i + 1} />
        ))}
      </div>

      <section id="care" className="section" aria-labelledby="dgo-care-heading">
        <p className="kicker">{care.kicker}</p>
        <h2 id="dgo-care-heading" className="h2">
          {care.headingBefore}
          <span className="highlight">{care.headingHighlight}</span>
        </h2>
        <p className="intro dgo-intro">{care.body}</p>

        <div className="dgo-block">
          <h3 className="dgo-h3 dgo-h3--first">{care.plansHeading}</h3>
          <div className="dgo-plans">
            {care.plans.map((plan) => (
              <div key={plan.name} className="dgo-plans__col">
                <h4 className="dgo-plans__name">{plan.name}</h4>
                <p className="dgo-plans__price">
                  {plan.price}
                  <span>{care.perMonth}</span>
                </p>
                <p className="dgo-plans__detail">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dgo-block">
          <h3 className="dgo-h3 dgo-h3--first">{care.addOnsHeading}</h3>
          <ul className="dgo-addons">
            {care.addOns.map((addOn) => (
              <li key={addOn.name}>
                <span>{addOn.name}</span>
                <strong>{addOn.price}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="dgo-block dgo-notes">
          {care.notes.map((note) => (
            <div key={note.heading}>
              <h3 className="dgo-h3 dgo-h3--first">{note.heading}</h3>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="spot" className="section" aria-labelledby="dgo-spot-heading">
        <div className="dgo-spot">
          <h2 id="dgo-spot-heading" className="dgo-spot__heading">
            {spot.heading}
          </h2>
          <p className="dgo-spot__body">{spot.body}</p>
          <div className="dgo-actions">
            <a href={spot.primary.href} className="button button--primary">
              {spot.primary.label}
            </a>
            {site.email !== null && (
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(spot.email.subject)}`}
                className="button button--outline"
              >
                {spot.email.label}
              </a>
            )}
          </div>
          <p className="dgo-spot__signoff">{spot.signOff}</p>
        </div>
      </section>
    </>
  );
}
