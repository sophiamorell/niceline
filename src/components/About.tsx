import Image from "next/image";
import { about, anchors, site } from "@/content";
import { mutedClass } from "@/lib/copy";
import { publicFileExists } from "@/lib/public-file";

/**
 * 7 · About (#about): the arch-topped portrait (a captioned placeholder
 * until the photo lands in public/) with the echo behind it, then the
 * kicker, heading and paragraphs. Client quotes live
 * in Testimonials.
 */
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

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
          {site.linkedin !== null && (
            <a href={site.linkedin} className="about__linkedin" rel="me">
              <LinkedInIcon />
              {about.linkedinLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
