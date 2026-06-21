import type {
  EvaluationInput,
  ScoreProfile,
  BeforeAfterPlanItem,
  SyllabusExamAlignment,
  LessonPlan,
  CoordinatorSummary,
  SupplementaryTask,
  ConfidenceLevel,
  AdaptationRecipe,
} from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { recipesForProblemTags, recipesForCategory } from "@/lib/adaptation/recipes";

// Deterministic builders for the v0.3 report sections. Shared by the template
// fallback generator and used to backfill any sections the AI omits.

const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  COURSEMAP_CORE.categories.map((c) => [c.id, c.name]),
);

function weakest(profile: ScoreProfile, n: number) {
  return [...profile.categoryScores]
    .filter((c) => c.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, n);
}

function strongest(profile: ScoreProfile, n: number) {
  return [...profile.categoryScores]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function hasAnyEvidence(input: EvaluationInput): boolean {
  const noteEvidence = Object.values(input.ratings).some((r) => r.evidenceNote?.trim());
  const bankEvidence = (input.evidenceBank?.length ?? 0) > 0;
  return noteEvidence || bankEvidence;
}

export function computeConfidence(
  input: EvaluationInput,
  profile: ScoreProfile,
): { level: ConfidenceLevel; summary: string } {
  const hasRatings = profile.overallScore > 0;
  const hasEvidence = hasAnyEvidence(input);
  const hasSummary = (input.unit.unitText?.trim().length ?? 0) >= 20;

  let level: ConfidenceLevel;
  if (hasRatings && hasEvidence && hasSummary) level = "High";
  else if (hasRatings && (hasEvidence || hasSummary)) level = "Medium";
  else level = "Low";

  const summary =
    level === "High"
      ? "High confidence: the interpretation is based on teacher ratings, evidence notes, and a unit summary."
      : level === "Medium"
        ? "Medium confidence: ratings are available with limited evidence. Add evidence notes to strengthen the interpretation."
        : "Low confidence: this is based on ratings only. The interpretation is intentionally cautious — add evidence notes and a unit summary for a stronger report.";

  return { level, summary };
}

/** Pick adaptation recipes from problem tags and the weakest categories. */
export function selectRecipes(
  input: EvaluationInput,
  profile: ScoreProfile,
): AdaptationRecipe[] {
  const byTag = recipesForProblemTags(input.problemTags ?? []);
  const byCategory = weakest(profile, 3).flatMap((c) => recipesForCategory(c.categoryId));
  const seen = new Set<string>();
  const out: AdaptationRecipe[] = [];
  for (const r of [...byTag, ...byCategory]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      out.push(r);
    }
    if (out.length >= 6) break;
  }
  return out;
}

const BEFORE_AFTER_TEMPLATES: Record<
  string,
  {
    originalStage: string;
    issue: string;
    adaptedStage: string;
    action: string;
    benefit: string;
  }
> = {
  "communicative-value": {
    originalStage: "Controlled practice after presentation.",
    issue: "Limited opportunity for meaningful, learner-generated communication.",
    adaptedStage: "Add a freer speaking / information-gap task.",
    action: "Insert a short communicative task with a concrete outcome.",
    benefit: "Improves meaningful communication and recycles unit language.",
  },
  "assessment-alignment": {
    originalStage: "Unit tasks not matched to the assessment format.",
    issue: "Learners are not prepared for the institution's exam tasks.",
    adaptedStage: "Add one exam-style output task.",
    action: "Add a task mirroring your exam (e.g., paragraph writing or interview).",
    benefit: "Builds exam-relevant skills without replacing the unit.",
  },
  "level-cognitive-load": {
    originalStage: "Dense input presented in one block.",
    issue: "Cognitive/vocabulary load may be too high for the level.",
    adaptedStage: "Chunk input and pre-teach key vocabulary.",
    action: "Split the input, gloss high-load items, add a gist task first.",
    benefit: "Reduces processing load and supports comprehension.",
  },
  "skills-balance": {
    originalStage: "One skill dominates the unit.",
    issue: "Skill balance does not match course priorities.",
    adaptedStage: "Add a bridging task into the priority skill.",
    action: "Link the existing input to a task in the under-served skill.",
    benefit: "Aligns time-on-skill with course aims.",
  },
  "text-quality": {
    originalStage: "Comprehension questions only after the text.",
    issue: "Follow-up stays at surface comprehension.",
    adaptedStage: "Add an inference or response task.",
    action: "Add 2–3 inference/opinion questions and a short discussion.",
    benefit: "Moves learners beyond locating facts.",
  },
  "vocab-grammar": {
    originalStage: "Form-focused, isolated language practice.",
    issue: "Language is practised without meaning, use, or recycling.",
    adaptedStage: "Add a meaningful-use task that recycles target language.",
    action: "Add a personalized task using the target items for real meaning.",
    benefit: "Balances form, meaning, and use; aids retention.",
  },
  engagement: {
    originalStage: "Topic presented as-is.",
    issue: "Topic may not engage these learners.",
    adaptedStage: "Localize and personalize the topic.",
    action: "Reframe with a local example and invite learners' own examples.",
    benefit: "Increases relevance and motivation.",
  },
  "task-sequencing": {
    originalStage: "Jump from input to production with little scaffolding.",
    issue: "The step-up in demand is too large.",
    adaptedStage: "Insert a scaffolding step.",
    action: "Add a guided practice stage before freer production.",
    benefit: "Smoother progression and better output.",
  },
};

const GENERIC_BEFORE_AFTER = {
  originalStage: "Existing unit stage in this area.",
  issue: "This area scored lower for your context.",
  adaptedStage: "Targeted adaptation for this area.",
  action: "Apply a relevant adaptation recipe (see Adaptation Plan).",
  benefit: "Better fit with your teaching context.",
};

export function buildBeforeAfterPlan(
  input: EvaluationInput,
  profile: ScoreProfile,
): BeforeAfterPlanItem[] {
  const weak = weakest(profile, 4).filter((c) => c.score < 3.7);
  const targets = weak.length > 0 ? weak : weakest(profile, 2);
  return targets.map((c) => {
    const t = BEFORE_AFTER_TEMPLATES[c.categoryId] ?? GENERIC_BEFORE_AFTER;
    const note = input.ratings[c.categoryId]?.evidenceNote?.trim();
    return {
      originalStage: t.originalStage,
      identifiedIssue: t.issue,
      evidence: note || `Teacher rating ${c.score.toFixed(2)}/5 for ${c.categoryName}.`,
      category: c.categoryName,
      adaptedStage: t.adaptedStage,
      adaptationAction: t.action,
      timeRequired: "10–25 minutes",
      rationale: `Addresses a lower-scoring area (${c.categoryName}).`,
      expectedBenefit: t.benefit,
    };
  });
}

export function buildSyllabusExamAlignment(
  input: EvaluationInput,
  profile: ScoreProfile,
): SyllabusExamAlignment {
  const se = input.syllabusExam;
  const strong = strongest(profile, 3).map((c) => c.categoryName);
  const weak = weakest(profile, 3)
    .filter((c) => c.score < 3.7)
    .map((c) => c.categoryName);

  const formats = se?.examFormats ?? [];
  const supportedOutcomes: string[] = [];
  const weaklySupportedOutcomes: string[] = [];
  const missingExamPreparation: string[] = [];
  const recommendedExamAlignedAdaptations: string[] = [];

  if (se?.courseOutcomes?.trim()) {
    supportedOutcomes.push(
      `Outcomes related to your strong areas (${strong.join(", ") || "—"}) appear supported by the unit.`,
    );
  }
  if (strong.length)
    supportedOutcomes.push(`The unit appears to support: ${strong.join(", ")}.`);
  if (weak.length)
    weaklySupportedOutcomes.push(`Weaker support for: ${weak.join(", ")}.`);

  const writingFormats = formats.filter((f) =>
    /writing|essay|paragraph|summary/i.test(f),
  );
  const speakingFormats = formats.filter((f) =>
    /speaking|presentation|interview/i.test(f),
  );
  if (writingFormats.length) {
    missingExamPreparation.push(
      `Check that the unit prepares learners for: ${writingFormats.join(", ")}.`,
    );
    recommendedExamAlignedAdaptations.push(
      "Add a short, exam-style writing output aligned to your writing format.",
    );
  }
  if (speakingFormats.length) {
    recommendedExamAlignedAdaptations.push(
      "Add a speaking task that mirrors your speaking exam format.",
    );
  }
  if (!formats.length) {
    missingExamPreparation.push(
      "No exam formats were entered, so exam alignment is based on ratings only.",
    );
  }

  const recommendedFinalOutputTask =
    writingFormats.length > 0
      ? `An exam-style ${writingFormats[0].toLowerCase()} task using the unit's topic and vocabulary.`
      : speakingFormats.length > 0
        ? `A short ${speakingFormats[0].toLowerCase()} using the unit's topic.`
        : "A final production task that reuses the unit's target language.";

  return {
    supportedOutcomes,
    weaklySupportedOutcomes,
    missingExamPreparation,
    recommendedExamAlignedAdaptations,
    recommendedFinalOutputTask,
  };
}

export function buildLessonPlan(
  input: EvaluationInput,
  profile: ScoreProfile,
  tasks: SupplementaryTask[],
): LessonPlan {
  const level =
    input.context.learnerLevel || input.unit.claimedLevel || "the target level";
  const topic = input.unit.unitTopic || input.unit.unitTitle || "the unit topic";
  const length = input.context.availableLessonTime || "50–60 minutes";
  const firstTask = tasks[0];

  const stages = [
    {
      stage: "Warmer / lead-in",
      time: "5 min",
      aim: "Activate schema and topic vocabulary.",
      teacherAction: "Pose a quick prediction or personal question on the topic.",
      studentAction: "Share ideas in pairs.",
      interaction: "Pairs → whole class",
      materials: "Board",
      notes: "Keep it short and inclusive.",
    },
    {
      stage: "Input (reading/listening)",
      time: "15 min",
      aim: "Comprehend the unit input with support.",
      teacherAction: "Pre-teach 4–6 key words; set a gist then detail task.",
      studentAction: "Read/listen and complete tasks; compare answers.",
      interaction: "Individual → pairs",
      materials: "Unit text (teacher's own copy)",
      notes: "Chunk dense input if needed.",
    },
    {
      stage: "Controlled practice",
      time: "10 min",
      aim: "Practise target language for accuracy.",
      teacherAction: "Set focused practice; monitor and correct.",
      studentAction: "Complete practice; self-check.",
      interaction: "Individual → pairs",
      materials: "Unit exercises",
      notes: "Trim if time is short.",
    },
    {
      stage: "Freer production (adaptation)",
      time: firstTask?.time ?? "15 min",
      aim: firstTask?.aim ?? "Use language for meaningful communication.",
      teacherAction: "Set up the supplementary task; monitor for language reuse.",
      studentAction: "Complete the communicative task with a concrete outcome.",
      interaction: firstTask?.interaction ?? "Pairs / groups",
      materials: firstTask?.materials ?? "Teacher-prepared prompts",
      notes: "This stage targets a lower-scoring area.",
    },
    {
      stage: "Wrap-up / exit ticket",
      time: "5 min",
      aim: "Consolidate and check learning.",
      teacherAction: "Take feedback; set a one-line exit ticket.",
      studentAction: "Write one thing learned and one question.",
      interaction: "Individual → whole class",
      materials: "Slips of paper / digital form",
      notes: "Use responses to plan the next lesson.",
    },
  ];

  const weakNames = weakest(profile, 2).map((c) => c.categoryName.toLowerCase());

  return {
    title: `Adapted lesson: ${topic}`,
    level,
    classProfile:
      `${input.context.institutionType || "Class"}, ${level}` +
      (input.context.classSize ? `, ~${input.context.classSize} learners` : ""),
    lessonLength: length,
    mainAim: `By the end, learners can use the unit's target language for ${topic} in a communicative task.`,
    subsidiaryAims: [
      "Comprehend the unit input with support.",
      weakNames.length
        ? `Strengthen ${weakNames.join(" and ")} through adaptation.`
        : "Practise target language for accuracy and fluency.",
    ],
    materials: [
      "Teacher's own copy of the unit (not redistributed)",
      "Pre-taught vocabulary set",
      firstTask?.materials ?? "Teacher-prepared prompts",
    ],
    stages,
    assessmentLink:
      input.syllabusExam?.examType?.trim() ||
      input.context.examAlignment?.trim() ||
      "Links to course outcomes; align the final task to your assessment.",
    homeworkExtension:
      "Set the writing/output task (or part of it) as homework to protect class time.",
  };
}

const SCORE_TO_RECOMMENDATION: { max: number; rec: string }[] = [
  { max: 2.0, rec: "Replace this unit" },
  { max: 3.0, rec: "Use with major adaptation" },
  { max: 3.7, rec: "Use with minor adaptation" },
  { max: 4.5, rec: "Use as it is" },
  { max: 5.01, rec: "Use as it is" },
];

export function buildCoordinatorSummary(
  input: EvaluationInput,
  profile: ScoreProfile,
): CoordinatorSummary {
  const strong = strongest(profile, 3).map((c) => c.categoryName);
  const weak = weakest(profile, 3)
    .filter((c) => c.score < 3.7)
    .map((c) => c.categoryName);
  const level = input.context.learnerLevel || "the stated level";
  const inst = input.context.institutionType || "the institution";

  const recommendation =
    input.coordinatorRecommendation?.trim() ||
    (profile.overallScore > 0
      ? SCORE_TO_RECOMMENDATION.find((b) => profile.overallScore < b.max)!.rec
      : "Needs department review");

  const summary =
    profile.overallScore > 0
      ? `Based on the teacher-entered ratings and evidence notes, "${input.unit.unitTitle}" from ${input.unit.coursebookName} appears ${
          profile.overallScore < 3
            ? "to need substantial adaptation"
            : profile.overallScore < 3.7
              ? "broadly usable with targeted adaptation"
              : "a strong fit"
        } for a ${level} ${inst} context (overall ${profile.overallScore.toFixed(2)}/5). The recommended adaptations focus on ${
          weak.length ? weak.join(", ") : "minor refinements"
        }.`
      : `No ratings were entered, so a department-level recommendation cannot be made yet. Add ratings and evidence to complete this summary.`;

  return {
    summary,
    mainStrengths: strong.length ? strong : ["Add ratings to identify strengths."],
    mainConcerns: weak.length ? weak : ["No major concerns recorded."],
    requiredAdaptations: [
      "Add a freer-production stage for meaningful communication.",
      "Add an exam-style output task aligned to the assessment.",
    ],
    examAlignmentJudgment:
      input.syllabusExam?.examType?.trim() || input.context.examAlignment?.trim()
        ? "Partial alignment; targeted exam-style tasks are recommended (see Syllabus/Exam alignment)."
        : "Exam alignment not specified; enter exam details for a fuller judgment.",
    recommendation,
  };
}

export function buildTeacherEvaluationSummary(
  input: EvaluationInput,
  profile: ScoreProfile,
): string {
  const ratedCount = profile.categoryScores.filter((c) => c.score > 0).length;
  const total = profile.categoryScores.length;
  const evidenceCount =
    Object.values(input.ratings).filter((r) => r.evidenceNote?.trim()).length +
    (input.evidenceBank?.length ?? 0);
  const problems = input.problemTags?.length
    ? ` The teacher flagged: ${input.problemTags.join(", ")}.`
    : "";
  return (
    `The teacher rated ${ratedCount}/${total} categories` +
    (profile.overallScore > 0
      ? ` (overall ${profile.overallScore.toFixed(2)}/5, ${profile.label.toLowerCase()})`
      : "") +
    `, with ${evidenceCount} evidence note${evidenceCount === 1 ? "" : "s"} recorded.` +
    problems +
    " This section reflects the teacher's own evaluation; the AI-supported interpretation is shown separately."
  );
}

export { CATEGORY_NAME };
