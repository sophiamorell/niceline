import { anchors, hero } from "@/content";
import { DiagnosticCard } from "@/components/DiagnosticCard";
import { HeckYes } from "@/components/HeckYes";

/**
 * 1 · Hero (#top): two columns. Left, the opener line with its tooltip, the
 * headline with "sell more" on the highlighter, subhead and three sea-glass-dot
 * bullets. Right, the stacked question card that opens the diagnostic popup.
 * No kicker and no buttons: the category line and the one CTA are in the
 * HeroBar directly under this.
 */
export function Hero() {
  return (
    <section id={anchors.top} className="section hero" aria-labelledby="hero-heading">
      <div>
        <h1 id="hero-heading" className="hero__headline">
          <HeckYes text={hero.opener} tooltip={hero.tooltip} />
          <br />
          <span className="hero__line">{hero.headline}</span>
          <span>
            <span className="highlight">{hero.headlineHighlight}</span>
            {hero.headlineAfter}
          </span>
        </h1>
        <p className="hero__subhead">{hero.subhead}</p>
        <ul className="dots hero__bullets">
          {hero.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <DiagnosticCard />
    </section>
  );
}
