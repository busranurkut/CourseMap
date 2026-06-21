import type { Evaluation } from "@prisma/client";
import type {
  EvaluationInput,
  GeneratedReport,
  RatingsByCategory,
  EvidenceItem,
  EvaluationMode,
} from "@/lib/types";
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
      classSize: e.classSize ?? "",
      availableLessonTime: e.availableLessonTime ?? "",
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
    mode: (e.mode as EvaluationMode) ?? "full",
    problemTags: safeParse<string[]>(e.problemTagsJson, []),
    syllabusExam: {
      courseOutcomes: e.syllabusOutcomes ?? "",
      weeklySyllabusGoals: "",
      examType: "",
      examFormats: safeParse<string[]>(e.examFormatsJson, []),
      cefrDescriptors: e.cefrDescriptorsJson ?? "",
      institutionPriorities: "",
    },
    evidenceBank: safeParse<EvidenceItem[]>(e.evidenceBankJson, []),
    teacherFinalDecision: e.teacherFinalDecision ?? "",
    coordinatorRecommendation: e.coordinatorRecommendation ?? "",
  };
}

export function toReport(e: Evaluation): GeneratedReport | null {
  return safeParse<GeneratedReport | null>(e.reportJson, null);
}

/** Build the Prisma data object for create/update from validated input + report. */
export function toEvaluationData(
  values: EvaluationFormValues,
  input: EvaluationInput,
  report: GeneratedReport,
) {
  return {
    institutionType: values.institutionType,
    learnerLevel: values.learnerLevel,
    learnerProfile: values.learnerProfile,
    weeklyHours: values.weeklyHours,
    courseDuration: values.courseDuration,
    courseGoal: values.courseGoal,
    examAlignment: values.examAlignment,
    learnerNeeds: values.learnerNeeds,
    constraints: values.constraints,
    coursebookName: values.coursebookName,
    publisher: values.publisher,
    claimedLevel: values.claimedLevel,
    unitTitle: values.unitTitle,
    unitSkills: JSON.stringify(values.unitSkills),
    unitTopic: values.unitTopic,
    unitText: values.unitText,
    teacherNotes: values.teacherNotes,
    ratingsJson: JSON.stringify(input.ratings),
    reportJson: JSON.stringify(report),
    overallScore: report.scoreProfile.overallScore,
    generatedBy: report.generatedBy,
    // v0.3 fields
    mode: values.mode ?? "full",
    problemTagsJson: JSON.stringify(values.problemTags ?? []),
    classSize: values.classSize || null,
    availableLessonTime: values.availableLessonTime || null,
    syllabusOutcomes: values.courseOutcomes || null,
    examFormatsJson: JSON.stringify(values.examFormats ?? []),
    cefrDescriptorsJson: values.cefrDescriptors || null,
    evidenceBankJson: JSON.stringify(values.evidenceBank ?? []),
    teacherFinalDecision: values.teacherFinalDecision || null,
    coordinatorRecommendation: values.coordinatorRecommendation || null,
  };
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
    mode: e.mode === "quick" || e.mode === "coordinator" ? e.mode : "full",
    problemTags: input.problemTags ?? [],
    classSize: input.context.classSize ?? "",
    availableLessonTime: input.context.availableLessonTime ?? "",
    courseOutcomes: input.syllabusExam?.courseOutcomes ?? "",
    weeklySyllabusGoals: input.syllabusExam?.weeklySyllabusGoals ?? "",
    examType: input.syllabusExam?.examType ?? "",
    examFormats: input.syllabusExam?.examFormats ?? [],
    cefrDescriptors: input.syllabusExam?.cefrDescriptors ?? "",
    institutionPriorities: input.syllabusExam?.institutionPriorities ?? "",
    evidenceBank: input.evidenceBank ?? [],
    teacherFinalDecision: input.teacherFinalDecision ?? "",
    coordinatorRecommendation: input.coordinatorRecommendation ?? "",
  };
}
