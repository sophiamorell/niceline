"use client";

import { useId, useRef, useState } from "react";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import { rubricUrl } from "@/lib/line-check/rubric-link";
import { track } from "@/lib/track";
import type { Rubric } from "@/lib/line-check/types";
import { DownloadIcon, LinkIcon } from "@/components/line-check/icons";

const { rubric: copy, events } = lineCheck;

export function tierFor(score: number) {
  return copy.tiers.find((t) => score >= t.min) ?? copy.tiers[copy.tiers.length - 1];
}

/**
 * The rubric as a table, then the live scorer built from it: one select per
 * criterion, the score and tier updating as each is picked. "Copy link" puts
 * the rubric (not the customer data) in the URL hash; "Download as PDF" is
 * the browser's print dialog with a print stylesheet.
 */
export function RubricView({ rubric, shared = false }: { rubric: Rubric; shared?: boolean }) {
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
      <div className="lc-rubric">
        <table className="lc-rubric__table">
          <thead>
            <tr>
              <th scope="col">{copy.criterion}</th>
              <th scope="col" className="lc-rubric__weight">
                {copy.weight}
              </th>
              <th scope="col">{copy.levels}</th>
            </tr>
          </thead>
          <tbody>
            {rubric.criteria.map((c) => (
              <tr key={c.name}>
                <td data-label={copy.criterion}>
                  <strong className="lc-rubric__name">{c.name}</strong>
                  {c.why && <span className="lc-rubric__why">{c.why}</span>}
                </td>
                <td data-label={copy.weight} className="lc-rubric__weight">
                  {c.weight}
                </td>
                <td data-label={copy.levels}>
                  <ul className="lc-rubric__levels">
                    {c.levels.map((l) => (
                      <li key={l.label}>
                        <span>{l.label}</span>
                        <span className="lc-rubric__points">
                          {l.points} {copy.pointsSuffix}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!shared && (
        <div className="lc-actions lc-noprint">
          <button type="button" className="button button--outline button--small lc-icon-button" onClick={copyLink}>
            <LinkIcon />
            {copy.copyLink}
          </button>
          <button
            type="button"
            className="button button--outline button--small lc-icon-button"
            onClick={() => window.print()}
          >
            <DownloadIcon />
            {copy.download}
          </button>
          <p className="lc-fine" role="status" aria-live="polite">
            {copied === "ok" ? copy.copied : copied === "failed" ? copy.copyFailed : ""}
          </p>
        </div>
      )}

      <Scorer rubric={rubric} />
    </>
  );
}

function Scorer({ rubric }: { rubric: Rubric }) {
  const uid = useId();
  const [picks, setPicks] = useState<Record<number, number>>({});
  const tracked = useRef(false);

  const answered = Object.keys(picks).length;
  const score = rubric.criteria.reduce((sum, c, i) => sum + (picks[i] !== undefined ? c.levels[picks[i]].points : 0), 0);
  const tier = tierFor(score);

  return (
    <section className="lc-scorer lc-noprint" aria-labelledby={`${uid}-h`}>
      <h3 id={`${uid}-h`} className="lc-h3">
        {copy.scorerHeadline}
      </h3>
      <p className="lc-body">{copy.scorerBody}</p>
      <div className="lc-scorer__grid">
        <div className="lc-scorer__fields">
          {rubric.criteria.map((c, i) => (
            <label key={c.name} htmlFor={`${uid}-${i}`} className="field">
              <span className="field__label">{c.name}</span>
              <select
                id={`${uid}-${i}`}
                className="input lc-select"
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
                    {l.label} ({l.points})
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className={`lc-score lc-score--${tier.tier}`} aria-live="polite">
          <span className="label">{copy.score}</span>
          <span className="lc-score__num">{score}</span>
          <span className="lc-score__tier">
            <b>{tier.tier}</b> {tier.label}
          </span>
          <span className="lc-fine">{fill(copy.answered, { n: answered, total: rubric.criteria.length })}</span>
        </div>
      </div>
    </section>
  );
}
