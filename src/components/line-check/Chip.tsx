"use client";

import { useEffect, useRef, useState } from "react";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import type { Field } from "@/lib/line-check/types";

const LONG_PRESS_MS = 500;

/**
 * One extracted value as an editable chip (handoff: "Chips"). Tap to edit in
 * place: Enter or leaving the field saves, Escape cancels, clearing it empties
 * the value. Long-press shows the evidence phrase it came from. An empty
 * value is a dashed "Field: not mentioned" chip ("unknown" after "I don't
 * know"). Buyer chips carry a role prefix (SIGNED, PUSHED, USES).
 */
export function Chip({
  field,
  label,
  role,
  onChange,
  tone = "best",
}: {
  field: Field;
  label: string;
  role?: string;
  onChange: (next: Field) => void;
  tone?: "best" | "painful";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [showEvidence, setShowEvidence] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const { review } = lineCheck;
  const editLabel = fill(review.editLabel, { field: label });

  useEffect(() => {
    if (!showEvidence) return;
    const t = window.setTimeout(() => setShowEvidence(false), 3500);
    return () => window.clearTimeout(t);
  }, [showEvidence]);

  const clearPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const commit = () => {
    const value = draft.trim() || null;
    if (value !== field.value) onChange(value ? { value, evidence: null } : { value: null });
    setEditing(false);
  };

  if (editing) {
    return (
      <span className={`lc-chip lc-chip--${tone} lc-chip--editing`}>
        {role && <span className="lc-chip__role">{role}</span>}
        <input
          className="lc-chip__input"
          aria-label={editLabel}
          autoFocus
          value={draft}
          maxLength={200}
          size={Math.max(8, Math.min(28, draft.length + 1))}
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
      </span>
    );
  }

  const empty = !field.value;
  const emptyText = role
    ? field.unknown
      ? review.unknownShort
      : review.notMentionedShort
    : fill(field.unknown ? review.unknown : review.notMentioned, { field: label });
  const text = field.value ?? emptyText;
  return (
    <span className="lc-chip-wrap">
      <button
        type="button"
        className={["lc-chip", `lc-chip--${tone}`, empty && "lc-chip--empty"].filter(Boolean).join(" ")}
        aria-label={`${editLabel}: ${text}`}
        title={field.evidence ? fill(review.evidence, { evidence: field.evidence }) : undefined}
        onPointerDown={() => {
          longPressed.current = false;
          if (!field.evidence) return;
          clearPress();
          pressTimer.current = window.setTimeout(() => {
            longPressed.current = true;
            setShowEvidence(true);
          }, LONG_PRESS_MS);
        }}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onPointerCancel={clearPress}
        onContextMenu={(e) => field.evidence && e.preventDefault()}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          setShowEvidence(false);
          setDraft(field.value ?? "");
          setEditing(true);
        }}
      >
        {role && <span className="lc-chip__role">{role}</span>}
        {text}
      </button>
      {showEvidence && field.evidence && (
        <span className="lc-evidence" role="status">
          {fill(review.evidence, { evidence: field.evidence })}
        </span>
      )}
    </span>
  );
}
