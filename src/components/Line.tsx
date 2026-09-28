import type { ReactNode } from "react";

/**
 * The logo's pink line, drawn behind a word or two: the one big swash in the
 * hero. The SVG stretches with the text while the stroke keeps its weight.
 */
export function Swash({ children }: { children: ReactNode }) {
  return (
    <span className="swash">
      {children}
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M6 26 C 90 14, 220 10, 330 18 S 390 30, 394 10" />
      </svg>
    </span>
  );
}
