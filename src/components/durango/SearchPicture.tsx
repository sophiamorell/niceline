"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { willTheyFindYou as page } from "@/content-durango";
import { SearchIcon } from "@/components/Icons";

/* How far the dividing line can travel, and where it rests (percent of the width) */
const MIN = 18;
const MAX = 82;
const REST = 50;

/**
 * The browser picture: one search, today on the left and by spring on the
 * right, with a dividing line that drags to show more of either side.
 *
 * The line is a range input laid over the picture, so it works with a mouse,
 * a finger and the arrow keys. When the picture first shows, the line sways
 * once to each side to say "this moves"; any touch of it stops that, and
 * reduced-motion skips it. Below 560px the two halves stack and the line is
 * hidden (see durango.css).
 */
export function SearchPicture() {
  const { visual } = page;
  const [pos, setPos] = useState(REST);
  const touched = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const DURATION = 2600;
    const SWING = 20;
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      if (touched.current) return;
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // one full sway: right, back through the middle, left, home
      setPos(REST + SWING * Math.sin(t * 2 * Math.PI));
      if (t < 1) frame = requestAnimationFrame(step);
      else setPos(REST);
    };
    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, 900);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  const stopHint = () => {
    touched.current = true;
  };

  return (
    <div className="dgo-browser">
      <div className="dgo-browser__bar" aria-hidden="true">
        <span className="dgo-browser__dot dgo-browser__dot--pink" />
        <span className="dgo-browser__dot dgo-browser__dot--sun" />
        <span className="dgo-browser__dot dgo-browser__dot--mist" />
        <span className="dgo-browser__address" />
      </div>
      <div className="dgo-browser__search" aria-hidden="true">
        <span className="dgo-browser__wordmark">{visual.wordmark}</span>
        <span className="dgo-browser__field">
          <SearchIcon />
          {visual.query}
        </span>
      </div>
      <div className="dgo-split" style={{ "--dgo-pos": `${pos}%` } as CSSProperties}>
        <div className="dgo-split__half dgo-split__half--today" role="img" aria-label={visual.label}>
          <div className="dgo-split__inner" aria-hidden="true">
            <span className="dgo-chip">{visual.today.chip}</span>
            {visual.today.results.map((result) => (
              <div key={result.title} className="dgo-result">
                <span className="dgo-result__title">{result.title}</span>
                <span className="dgo-result__detail">{result.detail}</span>
              </div>
            ))}
            <div className="dgo-result dgo-result--buried">
              <div>
                <span className="dgo-result__title">{visual.today.you.title}</span>
                <span className="dgo-result__detail">{visual.today.you.detail}</span>
              </div>
              <span className="dgo-result__tag">{visual.today.you.tag}</span>
            </div>
          </div>
        </div>
        <div className="dgo-split__half dgo-split__half--spring" aria-hidden="true">
          <div className="dgo-split__inner">
            <span className="dgo-chip dgo-chip--sun">{visual.spring.chip}</span>
            <div className="dgo-listing">
              <span className="dgo-listing__title">{visual.spring.you.title}</span>
              <span className="dgo-listing__detail">{visual.spring.you.detail}</span>
              <span className="dgo-listing__actions">
                {visual.spring.you.actions.map((action, i) => (
                  <span key={action} className={i === 0 ? "dgo-pill dgo-pill--sun" : "dgo-pill"}>
                    {action}
                  </span>
                ))}
              </span>
            </div>
            <div className="dgo-result">
              <span className="dgo-result__detail">{visual.spring.site.url}</span>
              <span className="dgo-result__title">{visual.spring.site.title}</span>
              <span className="dgo-result__detail">{visual.spring.site.detail}</span>
            </div>
          </div>
        </div>
        <span className="dgo-split__handle" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6-5 6 5 6" />
            <path d="m15 6 5 6-5 6" />
          </svg>
        </span>
        <input
          type="range"
          className="dgo-split__range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          aria-label={visual.sliderLabel}
          onPointerDown={stopHint}
          onKeyDown={stopHint}
          onChange={(e) => {
            stopHint();
            setPos(Math.min(MAX, Math.max(MIN, Number(e.target.value))));
          }}
        />
      </div>
    </div>
  );
}
