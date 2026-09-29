"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Tone, ToolVisual as Visual } from "@/content";

/* Every visual is drawn on this artboard, then scaled to the slot's width. */
const ARTBOARD_WIDTH = 560;

const pct = (share: number): CSSProperties => ({ width: `${share * 100}%` });

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fdfdfc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** A horizontal track with a filled share, in one of the brand tones. */
function Bar({ share, tone, className }: { share: number; tone: Tone; className: string }) {
  return (
    <span className={`tv-track ${className}`}>
      <span className={`tv-fill tv--${tone}`} style={pct(share)} />
    </span>
  );
}

function Proof({ v }: { v: Extract<Visual, { kind: "proof" }> }) {
  return (
    <>
      <div className="tv-sheet tv-proof__sheet">
        <div className="tv-kicker">{v.kicker}</div>
        <div className="tv-proof__rows">
          {v.rows.map((row) => (
            <Row key={row.label}>
              <span>{row.label}</span>
              <Bar share={row.share} tone={row.tone} className="tv-proof__bar" />
              <span className="tv-proof__value">{row.value}</span>
            </Row>
          ))}
        </div>
        <div className="tv-proof__footer">
          {v.footer.before}
          <b>{v.footer.bold}</b>
          {v.footer.after}
        </div>
      </div>
      <div className="tv-sheet tv-proof__quote">
        <div className="tv-proof__mark">{v.quote.mark}</div>
        <div className="tv-proof__text">{v.quote.text}</div>
        <div className="tv-proof__who">{v.quote.who}</div>
      </div>
    </>
  );
}

/* Grid rows are flattened into their grid, so a fragment is enough. */
function Row({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function Score({ v }: { v: Extract<Visual, { kind: "score" }> }) {
  return (
    <div className="tv-sheet tv-score">
      <div className="tv-score__left">
        <div className="tv-score__total">
          <span className="tv-score__num">{v.score}</span>
          <span className="tv-score__of">{v.outOf}</span>
        </div>
        <span className="tv-chip tv-score__tier">{v.tier}</span>
        <div className="tv-score__campaign">{v.campaign}</div>
        <div className="tv-score__mix">
          {v.mix.map((part, i) => (
            <span key={i} className={`tv--${part.tone}`} style={pct(part.share)} />
          ))}
        </div>
      </div>
      <div className="tv-score__right">
        <div className="tv-kicker tv-kicker--sm">{v.kicker}</div>
        <div className="tv-score__rows">
          {v.rows.map((row) => (
            <Row key={row.label}>
              <span>{row.label}</span>
              <Bar share={row.share} tone={row.tone} className="tv-score__bar" />
              <b className="tv-score__value">{row.value}</b>
            </Row>
          ))}
        </div>
      </div>
    </div>
  );
}

function Qualify({ v }: { v: Extract<Visual, { kind: "qualify" }> }) {
  return (
    <div className="tv-qualify">
      <div className="tv-qualify__chips">
        {v.chips.map((chip) => (
          <Row key={chip}>
            <span className="tv-chip tv-chip--lg">{chip}</span>
            <span className="tv-qualify__plus">{v.joiner}</span>
          </Row>
        ))}
        <span className="tv-chip tv-chip--lg tv-qualify__own">{v.own}</span>
      </div>
      <div className="tv-qualify__tiles">
        {v.tiles.map((tile) => (
          <div key={tile.letter} className="tv-qualify__item">
            <div className={tile.pop ? "tv-qualify__tile tv-qualify__tile--pop" : "tv-qualify__tile"}>
              {tile.letter}
              <span className="tv-qualify__badge">
                <Check />
              </span>
            </div>
            <span className="tv-qualify__word">{tile.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Intel({ v }: { v: Extract<Visual, { kind: "intel" }> }) {
  return (
    <>
      <div className="tv-sheet tv-intel__sheet">
        <div className="tv-kicker tv-intel__head">
          <span className="pulse pulse--sm" />
          {v.kicker}
        </div>
        <div className="tv-intel__price">
          <span className="tv-intel__was">{v.was}</span>
          <span className="tv-intel__now">
            {v.now}
            <span className="tv-intel__unit">{v.unit}</span>
          </span>
        </div>
        <div className="tv-intel__changed">{v.changed}</div>
        <div className="tv-intel__note">
          {v.note.before}
          <b>{v.note.bold}</b>
        </div>
      </div>
      <div className="tv-sheet tv-intel__card">
        <div className="tv-intel__cardhead">
          <span className="tv-kicker tv-kicker--sm tv-kicker--ink">{v.card.kicker}</span>
          <span className="tv-intel__badge">{v.card.badge}</span>
        </div>
        <div className="tv-intel__heading">{v.card.heading}</div>
        <div className="tv-intel__points">
          {v.card.points.map((point) => (
            <div key={point} className="tv-intel__point">
              {point}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Toolkit({ v }: { v: Extract<Visual, { kind: "toolkit" }> }) {
  return (
    <>
      <div className="tv-toolkit__tabs">
        {v.tabs.map((tab) => (
          <span key={tab} className={tab === v.active ? "tv-toolkit__tab tv-toolkit__tab--on" : "tv-toolkit__tab"}>
            {tab}
          </span>
        ))}
      </div>
      <div className="tv-sheet tv-toolkit__sheet">
        <div className="tv-toolkit__quote">
          <span className="tv-toolkit__mark">{v.quote.open}</span>
          {v.quote.text}
          <span className="tv-toolkit__mark">{v.quote.close}</span>
        </div>
        <div className="tv-toolkit__answer">
          {v.answer.before}
          <b>{v.answer.bold}</b>
          {v.answer.after}
        </div>
        <div className="tv-toolkit__users">
          <span>{v.usedBy}</span>
          {v.users.map((user) => (
            <span key={user} className="tv-chip tv-chip--sm tv-toolkit__user">
              {user}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function Budget({ v }: { v: Extract<Visual, { kind: "budget" }> }) {
  return (
    <>
      <div className="tv-sheet tv-budget__sheet">
        <div className="tv-kicker">{v.kicker}</div>
        <div className="tv-budget__bar">
          {v.split.map((part) => (
            <span key={part.label} className={`tv--${part.tone}`} style={pct(part.share)} />
          ))}
        </div>
        <div className="tv-budget__legend">
          {v.split.map((part) => (
            <Row key={part.label}>
              <span className={`tv-budget__dot tv--${part.tone}`} />
              <span>{part.label}</span>
              <b>{`${Math.round(part.share * 100)}%`}</b>
            </Row>
          ))}
        </div>
      </div>
      <div className="tv-sheet tv-budget__card">
        <div className="tv-kicker tv-kicker--sm tv-kicker--deep">{v.card.kicker}</div>
        <div className="tv-budget__heading">{v.card.heading}</div>
        <div className="tv-budget__items">
          {v.card.items.map((item) => (
            <div key={item} className="tv-budget__item">
              <span className="tv-check">
                <Check />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Drawing({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case "proof":
      return <Proof v={visual} />;
    case "score":
      return <Score v={visual} />;
    case "qualify":
      return <Qualify v={visual} />;
    case "intel":
      return <Intel v={visual} />;
    case "toolkit":
      return <Toolkit v={visual} />;
    case "budget":
      return <Budget v={visual} />;
  }
}

/**
 * A tool's slot with its built visual: a small UI illustration drawn on a
 * fixed 560 x 280 artboard and scaled to the slot's width, so it stays crisp
 * and keeps its layout from the desktop grid down to the phone gallery. The
 * artboard is hidden until it's measured, so it never shows at the wrong size.
 */
export function ToolVisual({ visual, label }: { visual: Visual; label: string }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / ARTBOARD_WIDTH));
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={slotRef} className="slot slot--visual" role="img" aria-label={label}>
      <div
        className="tv"
        aria-hidden="true"
        style={scale === null ? { visibility: "hidden" } : { transform: `scale(${scale})` }}
      >
        <Drawing visual={visual} />
      </div>
    </div>
  );
}
