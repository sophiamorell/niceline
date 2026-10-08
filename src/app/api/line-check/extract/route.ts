import { EXTRACT_SYSTEM } from "@/lib/line-check/prompts";
import {
  ExtractOutputSchema,
  ExtractRequestSchema,
  FRIENDLY_ERROR,
  callJson,
  clientIp,
  completeProfile,
  json,
  rateLimited,
} from "@/lib/line-check/server";
import {
  FIELD_PATHS,
  getField,
  withField,
  type CustomerProfile,
  type ExtractResponse,
  type FollowUp,
} from "@/lib/line-check/types";

/**
 * POST /api/line-check/extract (build brief, section 7a)
 *
 * In:  { nickname, type, transcript, existing?, question? }
 * Out: { profile, followUps }  (followUps: at most 2, only for empty fields)
 *
 * With `existing` (a follow-up answer), the answer is extracted on its own
 * and merged in: any value it states replaces the old one; everything else
 * is kept. No new follow-ups come back from a merge.
 */
export async function POST(req: Request): Promise<Response> {
  if (rateLimited(clientIp(req))) {
    return json({ error: "That's a lot of requests. Give it a few minutes and try again." }, 429);
  }

  const parsed = ExtractRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: FRIENDLY_ERROR }, 400);
  const { nickname, type, transcript, question } = parsed.data;
  const existing = parsed.data.existing as CustomerProfile | undefined;

  const user = [
    `Customer nickname: ${nickname}`,
    `The founder describes this as one of their ${type === "best" ? "best" : "most painful"} customers.`,
    question ? `Follow-up question: ${question}\nFounder's answer:\n${transcript}` : `Transcript:\n${transcript}`,
  ].join("\n\n");

  try {
    const out = await callJson("extract", EXTRACT_SYSTEM, user, ExtractOutputSchema, "low");
    const fresh = completeProfile(out.profile);

    if (existing) {
      let merged = existing;
      for (const path of FIELD_PATHS) {
        const next = getField(fresh, path);
        if (next.value) merged = withField(merged, path, next);
      }
      return json({ profile: merged, followUps: [] } satisfies ExtractResponse);
    }

    const seen = new Set<string>();
    const followUps: FollowUp[] = out.followUps
      .filter((f) => !getField(fresh, f.field as FollowUp["field"]).value && f.question.trim())
      .filter((f) => !seen.has(f.field) && seen.add(f.field))
      .slice(0, 2)
      .map((f) => ({ field: f.field as FollowUp["field"], question: f.question.trim() }));

    return json({ profile: fresh, followUps } satisfies ExtractResponse);
  } catch {
    return json({ error: FRIENDLY_ERROR }, 502);
  }
}
