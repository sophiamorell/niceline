import Image from "next/image";
import { anchors, proof } from "@/content";
import { mutedClass } from "@/lib/copy";

/**
 * 9 · Testimonials (#testimonials): three quote cards, each opening with a
 * pink quote mark, with an 84px circular
 * photo slot (a swipeable gallery on phones, focusable so arrow keys scroll
 * it). Rendered while release.showProof is true; the quotes, names and
 * photos are the design's slots until real ones arrive.
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
                <div className="quote__photo">
                  {t.photo && <Image src={t.photo} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />}
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
