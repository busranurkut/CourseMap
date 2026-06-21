import Anthropic from "@anthropic-ai/sdk";
import type { EvaluationInput, GeneratedReport, ScoreProfile } from "@/lib/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";

const DEFAULT_MODEL = "claude-opus-4-8";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
}

/** Extract the first JSON object from a model response. */
function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  // Strip a ```json ... ``` fence if present.
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1)
    throw new Error("No JSON object found in model output.");
  return JSON.parse(candidate.slice(start, end + 1));
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

/** Coerce arbitrary parsed JSON into a GeneratedReport, attaching the computed score profile. */
function normalizeReport(raw: any, profile: ScoreProfile): GeneratedReport {
  const categoryFeedback = Array.isArray(raw?.categoryFeedback)
    ? raw.categoryFeedback.map((c: any) => ({
        category: String(c?.category ?? ""),
        score: Number(c?.score ?? 0) || 0,
        interpretation: String(c?.interpretation ?? ""),
        evidence: String(c?.evidence ?? ""),
        adaptationNeed: String(c?.adaptationNeed ?? ""),
        sourceAnchors: asStringArray(c?.sourceAnchors),
      }))
    : [];

  const supplementaryTasks = Array.isArray(raw?.supplementaryTasks)
    ? raw.supplementaryTasks.map((t: any) => ({
        title: String(t?.title ?? "Supplementary task"),
        aim: String(t?.aim ?? ""),
        level: String(t?.level ?? ""),
        time: String(t?.time ?? ""),
        interaction: t?.interaction ? String(t.interaction) : undefined,
        materials: String(t?.materials ?? ""),
        procedure: asStringArray(t?.procedure),
        differentiation: t?.differentiation ? String(t.differentiation) : undefined,
        teacherNotes: String(t?.teacherNotes ?? ""),
      }))
    : [];

  const ap = raw?.adaptationPlan ?? {};

  return {
    overview: String(raw?.overview ?? ""),
    contextFitJudgment: String(raw?.contextFitJudgment ?? ""),
    overallStrengths: asStringArray(raw?.overallStrengths),
    mainWeaknesses: asStringArray(raw?.mainWeaknesses),
    categoryFeedback,
    adaptationPlan: {
      keep: asStringArray(ap.keep),
      cut: asStringArray(ap.cut),
      simplify: asStringArray(ap.simplify),
      supplement: asStringArray(ap.supplement),
      reorder: asStringArray(ap.reorder),
    },
    supplementaryTasks,
    implementationNotes: asStringArray(raw?.implementationNotes),
    limitations: asStringArray(raw?.limitations),
    scoreProfile: profile,
    generatedBy: "ai",
  };
}

/**
 * Generate a report via the Anthropic API.
 * Throws if no key is set or the call/parsing fails — caller decides whether to fall back.
 */
export async function generateAIReport(
  input: EvaluationInput,
  profile: ScoreProfile,
): Promise<GeneratedReport> {
  if (!hasApiKey()) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input, profile) }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const raw = parseJsonObject(text);
  const report = normalizeReport(raw, profile);

  if (report.categoryFeedback.length === 0 || report.supplementaryTasks.length < 1) {
    throw new Error("AI report was incomplete.");
  }
  return report;
}
