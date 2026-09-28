"use client";

import { useState } from "react";
import { faq } from "@/content";
import { mutedClass } from "@/lib/copy";

/**
 * 8 · FAQ: an accordion of the items whose `show` is true, all closed by
 * default, one open at a time. Closed items show a sea-glass +; the open
 * one shows a short pink dash.
 */
export function Faq() {
  const items = faq.items.filter((item) => item.show);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section" aria-labelledby="faq-heading">
      <p className="kicker">{faq.kicker}</p>
      <h2 id="faq-heading" className="h2 faq__heading">
        {faq.heading}
      </h2>
      <div className="faq">
        {items.map((item, i) => {
          const open = openIndex === i;
          const panelId = `faq-panel-${i}`;
          const triggerId = `faq-trigger-${i}`;
          return (
            <div key={item.question} className="faq__item">
              <h3>
                <button
                  type="button"
                  id={triggerId}
                  className="faq__trigger"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className={mutedClass(item.question, item.status)}>{item.question}</span>
                  {open ? (
                    <span className="faq__dash" aria-hidden="true" />
                  ) : (
                    <span className="faq__sign" aria-hidden="true">
                      +
                    </span>
                  )}
                </button>
              </h3>
              <p
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={["faq__answer", mutedClass(item.answer, item.status)].filter(Boolean).join(" ")}
                hidden={!open}
              >
                {item.answer}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
