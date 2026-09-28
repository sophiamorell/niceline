import Image from "next/image";
import { about, anchors } from "@/content";
import { mutedClass } from "@/lib/copy";
import { publicFileExists } from "@/lib/public-file";

/**
 * 7 · About (#about): the arch-topped portrait (a captioned placeholder
 * until the photo lands in public/) with the pink line traced around its
 * right side, then the kicker, heading and paragraphs. Client quotes live
 * in Testimonials.
 */
export function About() {
  const hasPhoto = publicFileExists(about.photo);

  return (
    <section id={anchors.about} className="section" aria-labelledby="about-heading">
      <div className="about">
        <div className="portrait-wrap">
          <div className="portrait" aria-hidden={!hasPhoto || undefined}>
            {hasPhoto ? (
              <Image src={about.photo} alt={about.photoAlt} fill sizes="300px" style={{ objectFit: "cover" }} />
            ) : (
              <span>{about.photoPlaceholder}</span>
            )}
          </div>
          <svg className="portrait-wrap__line" viewBox="0 0 100 133" preserveAspectRatio="none" aria-hidden="true">
            <path d="M10 64 C 10 26, 30 5, 54 5 C 82 5, 99 30, 100 62 C 101 98, 102 122, 88 128 C 66 136, 28 133, -8 131" />
          </svg>
        </div>
        <div className="about__text">
          <p className="kicker">{about.kicker}</p>
          <h2 id="about-heading" className="h2 about__heading">
            {about.heading}
          </h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className={["about__para", mutedClass(paragraph, about.status)].filter(Boolean).join(" ")}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
