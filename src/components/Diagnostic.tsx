"use client";

import { anchors, diagnostic } from "@/content";
import { openDiagnostic } from "@/lib/diagnostic-modal";

/**
 * 10 · The diagnostic (#diagnostic): the mist block, outlined and stacked
 * like the hero card because you can act on it. Left, the heading,
 * intro and the yellow "See what to fix first" button, which opens the
 * diagnostic popup. Right, the "What comes back" card.
 */
export function Diagnostic() {
  return (
    <section id={anchors.diagnostic} className="section" aria-labelledby="diagnostic-heading">
      <div className="diag">
        <div className="diag__lead">
          <h2 id="diagnostic-heading" className="diag__heading">
            {diagnostic.heading}
          </h2>
          <p className="diag__intro">{diagnostic.intro}</p>
          <button type="button" className="button button--yellow diag__start" onClick={openDiagnostic}>
            {diagnostic.startLabel}
          </button>
        </div>
        <div className="diag__card">
          <span className="label">{diagnostic.comesBack.label}</span>
          <ul className="comes-back">
            {diagnostic.comesBack.items.map((item) => (
              <li key={item}>
                <span className="check" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f6faf9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="diag__note">{diagnostic.comesBack.note}</p>
        </div>
      </div>
    </section>
  );
}
