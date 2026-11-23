"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { willTheyFindYou as page } from "@/content-durango";
import { fill } from "@/lib/copy";
import { openContactWith } from "@/lib/contact-modal";
import { CheckIcon } from "@/components/Icons";

/* How long each package shows during the opening tour */
const TOUR_STEP_MS = 3600;

/**
 * The three packages as tabs: the name, price and one line on each tab, and
 * the chosen package in full underneath.
 *
 * To show that the tabs switch, the picker takes one tour when it scrolls
 * into view: each package in turn, with a bar filling along the tab that's
 * showing, then back to the first. Hovering, focusing or clicking anywhere
 * in the picker ends the tour for good, and reduced-motion skips it. The
 * panel eases in on every change (durango.css).
 *
 * Left and right arrow keys move between tabs. The panel's button opens the
 * contact popup with the package already named in the message.
 */
export function PackagePicker() {
  const { packages, picker } = page;
  const [index, setIndex] = useState(0);
  const [touring, setTouring] = useState(false);
  const done = useRef(false); // the tour has run, or was interrupted
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Start the tour the first time the picker is properly on screen */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !done.current) {
          setTouring(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  /* The tour: one step per package, then home */
  useEffect(() => {
    if (!touring) return;
    const timer = window.setTimeout(() => {
      if (index + 1 < packages.length) {
        setIndex(index + 1);
      } else {
        done.current = true;
        setTouring(false);
        setIndex(0);
      }
    }, TOUR_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [touring, index, packages.length]);

  const endTour = () => {
    done.current = true;
    setTouring(false);
  };

  const pick = (i: number) => {
    endTour();
    setIndex(i);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : packages.length - 1)) % packages.length;
    pick(next);
    tabRefs.current[next]?.focus();
  };

  const pkg = packages[index];

  return (
    <div ref={rootRef} className="dgo-picker" onPointerEnter={endTour} onFocusCapture={endTour}>
      <div className="dgo-tabs" role="tablist" aria-label={picker.tabsLabel}>
        {packages.map((p, i) => {
          const selected = i === index;
          return (
            <button
              key={p.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? "dgo-tab dgo-tab--on" : "dgo-tab"}
              onClick={() => pick(i)}
              onKeyDown={onTabKey}
            >
              <span className="dgo-tab__name">{p.name}</span>
              <span className="dgo-tab__price">{p.price}</span>
              <span className="dgo-tab__line">{p.tabLine}</span>
              {selected && touring && <span className="dgo-tab__progress" style={{ animationDuration: `${TOUR_STEP_MS}ms` }} />}
            </button>
          );
        })}
      </div>

      <div key={pkg.id} className="dgo-panel" role="tabpanel" id={`panel-${pkg.id}`} aria-labelledby={`tab-${pkg.id}`}>
        <div className="dgo-panel__words">
          <h3 className="dgo-panel__name">{pkg.name}</h3>
          <p className="dgo-panel__promise">{pkg.promise}</p>
          <p className="dgo-label">{picker.gets}</p>
          <ul className="dgo-checks">
            {pkg.gets.map((item) => (
              <li key={item.lead}>
                <CheckIcon />
                <span>
                  <strong>{item.lead}</strong> {item.rest}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="dgo-panel__numbers">
          <div>
            <p className="dgo-panel__price">{pkg.price}</p>
            <p className="dgo-panel__note">{picker.priceNote}</p>
          </div>
          <div className="dgo-panel__pay">
            <p className="dgo-label">{picker.pays}</p>
            <p className="dgo-panel__deposit">{fill(picker.deposit, { deposit: pkg.deposit })}</p>
            <ul className="dgo-pays">
              {pkg.pays.map((pay) => (
                <li key={pay.amount}>
                  <strong>{pay.amount}</strong>
                  <span>{pay.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="button button--primary dgo-panel__cta"
            onClick={() => openContactWith({ message: fill(picker.ctaMessage, { name: pkg.name }) })}
          >
            {fill(picker.cta, { deposit: pkg.deposit })}
          </button>
        </div>
      </div>
    </div>
  );
}
