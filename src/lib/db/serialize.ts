import type { Evaluation } from "@prisma/client";
import type { EvaluationInput, GeneratedReport, RatingsByCategory } from "@/lib/types";
import type { EvaluationFormValues } from "@/lib/validation";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";

/** Summary row for the history list. */
export interface EvaluationSummary {
  id: string;
  createdAt: string;
  coursebookName: string;
  unitTitle: string;
  learnerLevel: string;
  overallScore: number | null;
  generatedBy: string;
}

export function toSummary(e: Evaluation): EvaluationSummary {
  return {
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    coursebookName: e.coursebookName,
    unitTitle: e.unitTitle,
    learnerLevel: e.learnerLevel,
    overallScore: e.overallScore,
    generatedBy: e.generatedBy,
  };
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Reconstruct the EvaluationInput used to produce a stored evaluation. */
export function toInput(e: Evaluation): EvaluationInput {
  return {
    context: {
      institutionType: e.institutionType,
      learnerLevel: e.learnerLevel,
      learnerProfile: e.learnerProfile ?? "",
      weeklyHours: e.weeklyHours,
      courseDuration: e.courseDuration ?? "",
      courseGoal: e.courseGoal,
      examAlignment: e.examAlignment ?? "",
      learnerNeeds: e.learnerNeeds ?? "",
      constraints: e.constraints ?? "",
    },
    unit: {
      coursebookName: e.coursebookName,
      publisher: e.publisher ?? "",
      claimedLevel: e.claimedLevel ?? "",
      unitTitle: e.unitTitle,
      unitSkills: safeParse<string[]>(e.unitSkills, []),
      unitTopic: e.unitTopic ?? "",
      unitText: e.unitText ?? "",
      teacherNotes: e.teacherNotes ?? "",
    },
    ratings: safeParse<RatingsByCategory>(e.ratingsJson, {}),
  };
}

export function toReport(e: Evaluation): GeneratedReport | null {
  return safeParse<GeneratedReport | null>(e.reportJson, null);
}

/** Reconstruct complete form values (all framework categories present) for editing. */
export function toFormValues(e: Evaluation): EvaluationFormValues {
  const input = toInput(e);
  const ratings: EvaluationFormValues["ratings"] = {};
  for (const cat of COURSEMAP_CORE.categories) {
    const stored = input.ratings[cat.id];
    ratings[cat.id] = {
      categoryId: cat.id,
      ratings: stored?.ratings ?? {},
      evidenceNote: stored?.evidenceNote ?? "",
      adaptationNote: stored?.adaptationNote ?? "",
    };
  }
  return {
    institutionType: input.context.institutionType,
    learnerLevel: input.context.learnerLevel,
    learnerProfile: input.context.learnerProfile,
    weeklyHours: input.context.weeklyHours,
    courseDuration: input.context.courseDuration,
    courseGoal: input.context.courseGoal,
    examAlignment: input.context.examAlignment,
    learnerNeeds: input.context.learnerNeeds,
    constraints: input.context.constraints,
    coursebookName: input.unit.coursebookName,
    publisher: input.unit.publisher,
    claimedLevel: input.unit.claimedLevel,
    unitTitle: input.unit.unitTitle,
    unitSkills: input.unit.unitSkills,
    unitTopic: input.unit.unitTopic,
    unitText: input.unit.unitText,
    teacherNotes: input.unit.teacherNotes,
    ratings,
    useAI: e.generatedBy === "ai",
  };
}
