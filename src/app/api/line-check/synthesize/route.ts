import { SYNTHESIZE_SYSTEM } from "@/lib/line-check/prompts";
import {
  SynthesisSchema,
  SynthesizeRequestSchema,
  callJson,
  clientIp,
  json,
  normalizeRubric,
  rateLimited,
} from "@/lib/line-check/server";
import { profileOf, type CustomerProfile, type Field, type SynthesizeResponse } from "@/lib/line-check/types";

/**
 * POST /api/line-check/synthesize (build brief, section 7b)
 *
 * In:  { customers }  (2 to 5, best and painful)
 * Out: { synthesis }  (profile, shared, avoid, confidence, rubric)
 *
 * The rubric's arithmetic and the confidence level are enforced here, not
 * left to the model.
 */
export async function POST(req: Request): Promise<Response> {
  if (rateLimited(clientIp(req))) {
    return json({ error: "That's a lot of requests. Give it a few minutes and try again." }, 429);
  }

  const parsed = SynthesizeRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Something went wrong finding the pattern. Try again." }, 400);
  const { customers } = parsed.data;
  const best = customers.filter((c) => c.type === "best");
  const painful = customers.filter((c) => c.type === "painful");
  if (best.length < 2) return json({ error: "Add at least two best customers first." }, 400);

  // Values only: the model works from the founder's checked fields.
  const describe = (c: (typeof customers)[number]) => {
    const profile = profileOf(c as unknown as CustomerProfile);
    const values = Object.fromEntries(
      Object.entries(profile).map(([category, fields]) => [
        category,
        Object.fromEntries(Object.entries(fields as Record<string, Field>).map(([k, f]) => [k, f.value])),
      ]),
    );
    return { nickname: c.nickname, ...values };
  };

  const user = JSON.stringify(
    { bestCustomers: best.map(describe), painfulCustomers: painful.map(describe) },
    null,
    1,
  );

  try {
    const synthesis = await callJson("synthesize", SYNTHESIZE_SYSTEM, user, SynthesisSchema, "medium", (s) => ({
      ...s,
      rubric: normalizeRubric(s.rubric),
    }));
    const confidence: "low" | "medium" = customers.length <= 3 && painful.length === 0 ? "low" : "medium";
    return json({
      synthesis: {
        profile: synthesis.profile,
        shared: synthesis.shared.slice(0, 5),
        avoid: painful.length === 0 ? [] : synthesis.avoid.slice(0, 3),
        confidence,
        rubric: synthesis.rubric,
      },
    } satisfies SynthesizeResponse);
  } catch {
    return json({ error: "Something went wrong finding the pattern. Try again in a moment." }, 502);
  }
}
