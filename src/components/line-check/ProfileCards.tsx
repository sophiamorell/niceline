"use client";

import { lineCheck } from "@/content-line-check";
import { Chip } from "@/components/line-check/Chip";
import {
  CATEGORIES,
  getField,
  withField,
  type CustomerProfile,
  type CustomerType,
  type FieldPath,
} from "@/lib/line-check/types";

/** The five category cards for one customer, every value an editable chip. */
export function ProfileCards({
  profile,
  tone,
  onChange,
}: {
  profile: CustomerProfile;
  tone: CustomerType;
  onChange: (next: CustomerProfile) => void;
}) {
  return (
    <div className="lc-cards">
      {CATEGORIES.map((category) => (
        <section key={category.key} className={`lc-card lc-card--${tone}`}>
          <h3 className="lc-card__title">{lineCheck.categories[category.key]}</h3>
          <dl className="lc-card__fields">
            {category.fields.map((f) => {
              const path = `${category.key}.${f}` as FieldPath;
              const label = lineCheck.fields[f];
              return (
                <div key={f} className="lc-card__row">
                  <dt>{label}</dt>
                  <dd>
                    <Chip
                      field={getField(profile, path)}
                      label={label}
                      tone={tone}
                      onChange={(next) => onChange(withField(profile, path, next))}
                    />
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
