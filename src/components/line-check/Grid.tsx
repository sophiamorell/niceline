"use client";

import { useState } from "react";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import { CategoryCard } from "@/components/line-check/ProfileCards";
import type { DraftCustomer } from "@/lib/line-check/state";
import { CATEGORIES, getField, type CategoryKey, type CustomerProfile, type FieldPath } from "@/lib/line-check/types";

/** A category's values in one line, buyer roles spelled out ("surgeon signed"). */
function summary(customer: CustomerProfile, category: CategoryKey): string {
  const fields = CATEGORIES.find((c) => c.key === category)?.fields ?? [];
  return fields
    .map((f) => {
      const value = getField(customer, `${category}.${f}` as FieldPath).value;
      if (!value) return null;
      const role = category === "buyer" ? lineCheck.review.roles[f] : undefined;
      return role ? `${value} (${role.toLowerCase()})` : value;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Side by side (handoff 3a): category labels in a fixed first column, one
 * column per customer, best on the left in teal and painful on the right in
 * rust. Each cell sums up a category; tapping it opens that category's chips
 * below the grid to edit. Wide grids scroll sideways in their own box.
 */
export function Grid({
  customers,
  onChange,
}: {
  customers: DraftCustomer[];
  onChange: (id: string, profile: CustomerProfile) => void;
}) {
  const { grid } = lineCheck;
  const [editing, setEditing] = useState<{ id: string; category: CategoryKey } | null>(null);
  const editCustomer = editing ? customers.find((c) => c.id === editing.id) : undefined;

  return (
    <>
      <div className="lc-grid" role="region" aria-label={lineCheck.grid.headline} tabIndex={0}>
        <table>
          <thead>
            <tr>
              <td className="lc-grid__corner" />
              {customers.map((c) => (
                <th key={c.id} scope="col">
                  <span className={`lc-grid__head lc-grid__head--${c.type}`}>{c.nickname}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(({ key }) => (
              <tr key={key}>
                <th scope="row" className="lc-grid__label">
                  {grid.rows[key]}
                </th>
                {customers.map((c) => {
                  const text = summary(c, key);
                  const on = editing?.id === c.id && editing.category === key;
                  return (
                    <td key={c.id}>
                      <button
                        type="button"
                        className={[
                          "lc-grid__cell",
                          `lc-grid__cell--${c.type}`,
                          !text && "lc-grid__cell--empty",
                          on && "lc-grid__cell--on",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-expanded={on}
                        aria-label={`${fill(lineCheck.review.editLabel, { field: grid.rows[key] })}, ${c.nickname}: ${text || grid.empty}`}
                        onClick={() => setEditing(on ? null : { id: c.id, category: key })}
                      >
                        {text || grid.empty}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && editCustomer && (
        <div className="lc-grid__editor">
          <CategoryCard
            category={editing.category}
            profile={editCustomer}
            tone={editCustomer.type}
            title={fill(grid.editing, {
              nickname: editCustomer.nickname,
              category: lineCheck.categories[editing.category],
            })}
            onChange={(profile) => onChange(editCustomer.id, profile)}
          />
          <button type="button" className="lc-btn lc-btn--ghost" onClick={() => setEditing(null)}>
            {grid.done}
          </button>
        </div>
      )}
    </>
  );
}
