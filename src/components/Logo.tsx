import Image from "next/image";
import { anchors, logo } from "@/content";

/**
 * The Nice Line Marketing lockup: the stacked ski line (mist, sunflower and
 * pink, each with an ink edge) and the ink wordmark, from public/brand. The
 * header stacks the simple white logo on it and CSS cross-fades to that one on
 * the scrolled teal bar; the footer shows the same lockup, larger. Each image
 * has the brand name as alt text; the link's label names the destination.
 */
export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  if (variant === "footer") {
    return (
      <a href={`#${anchors.top}`} className="logo logo--footer" aria-label={logo.ariaLabel}>
        <Image className="logo__img" src={logo.header.src} width={logo.header.width} height={logo.header.height} alt={logo.alt} />
      </a>
    );
  }
  return (
    <a href={`#${anchors.top}`} className="logo logo--header" aria-label={logo.ariaLabel}>
      <Image
        className="logo__img logo__img--full"
        src={logo.header.src}
        width={logo.header.width}
        height={logo.header.height}
        alt={logo.alt}
        priority
      />
      <Image
        className="logo__img logo__img--simple"
        src={logo.simple.src}
        width={logo.simple.width}
        height={logo.simple.height}
        alt={logo.alt}
      />
    </a>
  );
}
