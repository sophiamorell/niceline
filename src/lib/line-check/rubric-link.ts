import type { CategoryKey, Rubric } from "@/lib/line-check/types";

/**
 * Line Check: the rubric in the URL hash, so "Copy link" opens a working
 * scorer for a teammate (build brief, section 8). Only the rubric goes in
 * the link, never customer data. Compact JSON, base64url.
 *
 *   /line-check#r=<base64url of [[name, category, why, [[label, points], ...]], ...]>
 */

const PREFIX = "r=";

type Packed = [string, CategoryKey, string, [string, number][]][];

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
}

export function encodeRubric(rubric: Rubric): string {
  const packed: Packed = rubric.criteria.map((c) => [
    c.name,
    c.category,
    c.why,
    c.levels.map((l) => [l.label, l.points] as [string, number]),
  ]);
  return PREFIX + toBase64Url(JSON.stringify(packed));
}

/** The rubric in a location hash, or null if there isn't a valid one. */
export function decodeRubric(hash: string): Rubric | null {
  const h = hash.replace(/^#/, "");
  if (!h.startsWith(PREFIX)) return null;
  try {
    const packed = JSON.parse(fromBase64Url(h.slice(PREFIX.length))) as Packed;
    if (!Array.isArray(packed) || packed.length === 0 || packed.length > 8) return null;
    const criteria = packed.map(([name, category, why, levels]) => {
      if (typeof name !== "string" || !Array.isArray(levels) || levels.length < 2) throw new Error("bad");
      const parsedLevels = levels.map(([label, points]) => {
        if (typeof label !== "string" || typeof points !== "number") throw new Error("bad");
        return { label, points };
      });
      return {
        name,
        category,
        why: typeof why === "string" ? why : "",
        weight: Math.max(...parsedLevels.map((l) => l.points)),
        levels: parsedLevels,
      };
    });
    return { criteria };
  } catch {
    return null;
  }
}

export function rubricUrl(rubric: Rubric): string {
  return `${window.location.origin}${window.location.pathname}#${encodeRubric(rubric)}`;
}
