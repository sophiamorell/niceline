import { anchors, hero } from "@/content";
import { DiagnosticCard } from "@/components/DiagnosticCard";
import { HeckYes } from "@/components/HeckYes";

/**
 * 1 · Hero (#top): two columns. Left, the kicker, the opener line with its tooltip, the
 * highlighted headline, subhead, three coral-dot bullets and two buttons.
 * Right, the stacked question card that opens the diagnostic popup.
 */
export function Hero() {
  return (
    <section id={anchors.top} className="section hero" aria-labelledby="hero-heading">
      <div>
        <p className="kicker hero__kicker">{hero.kicker}</p>
        <h1 id="hero-heading" className="hero__headline">
          <HeckYes text={hero.opener} tooltip={hero.tooltip} />
          <br />
          <span className="hero__line">{hero.headline}</span>
          <span className="hl">{hero.headlineHighlight}</span>
        </h1>
        <p className="hero__subhead">{hero.subhead}</p>
        <ul className="dots hero__bullets">
          {hero.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <div className="actions">
          <a href={hero.primaryCta.href} className="button button--primary">
            {hero.primaryCta.label}
          </a>
          <a href={hero.secondaryCta.href} className="button button--outline">
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      <DiagnosticCard />
    </section>
  );
}
