"use client";

import { useState } from "react";
import Image from "next/image";
import { anchors, proof } from "@/content";
import { mutedClass } from "@/lib/copy";

/**
 * 9 · Testimonials (#testimonials): three quote cards, each opening with a
 * pink quote mark, with the client's logo in an 84px circle beside the name
 * (a swipeable gallery on phones, focusable so arrow keys scroll it).
 * A quote marked `clamp` doesn't set the row's height: it's cut to the other
 * cards' height with a fade and a "Read more" button that opens it in place.
 * Rendered while release.showProof is true.
 */
export function Testimonials() {
  const muted = mutedClass("", proof.status);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id={anchors.testimonials} className="section" aria-labelledby="testimonials-heading">
      <p className="kicker">{proof.kicker}</p>
      <h2 id="testimonials-heading" className="h2 testimonials__heading">
        {proof.heading}
      </h2>
      <ul className={["quotes", openIndex !== null && "quotes--open"].filter(Boolean).join(" ")} tabIndex={0} aria-label={proof.heading}>
        {proof.testimonials.map((t, i) => {
          const open = openIndex === i;
          const quoteId = `quote-${i}`;
          return (
            <li key={i} className={open ? "is-open" : undefined}>
              <figure className={["quote", t.clamp && !open && "quote--clamped"].filter(Boolean).join(" ")}>
                <span className="quote__mark" aria-hidden="true">
                  &ldquo;
                </span>
                <div className="quote__body">
                  <blockquote id={quoteId} className={muted}>
                    {t.quote}
                  </blockquote>
                  {t.clamp && (
                    <button
                      type="button"
                      className="quote__more"
                      aria-expanded={open}
                      aria-controls={quoteId}
                      onClick={() => setOpenIndex(open ? null : i)}
                    >
                      {open ? proof.readLess : proof.readMore}
                    </button>
                  )}
                </div>
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
          );
        })}
      </ul>
    </section>
  );
}
