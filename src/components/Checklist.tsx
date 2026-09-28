"use client";

import { useState } from "react";
import { checklist } from "@/content";
import { fill } from "@/lib/copy";

/**
 * 3 · Does this sound like you? A sea-glass band of six toggle checkboxes;
 * a checked box fills pale and gets a pink pen tick drawn over it. The verdict bar below changes with the count:
 * mist at zero, sunflower tint at one or two, sunflower at three or more. State lives in React.
 */
export function Checklist() {
  const [on, setOn] = useState<boolean[]>(() => checklist.items.map(() => false));
  const count = on.filter(Boolean).length;
  const total = checklist.items.length;

  const toggle = (index: number) => setOn((prev) => prev.map((v, i) => (i === index ? !v : v)));

  let verdict: string;
  let tone: "none" | "some" | "many";
  if (count === 0) {
    verdict = fill(checklist.verdicts.none, { n: count, total });
    tone = "none";
  } else if (count === 1) {
    verdict = fill(checklist.verdicts.one, { n: count, total });
    tone = "some";
  } else if (count < checklist.threshold) {
    verdict = fill(checklist.verdicts.two, { n: count, total });
    tone = "some";
  } else {
    verdict = fill(checklist.verdicts.threeOrMore, { n: count, total });
    tone = "many";
  }

  return (
    <section className="section" aria-labelledby="checklist-heading">
      <div className="checklist">
        <div className="checklist__top">
          <p className="kicker kicker--onpine">{checklist.kicker}</p>
          <h2 id="checklist-heading" className="checklist__heading">
            {checklist.heading}
          </h2>
          <p className="checklist__sub">{checklist.subheading}</p>
          <ul className="checklist__items">
            {checklist.items.map((item, i) => (
              <li key={item}>
                <button type="button" className="checklist__item" aria-pressed={on[i]} onClick={() => toggle(i)}>
                  <span className="checklist__box" aria-hidden="true">
                    {on[i] && (
                      <svg className="checklist__tick" viewBox="0 0 30 26">
                        <path d="M4 15 C 8 17, 10 21, 12 23 C 16 14, 22 6, 30 1" />
                      </svg>
                    )}
                  </span>
                  <span className="checklist__text">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={`verdict verdict--${tone}`}>
          <p aria-live="polite">{verdict}</p>
          <a href={checklist.ctaHref} className="button button--primary button--small">
            {checklist.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
