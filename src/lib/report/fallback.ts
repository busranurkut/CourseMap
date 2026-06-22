import type {
  EvaluationInput,
  GeneratedReport,
  CategoryFeedback,
  SupplementaryTask,
  ScoreProfile,
} from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { sourceLabels } from "@/lib/frameworks/literature-basis";
import { computeScoreProfile, scoreLabel } from "@/lib/scoring/score";
import {
  computeConfidence,
  selectRecipes,
  buildBeforeAfterPlan,
  buildSyllabusExamAlignment,
  buildLessonPlan,
  buildCoordinatorSummary,
  buildTeacherEvaluationSummary,
} from "@/lib/report/sections";

// Deterministic, template-based report generator.
// Used when no ANTHROPIC_API_KEY is configured, or when the user opts out of AI.
// It produces evidence-based, professional language from the scores and notes —
// never absolute verdicts.

function interpretScore(score: number): string {
  if (score <= 0) return "This category was not rated.";
  if (score < 2.0)
    return "The available ratings suggest this area is currently very weak for your context and likely needs substantial work before classroom use.";
  if (score < 3.0)
    return "The ratings indicate this area needs substantial adaptation to fit your context.";
  if (score < 3.7)
    return "This area appears usable but would benefit from targeted adaptation.";
  if (score < 4.5)
    return "This area appears to be a strong fit for your context, with only minor adjustments likely needed.";
  return "This area appears to be an excellent fit for your context as it stands.";
}

function adaptationNeedFor(score: number): string {
  if (score <= 0) return "Rate this category to receive adaptation guidance.";
  if (score < 3.0) return "Priority for adaptation.";
  if (score < 3.7) return "Some adaptation recommended.";
  return "Minor or optional adjustments.";
}

function buildCategoryFeedback(
  input: EvaluationInput,
  profile: ScoreProfile,
): CategoryFeedback[] {
  return COURSEMAP_CORE.categories.map((cat) => {
    const cs = profile.categoryScores.find((c) => c.categoryId === cat.id);
    const score = cs?.score ?? 0;
    const note = input.ratings[cat.id];
    const evidence =
      note?.evidenceNote?.trim() ||
      `No specific evidence note was entered for "${cat.name}". Interpretation is based on the criterion ratings.`;
    const adaptationFromUser = note?.adaptationNote?.trim();
    const adaptationNeed = adaptationFromUser
      ? `${adaptationNeedFor(score)} ${adaptationFromUser}`
      : adaptationNeedFor(score);

    return {
      category: cat.name,
      score,
      interpretation: interpretScore(score),
      evidence,
      adaptationNeed,
      sourceAnchors: cat.sourceAnchors,
    };
  });
}

function weakestCategories(profile: ScoreProfile, n: number) {
  return [...profile.categoryScores]
    .filter((c) => c.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, n);
}

function strongestCategories(profile: ScoreProfile, n: number) {
  return [...profile.categoryScores]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function supplementaryTasks(input: EvaluationInput): SupplementaryTask[] {
  const topic = input.unit.unitTopic || input.unit.unitTitle || "the unit topic";
  const level =
    input.context.learnerLevel || input.unit.claimedLevel || "the target level";

  const speakingTask: SupplementaryTask = {
    title: `Information-gap discussion: ${topic}`,
    aim: `Give learners a meaningful reason to exchange information and opinions about ${topic}, moving beyond controlled practice toward freer production.`,
    level,
    time: "20–25 minutes",
    interaction: "Pairs, then small groups",
    materials:
      "Two short role/prompt cards you prepare (Student A / Student B) with complementary information about the topic. Use your own wording — do not copy coursebook text.",
    procedure: [
      "Set the scene briefly and pre-teach 4–6 key words drawn from the unit.",
      "Give Student A and Student B different halves of the information.",
      "Learners ask and answer to complete a shared task (fill a table, solve a problem, reach a decision).",
      "Regroup learners to compare conclusions and justify choices.",
      "Round up with brief feedback on useful language and one or two errors.",
    ],
    differentiation:
      "Provide sentence starters for weaker learners; ask stronger learners to add a follow-up recommendation.",
    teacherNotes:
      "Keep the outcome concrete (a decision or completed table) so the talk has a purpose. Monitor for target language reuse.",
  };

  const writingTask: SupplementaryTask = {
    title: `Scaffolded exam-style writing: ${topic}`,
    aim: `Recycle the unit's target language in a short, exam-relevant written output aligned to your assessment.`,
    level,
    time: "25–30 minutes (can be set partly for homework)",
    interaction: "Individual, with peer review",
    materials:
      "A short prompt you write that mirrors your exam task type, plus a simple success checklist (3–4 criteria).",
    procedure: [
      "Show the prompt and unpack what a strong answer needs (structure, target language, length).",
      "Build a quick joint plan on the board (ideas + useful phrases from the unit).",
      "Learners draft individually using the checklist.",
      "Peer review against the checklist; learners revise one section.",
      "Collect drafts and give focused feedback on one or two priorities.",
    ],
    differentiation:
      "Offer a partial writing frame for weaker learners; remove scaffolding for stronger ones.",
    teacherNotes:
      "Aligning the prompt to your real exam format makes this double as low-stakes exam practice.",
  };

  return [speakingTask, writingTask];
}

export function generateFallbackReport(input: EvaluationInput): GeneratedReport {
  const profile = computeScoreProfile(COURSEMAP_CORE, input.ratings);
  const categoryFeedback = buildCategoryFeedback(input, profile);

  const weak = weakestCategories(profile, 3);
  const strong = strongestCategories(profile, 3);

  const goal = input.context.courseGoal || "the course goals";
  const level = input.context.learnerLevel || "the stated level";
  const inst = input.context.institutionType || "your institution";

  const overview =
    profile.overallScore > 0
      ? `Based on the ratings entered, the unit "${input.unit.unitTitle}" from ${input.unit.coursebookName} has an overall fit of ${profile.overallScore.toFixed(
          2,
        )} / 5 (${profile.label.toLowerCase()}) for a ${level} group at ${inst} with a focus on ${goal.toLowerCase()}. The unit appears usable, but the available evidence suggests some areas may need adaptation before classroom use. This report is decision support and should be reviewed with your professional judgement.`
      : `No ratings were entered, so this report summarizes the context and unit only. Rate the framework criteria to generate a full score profile and adaptation plan.`;

  const contextFitJudgment =
    profile.overallScore === 0
      ? "Add ratings to receive a context-fit judgment."
      : profile.overallScore < 3.0
        ? `For this specific context the unit appears to need substantial adaptation, particularly in ${weak
            .map((c) => c.categoryName.toLowerCase())
            .join(", ")}.`
        : profile.overallScore < 3.7
          ? `For this specific context the unit appears usable with targeted adaptation, especially in ${weak
              .map((c) => c.categoryName.toLowerCase())
              .join(", ")}.`
          : `For this specific context the unit appears to be a strong fit, with the main strengths in ${strong
              .map((c) => c.categoryName.toLowerCase())
              .join(", ")}.`;

  const overallStrengths =
    strong.length > 0
      ? strong.map(
          (c) =>
            `${c.categoryName} appears strong (${c.score.toFixed(2)}/5) and can be kept largely as is.`,
        )
      : ["Add ratings to identify strengths."];

  const mainWeaknesses =
    weak.length > 0
      ? weak
          .filter((c) => c.score < 3.7)
          .map(
            (c) =>
              `${c.categoryName} may need adaptation (${c.score.toFixed(2)}/5) for this context.`,
          )
      : ["Add ratings to identify weaknesses."];

  const adaptationPlan = {
    keep: strong.length
      ? strong.map((c) => `Keep the unit's handling of ${c.categoryName.toLowerCase()}.`)
      : ["Identify what to keep once ratings are added."],
    cut: [
      "Trim any over-long controlled-practice exercises that do not serve your priority skills.",
    ],
    simplify: weak
      .filter((c) => c.categoryId === "level-cognitive-load" || c.score < 3.0)
      .map((c) => `Simplify input or staging related to ${c.categoryName.toLowerCase()}.`)
      .concat([
        "Pre-teach key vocabulary and chunk dense input to reduce cognitive load.",
      ]),
    supplement: [
      "Add a freer-production stage so learners use the language for meaningful communication.",
      "Add an exam-style output task aligned to your assessment.",
    ],
    reorder: [
      "Sequence activities from input to controlled practice to freer use, inserting a scaffolding step where the jump is largest.",
    ],
  };

  const implementationNotes = [
    `Allow time for the added freer-production stage; consider setting some writing for homework given your ${
      input.context.weeklyHours
        ? `${input.context.weeklyHours} weekly hours`
        : "available hours"
    }.`,
    "Recycle target vocabulary in the final task to support retention.",
    input.context.constraints
      ? `Account for your stated constraints (${input.context.constraints}) when grouping and timing tasks.`
      : "Plan grouping and timing around your real class size and constraints.",
  ];

  const limitations = [
    "This evaluation reflects the ratings and notes you entered; it is decision support, not an absolute verdict.",
    "Supplementary tasks are original drafts and should be reviewed and adapted before classroom use.",
    "No coursebook text is reproduced; the unit summary you entered is used only to inform the analysis.",
    "This report was generated without an AI model; the interpretation is template-based and intentionally cautious.",
  ];

  const tasks = supplementaryTasks(input);
  const confidence = computeConfidence(input, profile);
  const recipes = selectRecipes(input, profile);

  const aiSupportedInterpretation =
    profile.overallScore > 0
      ? `Reading the teacher's ratings together, the unit looks ${
          profile.overallScore < 3
            ? "as though it needs substantial adaptation"
            : profile.overallScore < 3.7
              ? "broadly usable with targeted adaptation"
              : "a good fit"
        } for this context. ${contextFitJudgment} The patterns below organize the teacher's evaluation into next steps; they do not replace professional judgment.`
      : "Add ratings to receive a template-based interpretation of your evaluation.";

  return {
    overview,
    contextFitJudgment,
    overallStrengths,
    mainWeaknesses,
    categoryFeedback,
    adaptationPlan,
    supplementaryTasks: tasks,
    implementationNotes,
    limitations,
    scoreProfile: profile,
    generatedBy: "fallback",

    // v0.3 sections
    teacherEvaluationSummary: buildTeacherEvaluationSummary(input, profile),
    aiSupportedInterpretation,
    confidenceLevel: confidence.level,
    confidenceSummary: confidence.summary,
    beforeAfterPlan: buildBeforeAfterPlan(input, profile),
    syllabusExamAlignment: buildSyllabusExamAlignment(input, profile),
    adaptationRecipesUsed: recipes.map((r) => ({ id: r.id, title: r.title })),
    lessonPlan: buildLessonPlan(input, profile, tasks),
    coordinatorSummary: buildCoordinatorSummary(input, profile),
    mode: input.mode ?? "full",
    problemTags: input.problemTags ?? [],
  };
}

// Re-export for callers that want the label utility.
export { scoreLabel, sourceLabels };
