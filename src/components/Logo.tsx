import Image from "next/image";
import { anchors, logo } from "@/content";

/**
 * The Nice Line Marketing logo: the S-curve mark (three lines in sea glass,
 * sunflower and pink) beside the Montserrat wordmark, with "Marketing" in
 * sea glass. Used in the header and, larger, in the footer.
 */
export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <a
      href={`#${anchors.top}`}
      className={variant === "footer" ? "logo logo--footer" : "logo"}
      aria-label={logo.ariaLabel}
    >
      <Image className="logo__icon" src={logo.mark} alt="" width={512} height={512} priority={variant === "header"} />
      <span className="logo__word" aria-hidden="true">
        {logo.lead} <span className="logo__mark">{logo.highlight}</span>
      </span>
    </a>
  );
}
