"use client";

import type { KeyboardEvent } from "react";
import { hero } from "@/content";
import { openDiagnostic } from "@/lib/diagnostic-modal";

/**
 * The hero's right column: a card, echoed like the logo, that is a picture
 * of question 1. The whole card is one button that opens the
 * diagnostic popup; nothing inside it takes input or focus.
 */
export function DiagnosticCard() {
  const { card } = hero;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDiagnostic();
    }
  };

  return (
    <div
      className="dcard"
      role="button"
      tabIndex={0}
      aria-label={card.ariaLabel}
      onClick={openDiagnostic}
      onKeyDown={onKeyDown}
    >
      <div className="dcard__front" aria-hidden="true">
        <div className="dcard__header">
          <span className="label">{card.progressLabel}</span>
          <span className="label dcard__time">{card.timeLabel}</span>
        </div>
        <div className="dcard__progress">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={i === 0 ? "dcard__segment dcard__segment--on" : "dcard__segment"} />
          ))}
        </div>
        <p className="dcard__prompt">{card.prompt}</p>
        <div className="dcard__options">
          {card.options.map((option, i) => (
            <span key={option} className={i === card.selectedIndex ? "dcard__option dcard__option--on" : "dcard__option"}>
              <span className="choice__radio" />
              {option}
            </span>
          ))}
        </div>
        <span className="dcard__button">
          <span>{card.buttonLabel}</span>
          <span>→</span>
        </span>
        <p className="dcard__caption">{card.caption}</p>
      </div>
    </div>
  );
}
