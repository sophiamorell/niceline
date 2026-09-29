import Image from "next/image";
import { about, anchors } from "@/content";
import { mutedClass } from "@/lib/copy";
import { publicFileExists } from "@/lib/public-file";

/**
 * 7 · About (#about): the arch-topped portrait (a captioned placeholder
 * until the photo lands in public/) with the echo behind it, then the
 * kicker, heading and paragraphs. Client quotes live
 * in Testimonials.
 */
export function About() {
  const hasPhoto = publicFileExists(about.photo);

  return (
    <section id={anchors.about} className="section" aria-labelledby="about-heading">
      <div className="about">
        <div className="portrait" aria-hidden={!hasPhoto || undefined}>
          {hasPhoto ? (
            <Image src={about.photo} alt={about.photoAlt} fill sizes="300px" style={{ objectFit: "cover" }} />
          ) : (
            <span>{about.photoPlaceholder}</span>
          )}
        </div>
        <div className="about__text">
          <p className="kicker">{about.kicker}</p>
          <h2 id="about-heading" className="h2 about__heading">
            {about.heading}
          </h2>
          {about.paragraphs.map((paragraph) => (
            <p
              key={paragraph.text}
              className={["about__para", mutedClass(paragraph.text, about.status)].filter(Boolean).join(" ")}
            >
              {paragraph.lead && <strong>{paragraph.lead} </strong>}
              {paragraph.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
