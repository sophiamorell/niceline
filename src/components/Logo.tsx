import Image from "next/image";
import { anchors, logo } from "@/content";

/**
 * The Nice Line Marketing lockup: the stacked ski line (mist, sunflower and
 * pink, each with an ink edge) and the ink wordmark, from public/brand. The
 * header renders it with the simple white logo stacked on top, and CSS
 * cross-fades to that one on the scrolled teal bar; the footer adds "with
 * Sophie Williams". The link carries the accessible name, so the images are
 * decorative.
 */
export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  if (variant === "footer") {
    return (
      <a href={`#${anchors.top}`} className="logo logo--footer" aria-label={logo.ariaLabel}>
        <Image className="logo__img" src={logo.footer.src} width={logo.footer.width} height={logo.footer.height} alt="" />
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
        alt=""
        priority
      />
      <Image
        className="logo__img logo__img--simple"
        src={logo.simple.src}
        width={logo.simple.width}
        height={logo.simple.height}
        alt=""
      />
    </a>
  );
}
