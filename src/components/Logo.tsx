import { anchors, logo } from "@/content";

/**
 * The Nice Line Marketing lockup, drawn in SVG so it stays crisp at any
 * size: the pink line that curves down and runs out as the underline, "Nice
 * Line" in ink, "MARKETING" in pink, and "with Sophie Williams" beneath.
 * Text is set in the site's Montserrat (FM Head). The header drops the
 * tagline, which is too small to read at that size; the footer keeps it.
 */
export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  const withTagline = variant === "footer";
  return (
    <a
      href={`#${anchors.top}`}
      className={variant === "footer" ? "logo logo--footer" : "logo"}
      aria-label={logo.ariaLabel}
    >
      <svg
        className="logo__svg"
        viewBox={withTagline ? "0 0 2000 500" : "0 0 2000 405"}
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="var(--pink)"
          d="M207 8 229 20C214 52 160 72 146 97 180 118 300 118 338 170 356 196 352 238 330 262 300 292 255 305 215 315L1145 316 1145 396 104 396C38 396 8 368 8 334 8 290 90 270 190 250 258 236 292 222 292 205 292 176 220 160 180 150 130 137 108 123 108 100 108 58 192 42 207 8Z"
        />
        <text x="418" y="277" fontSize="300" fontWeight="800" fill="var(--ink)" textLength="1400" lengthAdjust="spacingAndGlyphs">
          {logo.lead}
        </text>
        <text x="1185" y="396" fontSize="112" fontWeight="700" fill="var(--pink)" textLength="805" lengthAdjust="spacing">
          {logo.highlight.toUpperCase()}
        </text>
        {withTagline && (
          <text x="905" y="490" fontSize="56" fontWeight="600" fill="var(--muted)" textLength="1075" lengthAdjust="spacing">
            {logo.tagline.toUpperCase()}
          </text>
        )}
      </svg>
    </a>
  );
}
