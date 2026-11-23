import { willTheyFindYou as page } from "@/content-durango";
import { SearchPicture } from "@/components/durango/SearchPicture";
import { PackagePicker } from "@/components/durango/PackagePicker";
import { MessageButton } from "@/components/durango/MessageButton";

/**
 * /durango/will-they-find-you: the Durango packages on one short page.
 *
 * A hero on a mist band with the search picture (its dividing line drags),
 * the three packages as tabs on a teal band, the care plans and add-ons,
 * and the closing "hold your spot" card, whose second button opens the
 * contact popup. Every word comes from src/content-durango.ts.
 */
export function WillTheyFindYou() {
  const { hero, picker, care, spot } = page;
  return (
    <>
      <section id="top" className="section dgo-band dgo-band--mist dgo-hero" aria-labelledby="dgo-heading">
        <div className="dgo-hero__words">
          <p className="kicker">{hero.kicker}</p>
          <h1 id="dgo-heading" className="dgo-hero__headline">
            {hero.headlineLines[0]}
            <br />
            {hero.headlineLines[1]}
            <span className="highlight">{hero.headlineHighlight}</span>
          </h1>
          <p className="dgo-hero__body">{hero.body}</p>
          <p className="dgo-hero__price">{hero.priceLine}</p>
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

      <section id="packages" className="section dgo-band dgo-band--teal" aria-labelledby="dgo-packages-heading">
        <h2 id="dgo-packages-heading" className="h2 dgo-band__heading">
          {picker.heading}
        </h2>
        <PackagePicker />
      </section>

      <section id="care" className="section" aria-labelledby="dgo-care-heading">
        <h2 id="dgo-care-heading" className="h2">
          {care.headingBefore}
          <span className="highlight">{care.headingHighlight}</span>
        </h2>
        <p className="intro dgo-intro">{care.body}</p>
        <div className="dgo-plans">
          {care.plans.map((plan) => (
            <div key={plan.name} className="dgo-plans__col">
              <h3 className="dgo-plans__name">{plan.name}</h3>
              <p className="dgo-plans__price">
                {plan.price}
                <span>{care.perMonth}</span>
              </p>
              <p className="dgo-plans__detail">{plan.detail}</p>
            </div>
          ))}
        </div>
        <p className="dgo-addons">
          <strong>{care.addOnsLabel}</strong> {care.addOns}
        </p>
        <p className="fineprint dgo-fineprint">{care.finePrint}</p>
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
            <MessageButton className="button button--outline">{spot.message}</MessageButton>
          </div>
        </div>
      </section>
    </>
  );
}
