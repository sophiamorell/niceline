import { diagnostic, type DiagnosticQuestion, type DiagnosticVerdict } from "@/content";

/**
 * Scores the diagnostic in the browser, from diagnostic.scoring in content.ts:
 * Q1-Q8 score 0-2 each (Q5 by the emailable/total ratio), the three
 * lowest-scoring questions are the gaps (ties broken in gapTieBreak order),
 * and the total picks the verdict. Q9 (hiring intent) and Q10 (free text)
 * are not scored.
 */

export type Answers = Record<string, string>;

export interface DiagnosticResult {
  score: number;
  maxScore: number;
  gaps: DiagnosticQuestion[]; // the questions whose gap and freeFix to report, worst first
  verdict: DiagnosticVerdict;
}

const { questions, scoring } = diagnostic;

function toNumber(value: string | undefined): number {
  const n = Number((value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** A question's score from the answers so far; unanswered counts as 0. */
export function questionScore(question: DiagnosticQuestion, answers: Answers): number {
  if (question.kind === "twoNumbers") {
    const [totalField, emailableField] = question.fields ?? [];
    const total = toNumber(answers[`q${question.id}_${totalField?.id}`]);
    const emailable = toNumber(answers[`q${question.id}_${emailableField?.id}`]);
    const ratio = total > 0 ? emailable / total : 0;
    const band = scoring.q5RatioBands.find((b) => ratio < b.belowRatio);
    return band?.score ?? 0;
  }
  if (question.kind === "single") {
    const chosen = answers[`q${question.id}`];
    const option = (question.options ?? []).find((o) => o.id === chosen);
    return option?.score ?? 0;
  }
  return 0;
}

/** The best score a question can get; a full-marks answer is not a gap. */
export function maxQuestionScore(question: DiagnosticQuestion): number {
  if (question.kind === "twoNumbers") return Math.max(...scoring.q5RatioBands.map((b) => b.score));
  if (question.kind === "single") return Math.max(0, ...(question.options ?? []).map((o) => o.score ?? 0));
  return 0;
}

export function scoreDiagnostic(answers: Answers): DiagnosticResult {
  const scored = scoring.scoredQuestions
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is DiagnosticQuestion => q !== undefined);

  const score = scored.reduce((sum, q) => sum + questionScore(q, answers), 0);

  const rank = (q: DiagnosticQuestion) => {
    const i = scoring.gapTieBreak.indexOf(q.id);
    return i === -1 ? scoring.gapTieBreak.length : i;
  };
  const gaps = scored
    .filter((q) => questionScore(q, answers) < maxQuestionScore(q))
    .sort((a, b) => questionScore(a, answers) - questionScore(b, answers) || rank(a) - rank(b))
    .slice(0, scoring.gapsReported);

  const verdict =
    scoring.verdicts.find(
      (v) =>
        score >= v.minScore &&
        score <= v.maxScore &&
        (v.requires === undefined || Object.entries(v.requires).every(([name, value]) => answers[name] === value)),
    ) ?? scoring.verdicts[scoring.verdicts.length - 1];

  return { score, maxScore: scoring.maxScore, gaps, verdict };
}
