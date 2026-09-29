import { whyNow } from "@/content";

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6faf9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * 2 · Why marketing, why now: the timeline. Product and Sales are built
 * (sea-glass check dots), Marketing is next (sunflower dot, "You are here"
 * badge). One plain line runs from dot to dot: a mist bar for what's built,
 * dotted for what's next. On phones it turns vertical.
 */
export function WhyNow() {
  const current = whyNow.steps.findIndex((step) => step.current);
  const kind = (i: number) => (current < 0 || i < current ? "done" : "future");
  const last = whyNow.steps.length - 1;

  return (
    <section className="section" aria-labelledby="why-heading">
      <p className="kicker why__kicker">{whyNow.kicker}</p>
      <h2 id="why-heading" className="why__heading">
        <span className="why__line1">{whyNow.headingLines[0]}</span>
        <span className="why__line2">{whyNow.headingLines[1]}</span>
      </h2>

      <div className="timeline">
        <ol className="timeline__steps">
          {whyNow.steps.map((step, i) => (
            <li key={step.numeral} className="step">
              <span
                className={`step__seg step__seg--${kind(i)}${i === last ? " step__seg--last" : ""}`}
                aria-hidden="true"
              />
              <span className="step__marker">
                <span className={step.current ? "step__dot step__dot--here" : "step__dot"} aria-hidden="true">
                  {!step.current && <Check />}
                </span>
                {step.current && <span className="badge">{whyNow.badge}</span>}
              </span>
              <p className={step.current ? "label step__label step__label--here" : "label step__label"}>
                {step.numeral} · {step.status}
              </p>
              <h3 className={step.current ? "step__title--here" : undefined}>{step.title}</h3>
              <p className="step__body">
                <b>{step.lead}</b>
                <br />
                {step.body}
                {step.bodyHighlight && <span className="highlight highlight--body">{step.bodyHighlight}</span>}
                {step.bodyAfter}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
