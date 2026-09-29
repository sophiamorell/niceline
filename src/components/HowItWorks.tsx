"use client";

import { useState, useSyncExternalStore, type MouseEvent } from "react";
import { anchors, howItWorks, phases, pricing, release, type PhaseId } from "@/content";
import { fill, formatPrice, mutedClass } from "@/lib/copy";
import { openContact } from "@/lib/contact-modal";

/* Matches the CSS breakpoint where step cards collapse. */
const COLLAPSE_QUERY = "(max-width: 900px)";

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

/** `date` plus `months`, clamped to the last day of the target month (Nov 30 + 3 is Feb 28/29). */
function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

/**
 * The lead under the heading. The page is prebuilt, so the dates are filled
 * in the browser after it loads; until then (and without JavaScript) it
 * shows the undated intro.
 */
function DatedIntro() {
  const text = useSyncExternalStore(noSubscribe, datedIntro, () => howItWorks.intro);
  return <p className="intro how__intro">{text}</p>;
}

const noSubscribe = () => () => {};

function datedIntro(): string {
  const today = new Date();
  return fill(howItWorks.datedIntro, {
    today: longDate.format(today),
    target: longDate.format(addMonths(today, howItWorks.targetMonths)),
  });
}

/**
 * 4 · How it works (#how), option 1a: steps and pricing in one section.
 * Kicker, heading and a dated lead (today, and today plus four months); the
 * line (a node over each card on one plain mist bar); three step cards with every
 * deliverable visible (Step 1 featured, with the badge; on phones each card
 * collapses to its step, outcome and price, with a +/− to open it); then the bundle row
 * (#pricing): the total, computed from the step prices and shown only when
 * all are set, a cost comparison with a senior marketer, and the "Let's
 * talk" button that opens the contact popup. The locals note and payment
 * terms sit under it behind release flags.
 */
export function HowItWorks() {
  const stepPrice = (id: PhaseId) => pricing.steps.find((step) => step.phase === id);

  /* Phones: which step cards are open (all start collapsed). Desktop ignores it. */
  const [open, setOpen] = useState<ReadonlySet<PhaseId>>(new Set());
  const toggle = (id: PhaseId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  /* A tap anywhere on a collapsed card opens it, on phones only. */
  const onCardClick = (event: MouseEvent, id: PhaseId) => {
    if ((event.target as Element).closest("button")) return;
    if (window.matchMedia(COLLAPSE_QUERY).matches) toggle(id);
  };
  const allPriced = pricing.steps.every((step) => step.price !== null);
  const total = allPriced ? pricing.steps.reduce((sum, step) => sum + (step.price ?? 0), 0) : null;

  return (
    <section id={anchors.howItWorks} className="section" aria-labelledby="how-heading">
      <p className="kicker">{howItWorks.kicker}</p>
      <h2 id="how-heading" className="h2">
        {howItWorks.heading}
      </h2>
      <DatedIntro />

      <div className="phaseline" aria-hidden="true">
        {phases.map((phase) => (
          <span key={phase.id} className="phaseline__seg">
            <span className="phaseline__bar" />
            <i className="phaseline__node" />
          </span>
        ))}
      </div>

      <ol className="steps">
        {phases.map((phase) => {
          const price = stepPrice(phase.id);
          const isOpen = open.has(phase.id);
          const detailsId = `step-details-${phase.id}`;
          const className = ["stepcard", price?.featured && "stepcard--featured", isOpen && "stepcard--open"]
            .filter(Boolean)
            .join(" ");
          return (
            <li key={phase.id} className={className} onClick={(event) => onCardClick(event, phase.id)}>
              <div className="stepcard__meta">
                <span className="label">
                  {phase.tag} · {phase.duration}
                </span>
                {price?.featured && <span className="badge">{pricing.badge}</span>}
                <button
                  type="button"
                  className="stepcard__toggle"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  aria-label={fill(isOpen ? howItWorks.toggleHide : howItWorks.toggleShow, { step: phase.tag })}
                  onClick={() => toggle(phase.id)}
                >
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
              </div>
              <p className="stepcard__question">{phase.question}</p>
              <h3 className={["stepcard__outcome", mutedClass(phase.outcome, phase.status)].filter(Boolean).join(" ")}>
                {phase.outcome}
              </h3>
              <div id={detailsId} className="stepcard__details">
                <p className="label stepcard__keep">{howItWorks.youKeepLabel}</p>
                <ul className="stepcard__list">
                  {phase.youKeep.map((item) => (
                    <li key={item} className={mutedClass(item)}>
                      {item}
                    </li>
                  ))}
                </ul>
                {phase.yourTime !== null && (
                  <p className="stepcard__time">{fill(howItWorks.yourTimeLabel, { time: phase.yourTime })}</p>
                )}
              </div>
              {price && (
                <div className="stepcard__price">
                  <span className="stepcard__amount">{formatPrice(price.price, pricing.emptyPrice)}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div id={anchors.pricing} className="bundle">
        <div>
          <p className="bundle__total">
            <span>{pricing.bundle.label}</span>
            <span>{formatPrice(total, pricing.emptyPrice)}</span>
          </p>
          <div className="bundle__compare">
            {pricing.bundle.comparison.map((row) => (
              <div key={row.label} className={row.ours ? "bundle__row bundle__row--ours" : "bundle__row"}>
                <span className="bundle__label">{row.label}</span>
                <span className="bundle__track" aria-hidden="true">
                  <span className="bundle__bar" style={{ width: `${row.share * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
          <p className="bundle__caption">{pricing.bundle.caption}</p>
        </div>
        <button type="button" className="bundle__cta" onClick={openContact}>
          {pricing.ctaLabel}
        </button>
      </div>

      {release.showLocalsNote && (
        <p className="how__locals">
          {pricing.localsNote.before}
          <strong className="highlight highlight--body">{pricing.localsNote.emphasis}</strong>
          {pricing.localsNote.after}
        </p>
      )}
      {release.showPricingTerms && <p className="how__footnote">{pricing.terms}</p>}
    </section>
  );
}
