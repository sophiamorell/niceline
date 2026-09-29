import Image from "next/image";
import { anchors, logo } from "@/content";

/**
 * The Nice Line Marketing lockup: the stacked ski line (mist, sunflower and
 * pink, each with an ink edge) and the ink wordmark, from public/brand. The
 * header uses the version without the tagline; the footer adds "with Sophie
 * Williams". The link carries the accessible name, so the image is decorative.
 */
export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  const art = logo[variant];
  return (
    <a
      href={`#${anchors.top}`}
      className={variant === "footer" ? "logo logo--footer" : "logo"}
      aria-label={logo.ariaLabel}
    >
      <Image
        className="logo__img"
        src={art.src}
        width={art.width}
        height={art.height}
        alt=""
        priority={variant === "header"}
      />
    </a>
  );
}
