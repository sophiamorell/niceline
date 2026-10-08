"use client";

import { lineCheck } from "@/content-line-check";
import { Chip } from "@/components/line-check/Chip";
import {
  CATEGORIES,
  getField,
  withField,
  type CategoryKey,
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
        <CategoryCard key={category.key} category={category.key} profile={profile} tone={tone} onChange={onChange} />
      ))}
    </div>
  );
}

/** One category: its label and a wrap of chips. */
export function CategoryCard({
  category,
  profile,
  tone,
  onChange,
  title = lineCheck.categories[category],
}: {
  category: CategoryKey;
  profile: CustomerProfile;
  tone: CustomerType;
  onChange: (next: CustomerProfile) => void;
  title?: string;
}) {
  const fields = CATEGORIES.find((c) => c.key === category)?.fields ?? [];
  return (
    <section className="lc-card">
      <h3 className="lc-card__title">{title}</h3>
      <div className="lc-card__chips">
        {fields.map((f) => {
          const path = `${category}.${f}` as FieldPath;
          return (
            <Chip
              key={f}
              field={getField(profile, path)}
              label={lineCheck.fields[f]}
              role={category === "buyer" ? lineCheck.review.roles[f] : undefined}
              tone={tone}
              onChange={(next) => onChange(withField(profile, path, next))}
            />
          );
        })}
      </div>
    </section>
  );
}
