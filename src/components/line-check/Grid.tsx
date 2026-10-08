"use client";

import { Fragment } from "react";
import { lineCheck } from "@/content-line-check";
import { Chip } from "@/components/line-check/Chip";
import type { DraftCustomer } from "@/lib/line-check/state";
import { CATEGORIES, getField, withField, type CustomerProfile, type FieldPath } from "@/lib/line-check/types";

/**
 * Side by side: rows are the five categories (and their fields), columns are
 * customers, best on the left in sea glass and painful on the right in pink.
 * Wide grids scroll sideways inside their own box, never the page.
 */
export function Grid({
  customers,
  onChange,
}: {
  customers: DraftCustomer[];
  onChange: (id: string, profile: CustomerProfile) => void;
}) {
  const { grid } = lineCheck;
  return (
    <div className="lc-grid" role="region" aria-label={grid.headline} tabIndex={0}>
      <table>
        <thead>
          <tr>
            <td />
            {customers.map((c) => (
              <th key={c.id} scope="col" className={`lc-grid__head lc-grid__head--${c.type}`}>
                <span className="lc-grid__type">{c.type === "best" ? grid.best : grid.painful}</span>
                {c.nickname}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((category) => (
            <Fragment key={category.key}>
              <tr className="lc-grid__category">
                <th scope="rowgroup" colSpan={customers.length + 1}>
                  {lineCheck.categories[category.key]}
                </th>
              </tr>
              {category.fields.map((f) => {
                const path = `${category.key}.${f}` as FieldPath;
                const label = lineCheck.fields[f];
                return (
                  <tr key={f}>
                    <th scope="row" className="lc-grid__label">
                      {label}
                    </th>
                    {customers.map((c) => (
                      <td key={c.id}>
                        <Chip
                          field={getField(c, path)}
                          label={`${label}, ${c.nickname}`}
                          tone={c.type}
                          onChange={(next) => onChange(c.id, withField(c, path, next))}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
