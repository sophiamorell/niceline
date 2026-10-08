"use client";

import { useState } from "react";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import type { Field } from "@/lib/line-check/types";

/**
 * One extracted value as an editable chip. Tap to edit in place; Enter or
 * leaving the field saves, Escape cancels. An empty value shows as a dashed
 * "Not mentioned" chip (or "Unknown" after "I don't know"); clearing a value
 * empties it.
 */
export function Chip({
  field,
  label,
  onChange,
  tone = "best",
}: {
  field: Field;
  label: string;
  onChange: (next: Field) => void;
  tone?: "best" | "painful";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const { review } = lineCheck;
  const editLabel = fill(review.editLabel, { field: label });

  const commit = () => {
    const value = draft.trim() || null;
    if (value !== field.value) onChange(value ? { value, evidence: null } : { value: null });
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="lc-chip lc-chip--input"
        aria-label={editLabel}
        autoFocus
        value={draft}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
        }}
      />
    );
  }

  const empty = !field.value;
  return (
    <button
      type="button"
      className={["lc-chip", `lc-chip--${tone}`, empty && "lc-chip--empty"].filter(Boolean).join(" ")}
      aria-label={`${editLabel}: ${field.value ?? (field.unknown ? review.unknown : review.notMentioned)}`}
      title={field.evidence ? `"${field.evidence}"` : undefined}
      onClick={() => {
        setDraft(field.value ?? "");
        setEditing(true);
      }}
    >
      {field.value ?? (field.unknown ? review.unknown : review.notMentioned)}
    </button>
  );
}
