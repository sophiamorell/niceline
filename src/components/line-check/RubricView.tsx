"use client";

import { useId, useRef, useState } from "react";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import { rubricUrl } from "@/lib/line-check/rubric-link";
import { track } from "@/lib/track";
import type { Rubric } from "@/lib/line-check/types";

const { rubric: copy, events } = lineCheck;

export function tierFor(score: number) {
  return copy.tiers.find((t) => score >= t.min) ?? copy.tiers[copy.tiers.length - 1];
}

/**
 * The rubric as five criterion cards (handoff 6a), then Copy link and
 * Download PDF. "Copy link" puts the rubric (never the customer data) in the
 * URL hash; "Download PDF" is the browser's print dialog with a print
 * stylesheet.
 */
export function RubricCards({ rubric, actions = true }: { rubric: Rubric; actions?: boolean }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "failed">("idle");

  const copyLink = async () => {
    const url = rubricUrl(rubric);
    try {
      window.history.replaceState(null, "", url);
    } catch {
      /* keep going: the clipboard still gets it */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied("ok");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 4000);
  };

  return (
    <>
      <ol className="lc-criteria">
        {rubric.criteria.map((c) => (
          <li key={c.name} className="lc-criterion">
            <div className="lc-criterion__head">
              <h2 className="lc-criterion__name">{c.name}</h2>
              <span className="lc-criterion__weight">{c.weight}</span>
            </div>
            {c.why && <p className="lc-criterion__why">{c.why}</p>}
            <ul className="lc-criterion__levels">
              {c.levels.map((l) => (
                <li key={l.label}>
                  <span>{l.label}</span>
                  <span className="lc-criterion__points">{l.points}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {actions && (
        <>
          <div className="lc-pair lc-noprint">
            <button type="button" className="lc-btn lc-btn--outline" onClick={copyLink}>
              {copy.copyLink}
            </button>
            <button type="button" className="lc-btn lc-btn--outline" onClick={() => window.print()}>
              {copy.download}
            </button>
          </div>
          <p className="lc-fine lc-center lc-noprint" role="status" aria-live="polite">
            {copied === "ok" ? copy.copied : copied === "failed" ? copy.copyFailed : ""}
          </p>
        </>
      )}
    </>
  );
}

/**
 * The live scorer (handoff 6b): a prospect name, the tier card, and one
 * select per criterion. The score and tier update on every change.
 */
export function Scorer({ rubric }: { rubric: Rubric }) {
  const uid = useId();
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [prospect, setProspect] = useState("");
  const tracked = useRef(false);

  const answered = Object.keys(picks).length;
  const score = rubric.criteria.reduce((sum, c, i) => sum + (picks[i] !== undefined ? c.levels[picks[i]].points : 0), 0);
  const tier = tierFor(score);

  return (
    <section className="lc-scorer lc-noprint" aria-labelledby={`${uid}-h`}>
      <p className="lc-kicker">{copy.scorerKicker}</p>
      <h2 id={`${uid}-h`} className="lc-display lc-display--md">
        {copy.scorerHeadline}
      </h2>
      <input
        className="lc-input"
        aria-label={copy.prospectLabel}
        placeholder={copy.prospectPlaceholder}
        value={prospect}
        onChange={(e) => setProspect(e.target.value)}
      />

      <div className={answered === 0 ? "lc-tier lc-tier--none" : `lc-tier lc-tier--${tier.tier}`} aria-live="polite">
        <span className="lc-tier__letter">{answered === 0 ? copy.emptyLetter : tier.tier}</span>
        <span className="lc-tier__text">
          <span className="lc-tier__label">{answered === 0 ? copy.emptyTier : tier.label}</span>
          <span className="lc-tier__score">{fill(copy.scoreOf, { score })}</span>
        </span>
      </div>

      <div className="lc-scorer__fields">
        {rubric.criteria.map((c, i) => (
          <label key={c.name} htmlFor={`${uid}-${i}`} className="lc-field">
            <span className="lc-field__label">{c.name}</span>
            <select
              id={`${uid}-${i}`}
              className="lc-input lc-select"
              value={picks[i] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setPicks((prev) => {
                  const next = { ...prev };
                  if (v === "") delete next[i];
                  else next[i] = Number(v);
                  return next;
                });
                if (!tracked.current) {
                  tracked.current = true;
                  track(events.scorerUsed);
                }
              }}
            >
              <option value="">{copy.pick}</option>
              {c.levels.map((l, j) => (
                <option key={l.label} value={j}>
                  {fill(copy.option, { label: l.label, points: l.points })}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
