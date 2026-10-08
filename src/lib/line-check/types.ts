/**
 * Line Check: the data model (build brief, section 5).
 *
 * Every customer, best or painful, is described against the same five
 * categories. Values are free text from extraction, editable by the user.
 * Shared by the client and the two API routes.
 */

export type CustomerType = "best" | "painful";

export interface Field {
  value: string | null; // null = not mentioned / unknown
  evidence?: string | null; // short phrase from the transcript that supports it
  unknown?: boolean; // the founder answered a follow-up with "I don't know"
}

export interface CustomerProfile {
  company: { industry: Field; size: Field; geography: Field; ownership: Field };
  situation: { trigger: Field };
  buyer: { signer: Field; champion: Field; users: Field };
  before: { previousSolution: Field };
  economics: { salesCycle: Field; discounting: Field; retention: Field; expansion: Field; referred: Field };
}

export interface Customer extends CustomerProfile {
  id: string;
  type: CustomerType;
  nickname: string;
  transcript: string;
}

export type CategoryKey = keyof CustomerProfile;

/** The five categories and their fields, in display order. */
export const CATEGORIES = [
  { key: "company", fields: ["industry", "size", "geography", "ownership"] },
  { key: "situation", fields: ["trigger"] },
  { key: "buyer", fields: ["signer", "champion", "users"] },
  { key: "before", fields: ["previousSolution"] },
  { key: "economics", fields: ["salesCycle", "discounting", "retention", "expansion", "referred"] },
] as const satisfies readonly { key: CategoryKey; fields: readonly string[] }[];

export type FieldKey = (typeof CATEGORIES)[number]["fields"][number];

/** "category.field", e.g. "situation.trigger". Used to aim a follow-up at one field. */
export type FieldPath = {
  [C in (typeof CATEGORIES)[number] as C["key"]]: `${C["key"]}.${C["fields"][number]}`;
}[CategoryKey];

export const FIELD_PATHS: FieldPath[] = CATEGORIES.flatMap((c) =>
  c.fields.map((f) => `${c.key}.${f}` as FieldPath),
);

export interface FollowUp {
  field: FieldPath;
  question: string;
}

export function getField(profile: CustomerProfile, path: FieldPath): Field {
  const [category, field] = path.split(".") as [CategoryKey, string];
  return (profile[category] as Record<string, Field>)[field];
}

export function withField<T extends CustomerProfile>(profile: T, path: FieldPath, next: Field): T {
  const [category, field] = path.split(".") as [CategoryKey, string];
  return { ...profile, [category]: { ...profile[category], [field]: next } };
}

export function emptyProfile(): CustomerProfile {
  const empty = (): Field => ({ value: null });
  return {
    company: { industry: empty(), size: empty(), geography: empty(), ownership: empty() },
    situation: { trigger: empty() },
    buyer: { signer: empty(), champion: empty(), users: empty() },
    before: { previousSolution: empty() },
    economics: {
      salesCycle: empty(),
      discounting: empty(),
      retention: empty(),
      expansion: empty(),
      referred: empty(),
    },
  };
}

/** Only the five categories of a customer: what the model sees and returns. */
export function profileOf(customer: CustomerProfile): CustomerProfile {
  return {
    company: customer.company,
    situation: customer.situation,
    buyer: customer.buyer,
    before: customer.before,
    economics: customer.economics,
  };
}

/* Synthesis (section 7b) ------------------------------------------------ */

export interface RubricLevel {
  label: string;
  points: number;
}

export interface RubricCriterion {
  name: string;
  category: CategoryKey;
  weight: number; // all weights sum to 100
  why: string;
  levels: RubricLevel[]; // 2 to 4, top = weight, lowest = 0
}

export interface Rubric {
  criteria: RubricCriterion[]; // exactly 5
}

export interface Synthesis {
  profile: string;
  shared: string[];
  avoid: string[];
  confidence: "low" | "medium";
  rubric: Rubric;
}

/* API shapes --------------------------------------------------------------- */

export interface ExtractRequest {
  nickname: string;
  type: CustomerType;
  transcript: string;
  existing?: CustomerProfile; // passed when merging a follow-up answer
  question?: string; // the follow-up question being answered
}

export interface ExtractResponse {
  profile: CustomerProfile;
  followUps: FollowUp[];
}

export interface SynthesizeRequest {
  customers: Customer[];
}

export interface SynthesizeResponse {
  synthesis: Synthesis;
}

export interface ApiError {
  error: string;
}
