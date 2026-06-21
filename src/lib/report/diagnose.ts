import type { EvaluationInput, GeneratedReport, SupplementaryTask } from "@/lib/types";
import { computeScoreProfile } from "@/lib/scoring/score";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { ADAPTATION_RECIPES, recipesForProblemTags } from "@/lib/adaptation/recipes";
import { computeConfidence } from "@/lib/report/sections";

// Problem-first ("diagnose") generator: fast, recipe-driven, no ratings required.

function oneTask(input: EvaluationInput): SupplementaryTask {
  const topic = input.unit.unitTopic || input.unit.unitTitle || "the unit topic";
  const level = input.context.learnerLevel || "the target level";
  return {
    title: `Quick communicative extension: ${topic}`,
    aim: `Give learners a fast, meaningful reason to use language about ${topic}.`,
    level,
    time: "10–15 minutes",
    interaction: "Pairs → groups",
    materials: "A short prompt you write (no coursebook text).",
    procedure: [
      "Pre-teach 3–4 key words from the unit.",
      "Pairs complete a quick decision or ranking task on the topic.",
      "Regroup to compare and justify; take brief feedback.",
    ],
    differentiation: "Provide sentence starters for weaker learners.",
    teacherNotes: "Keep the outcome concrete so the talk has a purpose.",
  };
}

export function generateDiagnoseReport(input: EvaluationInput): GeneratedReport {
  const profile = computeScoreProfile(COURSEMAP_CORE, input.ratings);
  const problems = input.problemTags ?? [];
  const matched = recipesForProblemTags(problems);
  const recipes = matched.length ? matched : ADAPTATION_RECIPES.slice(0, 4);

  const noPrep = recipes.filter((r) => r.prepLevel === "No prep").slice(0, 3);
  const lowPrep = recipes.filter((r) => r.prepLevel === "Low prep").slice(0, 2);

  const diagnosis =
    problems.length > 0
      ? `You flagged ${problems.length} issue${problems.length === 1 ? "" : "s"}: ${problems.join(", ")}. Based on these, the unit most likely needs targeted, low-effort adaptation rather than replacement. The suggestions below are quick wins you can apply in the next lesson.`
      : "Select one or more problems to receive a focused diagnosis.";

  const likelyCauses = problems.map((p) => {
    const r = recipesForProblemTags([p])[0];
    return r
      ? `"${p}" often comes from a stage that does not address it; consider "${r.title}".`
      : `"${p}" — review the relevant stage of the unit.`;
  });

  const quickPlan = recipes
    .slice(0, 5)
    .map((r) => `${r.title} (${r.prepLevel}, ${r.timeNeeded}): ${r.whenToUse}`);

  const confidence = computeConfidence(input, profile);

  return {
    overview: diagnosis,
    contextFitJudgment:
      "This is a problem-first diagnosis based on the issues you selected, not a full evaluation. For a documented score profile, run a full evaluation.",
    overallStrengths: [],
    mainWeaknesses: problems.length ? problems : ["No problems selected."],
    categoryFeedback: [],
    adaptationPlan: {
      keep: ["Keep the parts of the unit that already work for your learners."],
      cut: [],
      simplify: [],
      supplement: quickPlan,
      reorder: [],
    },
    supplementaryTasks: [oneTask(input)],
    implementationNotes: [
      ...noPrep.map((r) => `No prep: ${r.title} — ${r.procedure[0]}`),
      ...lowPrep.map((r) => `Low prep: ${r.title} — ${r.procedure[0]}`),
    ],
    limitations: [
      "Problem-first mode is a fast diagnosis, not a full literature-grounded evaluation.",
      "Suggestions are original adaptation moves; review before classroom use.",
      "Run a full evaluation for a documented score profile and coordinator summary.",
    ],
    scoreProfile: profile,
    generatedBy: "fallback",
    teacherEvaluationSummary: `Problem-first entry: ${problems.join(", ") || "none"}.`,
    aiSupportedInterpretation:
      likelyCauses.length > 0
        ? `Likely causes: ${likelyCauses.join(" ")}`
        : "Add problems for likely causes.",
    confidenceLevel: confidence.level,
    confidenceSummary:
      "Problem-first mode interprets your selected problems cautiously; add a unit summary and evidence for a stronger report.",
    beforeAfterPlan: recipes.slice(0, 3).map((r) => ({
      originalStage: "Current stage related to the flagged problem.",
      identifiedIssue: r.whenToUse,
      evidence: input.unit.unitText
        ? "Based on your unit summary."
        : "Based on the selected problem.",
      category: r.relatedCategories[0] ?? "Adaptation",
      adaptedStage: r.title,
      adaptationAction: r.procedure[0],
      timeRequired: r.timeNeeded,
      rationale: "Addresses a problem you selected.",
      expectedBenefit: "A more communicative, better-fitting lesson.",
    })),
    adaptationRecipesUsed: recipes.map((r) => ({ id: r.id, title: r.title })),
    mode: "diagnose",
    problemTags: problems,
  };
}
