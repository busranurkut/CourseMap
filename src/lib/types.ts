// Shared domain types for CourseMap.

export type Rating = 1 | 2 | 3 | 4 | 5;

/** A single evaluation criterion, grounded in the literature basis. */
export interface Criterion {
  id: string;
  category: string;
  criterion: string;
  explanation: string;
  /** Keys into LITERATURE_SOURCES (see literature-basis.ts). */
  sourceAnchors: string[];
  evidencePrompt: string;
  adaptationPrompt: string;
}

/** A framework category bundling several criteria. */
export interface FrameworkCategory {
  id: string;
  name: string;
  description: string;
  /** Literature anchors that inform the whole category. */
  sourceAnchors: string[];
  criteria: Criterion[];
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  scale: { value: Rating; label: string }[];
  categories: FrameworkCategory[];
}

/** User-entered ratings for one category. */
export interface CategoryRating {
  categoryId: string;
  /** criterionId -> rating (1..5) */
  ratings: Record<string, Rating>;
  evidenceNote: string;
  adaptationNote: string;
}

export type RatingsByCategory = Record<string, CategoryRating>;

export interface TeachingContext {
  institutionType: string;
  learnerLevel: string;
  learnerProfile: string;
  weeklyHours: number | null;
  courseDuration: string;
  courseGoal: string;
  examAlignment: string;
  learnerNeeds: string;
  constraints: string;
  /** Optional, used especially by Quick Evaluation and Problem-first modes. */
  classSize?: string;
  availableLessonTime?: string;
}

// ---- Evaluation modes & problem tags ----

export type EvaluationMode = "quick" | "full" | "coordinator" | "diagnose";

export const PROBLEM_TAGS = [
  "Too difficult",
  "Too easy",
  "Not enough speaking",
  "Not enough writing",
  "Not enough vocabulary recycling",
  "Weak listening support",
  "Weak reading support",
  "Too much controlled practice",
  "Not exam-aligned",
  "Topic is not engaging",
  "Too long for available time",
  "Grammar is too isolated",
  "Topic does not fit my learners",
  "Needs a better final task",
  "Mixed levels hard to teach",
  "Large class size",
  "Other",
] as const;

export type ProblemTag = string;

// ---- Evidence Bank ----

export type EvidenceType =
  | "Strength"
  | "Weakness"
  | "Concern"
  | "Adaptation idea"
  | "Exam alignment issue"
  | "Learner need"
  | "Timing issue"
  | "Cultural/content note";

export type EvidenceSeverity = "Low" | "Medium" | "High";

export interface EvidenceItem {
  id: string;
  category: string;
  evidenceText: string;
  evidenceType: EvidenceType;
  severity: EvidenceSeverity;
  relatedCriterionId?: string;
  createdAt: string;
}

// ---- Syllabus / Exam alignment ----

export interface SyllabusExamInput {
  courseOutcomes: string;
  weeklySyllabusGoals: string;
  examType: string;
  examFormats: string[];
  cefrDescriptors: string;
  institutionPriorities: string;
}

export interface SyllabusExamAlignment {
  supportedOutcomes: string[];
  weaklySupportedOutcomes: string[];
  missingExamPreparation: string[];
  recommendedExamAlignedAdaptations: string[];
  recommendedFinalOutputTask?: string;
}

export interface UnitInfo {
  coursebookName: string;
  publisher: string;
  claimedLevel: string;
  unitTitle: string;
  unitSkills: string[];
  unitTopic: string;
  unitText: string;
  teacherNotes: string;
}

/** The full input used to generate a report. */
export interface EvaluationInput {
  context: TeachingContext;
  unit: UnitInfo;
  ratings: RatingsByCategory;
  /** v0.3 additions (all optional so older inputs keep working). */
  mode?: EvaluationMode;
  problemTags?: ProblemTag[];
  syllabusExam?: SyllabusExamInput;
  evidenceBank?: EvidenceItem[];
  teacherFinalDecision?: string;
  coordinatorRecommendation?: string;
}

// ---- Computed scoring ----

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  score: number; // average of criteria ratings (0 if unrated)
  sourceAnchors: string[];
}

export interface ScoreProfile {
  categoryScores: CategoryScore[];
  overallScore: number;
  label: string;
}

// ---- Generated report ----

export interface CategoryFeedback {
  category: string;
  score: number;
  interpretation: string;
  evidence: string;
  adaptationNeed: string;
  sourceAnchors: string[];
}

export interface AdaptationPlan {
  keep: string[];
  cut: string[];
  simplify: string[];
  supplement: string[];
  reorder: string[];
}

export interface SupplementaryTask {
  title: string;
  aim: string;
  level: string;
  time: string;
  interaction?: string;
  materials: string;
  procedure: string[];
  differentiation?: string;
  teacherNotes: string;
}

// ---- Before/After adaptation plan ----

export interface BeforeAfterPlanItem {
  originalStage: string;
  identifiedIssue: string;
  evidence: string;
  category: string;
  adaptedStage: string;
  adaptationAction: string;
  timeRequired: string;
  rationale: string;
  expectedBenefit: string;
}

// ---- Adaptation recipes ----

export type PrepLevel = "No prep" | "Low prep" | "Medium prep";

export interface AdaptationRecipe {
  id: string;
  title: string;
  problemTags: ProblemTag[];
  relatedCategories: string[];
  whenToUse: string;
  timeNeeded: string;
  prepLevel: PrepLevel;
  skills: string[];
  procedure: string[];
  teacherNotes: string;
  differentiation: string;
  sourceAnchors: string[];
}

// ---- Lesson plan ----

export interface LessonStage {
  stage: string;
  time: string;
  aim: string;
  teacherAction: string;
  studentAction: string;
  interaction: string;
  materials: string;
  notes: string;
}

export interface LessonPlan {
  title: string;
  level: string;
  classProfile: string;
  lessonLength: string;
  mainAim: string;
  subsidiaryAims: string[];
  materials: string[];
  stages: LessonStage[];
  assessmentLink: string;
  homeworkExtension: string;
}

// ---- Coordinator summary ----

export type CoordinatorRecommendation =
  | "Use as it is"
  | "Use with minor adaptation"
  | "Use with major adaptation"
  | "Use only selectively"
  | "Replace this unit"
  | "Needs department review";

export interface CoordinatorSummary {
  summary: string;
  mainStrengths: string[];
  mainConcerns: string[];
  requiredAdaptations: string[];
  examAlignmentJudgment: string;
  recommendation: CoordinatorRecommendation | string;
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface GeneratedReport {
  overview: string;
  contextFitJudgment: string;
  overallStrengths: string[];
  mainWeaknesses: string[];
  categoryFeedback: CategoryFeedback[];
  adaptationPlan: AdaptationPlan;
  supplementaryTasks: SupplementaryTask[];
  implementationNotes: string[];
  limitations: string[];
  /** Computed score profile attached for rendering. */
  scoreProfile: ScoreProfile;
  generatedBy: "ai" | "fallback";

  // ---- v0.3 additions (optional; older stored reports may omit them) ----
  /** A plain restatement of what the teacher entered (teacher evaluation, not AI). */
  teacherEvaluationSummary?: string;
  /** AI/template interpretation, explicitly separated from the teacher's evaluation. */
  aiSupportedInterpretation?: string;
  confidenceLevel?: ConfidenceLevel;
  confidenceSummary?: string;
  beforeAfterPlan?: BeforeAfterPlanItem[];
  syllabusExamAlignment?: SyllabusExamAlignment;
  adaptationRecipesUsed?: { id: string; title: string }[];
  lessonPlan?: LessonPlan;
  coordinatorSummary?: CoordinatorSummary;
  mode?: EvaluationMode;
  problemTags?: ProblemTag[];
}

/** Alias used by storage/serialization layers. */
export type ReportJson = GeneratedReport;
