import type { EvaluationFormValues } from "@/lib/validation";
import type { EvaluationInput, RatingsByCategory, Rating } from "@/lib/types";

/** Normalize raw form values into a typed EvaluationInput. */
export function buildEvaluationInput(values: EvaluationFormValues): EvaluationInput {
  const ratings: RatingsByCategory = {};
  for (const [categoryId, cat] of Object.entries(values.ratings ?? {})) {
    const cleaned: Record<string, Rating> = {};
    for (const [critId, r] of Object.entries(cat.ratings ?? {})) {
      const n = Number(r);
      if (n >= 1 && n <= 5) cleaned[critId] = n as Rating;
    }
    ratings[categoryId] = {
      categoryId,
      ratings: cleaned,
      evidenceNote: cat.evidenceNote ?? "",
      adaptationNote: cat.adaptationNote ?? "",
    };
  }

  return {
    context: {
      institutionType: values.institutionType,
      learnerLevel: values.learnerLevel,
      learnerProfile: values.learnerProfile ?? "",
      weeklyHours: values.weeklyHours ?? null,
      courseDuration: values.courseDuration ?? "",
      courseGoal: values.courseGoal,
      examAlignment: values.examAlignment ?? "",
      learnerNeeds: values.learnerNeeds ?? "",
      constraints: values.constraints ?? "",
    },
    unit: {
      coursebookName: values.coursebookName,
      publisher: values.publisher ?? "",
      claimedLevel: values.claimedLevel ?? "",
      unitTitle: values.unitTitle,
      unitSkills: values.unitSkills ?? [],
      unitTopic: values.unitTopic ?? "",
      unitText: values.unitText ?? "",
      teacherNotes: values.teacherNotes ?? "",
    },
    ratings,
  };
}
