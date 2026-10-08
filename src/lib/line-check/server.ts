import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod/v4";
import {
  CATEGORIES,
  FIELD_PATHS,
  emptyProfile,
  type CategoryKey,
  type CustomerProfile,
  type Rubric,
  type RubricCriterion,
} from "@/lib/line-check/types";

/**
 * Line Check: shared server pieces for the two API routes (build brief,
 * section 7). The API key stays here (ANTHROPIC_API_KEY); nothing in this
 * file is bundled for the browser.
 *
 * Logging: call counts and error kinds only. Never a transcript.
 */

const DEFAULT_MODEL = "claude-sonnet-5-5";
export const model = () => process.env.ICP_MODEL || DEFAULT_MODEL;

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1, timeout: 50_000 });
  return client;
}

export const FRIENDLY_ERROR = "Something went wrong reading that. Try again, or edit the fields by hand.";

/* Schemas ------------------------------------------------------------------ */

const FieldSchema = z.object({ value: z.string().nullable(), evidence: z.string().nullable() });

const profileShape = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, z.object(Object.fromEntries(c.fields.map((f) => [f, FieldSchema])))]),
) as Record<CategoryKey, z.ZodObject<Record<string, typeof FieldSchema>>>;

export const ProfileSchema = z.object(profileShape);

const FieldPathSchema = z.enum(FIELD_PATHS as [string, ...string[]]);

export const ExtractOutputSchema = z.object({
  profile: ProfileSchema,
  followUps: z.array(z.object({ field: FieldPathSchema, question: z.string() })),
});

const CategorySchema = z.enum(CATEGORIES.map((c) => c.key) as [CategoryKey, ...CategoryKey[]]);

export const SynthesisSchema = z.object({
  profile: z.string(),
  shared: z.array(z.string()),
  avoid: z.array(z.string()),
  confidence: z.enum(["low", "medium"]),
  rubric: z.object({
    criteria: z.array(
      z.object({
        name: z.string(),
        category: CategorySchema,
        weight: z.number(),
        why: z.string(),
        levels: z.array(z.object({ label: z.string(), points: z.number() })),
      }),
    ),
  }),
});

/* Request bodies: what the browser may send. Loose on Field extras. */

const InputField = z.object({
  value: z.string().max(400).nullable(),
  evidence: z.string().max(400).nullish(),
  unknown: z.boolean().optional(),
});
const InputProfile = z.object(
  Object.fromEntries(
    CATEGORIES.map((c) => [c.key, z.object(Object.fromEntries(c.fields.map((f) => [f, InputField])))]),
  ) as Record<CategoryKey, z.ZodObject<Record<string, typeof InputField>>>,
);

export const ExtractRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(120),
  type: z.enum(["best", "painful"]),
  transcript: z.string().trim().min(1).max(12_000),
  existing: InputProfile.optional(),
  question: z.string().max(400).optional(),
});

export const SynthesizeRequestSchema = z.object({
  customers: z
    .array(
      InputProfile.extend({
        id: z.string().max(80),
        type: z.enum(["best", "painful"]),
        nickname: z.string().max(120),
        transcript: z.string().max(20_000),
      }),
    )
    .min(2)
    .max(5),
});

/* Rate limit: per IP, 30 calls an hour, shared by both routes. In memory, so
   it's per server instance: enough to stop a loop or a casual abuser from
   draining the key, not a hard guarantee. */

const LIMIT = 30;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return false;
}

/* Calling the model -------------------------------------------------------- */

let calls = 0;

/**
 * One structured-output call, retried once if the reply doesn't parse or
 * fails validation. Throws on a second failure, an API error, or a refusal.
 */
export async function callJson<T>(
  route: string,
  system: string,
  user: string,
  schema: z.ZodType<T>,
  effort: "low" | "medium",
  check: (value: T) => T = (v) => v,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    calls += 1;
    console.log(`[line-check] ${route} call ${calls}${attempt > 0 ? " (retry)" : ""}`);
    try {
      const response = await anthropic().messages.parse({
        model: model(),
        max_tokens: 16000,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: user }],
        output_config: { effort, format: zodOutputFormat(schema) },
      });
      if (response.stop_reason === "refusal") throw new Error("refusal");
      if (response.stop_reason === "max_tokens") throw new Error("max_tokens");
      if (response.parsed_output === null) throw new Error("unparsed");
      return check(scrubDashes(response.parsed_output) as T);
    } catch (error) {
      lastError = error;
      // API errors (auth, rate limit, overload) already had the SDK's retry.
      if (error instanceof Anthropic.APIError) break;
    }
  }
  const kind =
    lastError instanceof Anthropic.APIError
      ? `api ${lastError.status}`
      : lastError instanceof Error
        ? lastError.message.slice(0, 80)
        : "unknown";
  console.error(`[line-check] ${route} failed: ${kind}`);
  throw lastError;
}

/** Safety net for "no em dashes anywhere": replace them in every string. */
export function scrubDashes<T>(value: T): T {
  if (typeof value === "string") {
    return value
      .replace(/\s*[—―]\s*/g, ", ")
      .replace(/\s+–\s+/g, ", ")
      .replace(/–/g, "-") as T;
  }
  if (Array.isArray(value)) return value.map(scrubDashes) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubDashes(v)])) as T;
  }
  return value;
}

/** A model profile with every field present (missing ones become null). */
export function completeProfile(raw: z.infer<typeof ProfileSchema>): CustomerProfile {
  const out = emptyProfile();
  for (const c of CATEGORIES) {
    for (const f of c.fields) {
      const field = raw[c.key]?.[f];
      const value = field?.value?.trim() || null;
      (out[c.key] as Record<string, { value: string | null; evidence?: string | null }>)[f] = {
        value,
        evidence: value ? field?.evidence?.trim() || null : null,
      };
    }
  }
  return out;
}

/**
 * Enforce the rubric's arithmetic whatever the model returned: exactly five
 * criteria, whole-number weights summing to 100, two to four levels ordered
 * best first, top level = weight, lowest = 0, points never rising.
 */
export function normalizeRubric(rubric: Rubric): Rubric {
  const criteria = rubric.criteria.filter((c) => c.name.trim() && c.levels.length >= 2).slice(0, 5);
  if (criteria.length !== 5) throw new Error("rubric needs 5 criteria");

  const raw = criteria.map((c) => Math.max(1, Number.isFinite(c.weight) ? c.weight : 1));
  const total = raw.reduce((a, b) => a + b, 0);
  const exact = raw.map((w) => (w / total) * 100);
  const weights = exact.map(Math.floor);
  let short = 100 - weights.reduce((a, b) => a + b, 0);
  const byRemainder = exact.map((w, i) => ({ i, r: w - Math.floor(w) })).sort((a, b) => b.r - a.r);
  for (const { i } of byRemainder) {
    if (short <= 0) break;
    weights[i] += 1;
    short -= 1;
  }

  return {
    criteria: criteria.map((c, i): RubricCriterion => {
      const weight = weights[i];
      const levels = [...c.levels].sort((a, b) => b.points - a.points).slice(0, 4);
      const top = levels[0].points;
      const scaled = levels.map((level, j) => {
        if (j === 0) return { label: level.label, points: weight };
        if (j === levels.length - 1) return { label: level.label, points: 0 };
        const share = top > 0 ? level.points / top : (levels.length - 1 - j) / (levels.length - 1);
        return { label: level.label, points: Math.round(Math.min(1, Math.max(0, share)) * weight) };
      });
      for (let j = 1; j < scaled.length; j++) {
        scaled[j].points = Math.min(scaled[j].points, scaled[j - 1].points);
      }
      return { name: c.name, category: c.category, weight, why: c.why, levels: scaled };
    }),
  };
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
