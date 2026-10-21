import Image from "next/image";
import { anchors, proof } from "@/content";
import { mutedClass } from "@/lib/copy";

/**
 * 9 · Testimonials (#testimonials): three quote cards, each opening with a
 * pink quote mark, with the client's logo in an 84px circle beside the name
 * (a swipeable gallery on phones, focusable so arrow keys scroll it).
 * Rendered while release.showProof is true.
 */
export function Testimonials() {
  const muted = mutedClass("", proof.status);
  return (
    <section id={anchors.testimonials} className="section" aria-labelledby="testimonials-heading">
      <p className="kicker">{proof.kicker}</p>
      <h2 id="testimonials-heading" className="h2 testimonials__heading">
        {proof.heading}
      </h2>
      <ul className="quotes" tabIndex={0} aria-label={proof.heading}>
        {proof.testimonials.map((t, i) => (
          <li key={i}>
            <figure className="quote">
              <span className="quote__mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className={muted}>{t.quote}</blockquote>
              <figcaption>
                <div className="quote__logo">
                  {t.logo && (
                    <div className="quote__logo-img">
                      <Image src={t.logo} alt="" fill sizes="52px" style={{ objectFit: "contain" }} />
                    </div>
                  )}
                </div>
                <div>
                  <div className={["quote__name", muted].filter(Boolean).join(" ")}>{t.name}</div>
                  <div className="quote__title">{t.title}</div>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
