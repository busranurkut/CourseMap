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
}
