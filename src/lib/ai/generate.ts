import Anthropic from "@anthropic-ai/sdk";
import type {
  EvaluationInput,
  GeneratedReport,
  ScoreProfile,
  BeforeAfterPlanItem,
  LessonPlan,
  CoordinatorSummary,
  SyllabusExamAlignment,
} from "@/lib/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import {
  computeConfidence,
  selectRecipes,
  buildBeforeAfterPlan,
  buildSyllabusExamAlignment,
  buildLessonPlan,
  buildCoordinatorSummary,
  buildTeacherEvaluationSummary,
} from "@/lib/report/sections";

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

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function normalizeBeforeAfter(raw: any): BeforeAfterPlanItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw.map((b: any) => ({
    originalStage: asString(b?.originalStage),
    identifiedIssue: asString(b?.identifiedIssue),
    evidence: asString(b?.evidence),
    category: asString(b?.category),
    adaptedStage: asString(b?.adaptedStage),
    adaptationAction: asString(b?.adaptationAction),
    timeRequired: asString(b?.timeRequired),
    rationale: asString(b?.rationale),
    expectedBenefit: asString(b?.expectedBenefit),
  }));
  return items.length ? items : undefined;
}

function normalizeSyllabus(raw: any): SyllabusExamAlignment | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    supportedOutcomes: asStringArray(raw.supportedOutcomes),
    weaklySupportedOutcomes: asStringArray(raw.weaklySupportedOutcomes),
    missingExamPreparation: asStringArray(raw.missingExamPreparation),
    recommendedExamAlignedAdaptations: asStringArray(
      raw.recommendedExamAlignedAdaptations,
    ),
    recommendedFinalOutputTask: raw.recommendedFinalOutputTask
      ? asString(raw.recommendedFinalOutputTask)
      : undefined,
  };
}

function normalizeLessonPlan(raw: any): LessonPlan | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const stages = Array.isArray(raw.stages)
    ? raw.stages.map((s: any) => ({
        stage: asString(s?.stage),
        time: asString(s?.time),
        aim: asString(s?.aim),
        teacherAction: asString(s?.teacherAction),
        studentAction: asString(s?.studentAction),
        interaction: asString(s?.interaction),
        materials: asString(s?.materials),
        notes: asString(s?.notes),
      }))
    : [];
  if (!stages.length) return undefined;
  return {
    title: asString(raw.title),
    level: asString(raw.level),
    classProfile: asString(raw.classProfile),
    lessonLength: asString(raw.lessonLength),
    mainAim: asString(raw.mainAim),
    subsidiaryAims: asStringArray(raw.subsidiaryAims),
    materials: asStringArray(raw.materials),
    stages,
    assessmentLink: asString(raw.assessmentLink),
    homeworkExtension: asString(raw.homeworkExtension),
  };
}

function normalizeCoordinator(raw: any): CoordinatorSummary | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    summary: asString(raw.summary),
    mainStrengths: asStringArray(raw.mainStrengths),
    mainConcerns: asStringArray(raw.mainConcerns),
    requiredAdaptations: asStringArray(raw.requiredAdaptations),
    examAlignmentJudgment: asString(raw.examAlignmentJudgment),
    recommendation: asString(raw.recommendation),
  };
}

/** Coerce arbitrary parsed JSON into a GeneratedReport, attaching the computed score profile. */
function normalizeReport(
  raw: any,
  input: EvaluationInput,
  profile: ScoreProfile,
): GeneratedReport {
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
  const confidence = computeConfidence(input, profile);
  const recipes = selectRecipes(input, profile);

  // AI sections, backfilled with deterministic builders when the model omits them.
  const beforeAfterPlan =
    normalizeBeforeAfter(raw?.beforeAfterPlan) ?? buildBeforeAfterPlan(input, profile);
  const syllabusExamAlignment =
    normalizeSyllabus(raw?.syllabusExamAlignment) ??
    buildSyllabusExamAlignment(input, profile);
  const lessonPlan =
    normalizeLessonPlan(raw?.lessonPlan) ??
    buildLessonPlan(input, profile, supplementaryTasks);
  const coordinatorSummary =
    normalizeCoordinator(raw?.coordinatorSummary) ??
    buildCoordinatorSummary(input, profile);

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

    // v0.3 sections
    teacherEvaluationSummary:
      asString(raw?.teacherEvaluationSummary) ||
      buildTeacherEvaluationSummary(input, profile),
    aiSupportedInterpretation: asString(raw?.aiSupportedInterpretation),
    confidenceLevel: confidence.level,
    confidenceSummary: asString(raw?.confidenceSummary) || confidence.summary,
    beforeAfterPlan,
    syllabusExamAlignment,
    adaptationRecipesUsed: recipes.map((r) => ({ id: r.id, title: r.title })),
    lessonPlan,
    coordinatorSummary,
    mode: input.mode ?? "full",
    problemTags: input.problemTags ?? [],
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
  const report = normalizeReport(raw, input, profile);

  if (report.categoryFeedback.length === 0 || report.supplementaryTasks.length < 1) {
    throw new Error("AI report was incomplete.");
  }
  return report;
}
