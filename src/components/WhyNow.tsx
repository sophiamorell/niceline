import { whyNow } from "@/content";

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6faf9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* One drawn segment per step, from its dot to the next: a straight
   sea-glass rule for what's built, the pink line drawing in on the step
   before "you are here", then pink dots ending in a flick. */
const SEGMENT = {
  done: "M0 10 L100 10",
  draw: "M0 10 C 25 10, 38 3, 58 6 S 86 13, 100 10",
  future: "M0 10 C 40 8, 70 12, 94 8 S 99.5 3, 100 1",
};

/**
 * 2 · Why marketing, why now: the timeline. Product and Sales are built
 * (sea-glass check dots), Marketing is next (ink-ringed dot with a pink
 * centre, "You are here" badge). On phones the segments give way to a
 * vertical rail.
 */
export function WhyNow() {
  const current = whyNow.steps.findIndex((step) => step.current);
  const kind = (i: number): keyof typeof SEGMENT =>
    current < 0 || i < current - 1 ? "done" : i === current - 1 ? "draw" : "future";
  const last = whyNow.steps.length - 1;

  return (
    <section className="section" aria-labelledby="why-heading">
      <p className="kicker why__kicker">{whyNow.kicker}</p>
      <h2 id="why-heading" className="why__heading">
        <span className="why__line1">{whyNow.headingLines[0]}</span>
        <span className="why__line2">{whyNow.headingLines[1]}</span>
      </h2>

      <div className="timeline">
        <div className="timeline__rail" aria-hidden="true" />
        <ol className="timeline__steps">
          {whyNow.steps.map((step, i) => (
            <li key={step.numeral} className="step">
              <svg
                className={`step__seg step__seg--${kind(i)}${i === last ? " step__seg--last" : ""}`}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={SEGMENT[kind(i)]} />
              </svg>
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
                {step.bodyHighlight && <span className="underline">{step.bodyHighlight}</span>}
                {step.bodyAfter}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
