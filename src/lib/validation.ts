import { z } from "zod";

export const SKILL_OPTIONS = [
  "Reading",
  "Listening",
  "Speaking",
  "Writing",
  "Grammar",
  "Vocabulary",
  "Pronunciation",
] as const;

export const INSTITUTION_TYPES = [
  "University prep school",
  "Private language school",
  "Secondary school",
  "Higher education",
  "Other",
] as const;

export const LEARNER_LEVELS = ["A1", "A2", "B1", "B2", "C1", "Mixed"] as const;

export const COURSE_GOALS = [
  "General English",
  "Academic English",
  "Exam preparation",
  "Speaking-focused",
  "Integrated skills",
  "Other",
] as const;

export const EVALUATION_MODES = ["quick", "full", "coordinator"] as const;

export const EXAM_FORMATS = [
  "Multiple-choice reading",
  "Short-answer reading",
  "Summary writing",
  "Paragraph writing",
  "Essay writing",
  "Presentation",
  "Speaking interview",
  "Pair speaking task",
  "Listening multiple choice",
  "Listening note-taking",
  "Grammar/vocabulary test",
  "Integrated skills task",
] as const;

export const EVIDENCE_TYPES = [
  "Strength",
  "Weakness",
  "Concern",
  "Adaptation idea",
  "Exam alignment issue",
  "Learner need",
  "Timing issue",
  "Cultural/content note",
] as const;

export const EVIDENCE_SEVERITIES = ["Low", "Medium", "High"] as const;

export const COORDINATOR_RECOMMENDATIONS = [
  "Use as it is",
  "Use with minor adaptation",
  "Use with major adaptation",
  "Use only selectively",
  "Replace this unit",
  "Needs department review",
] as const;

const ratingValue = z.coerce.number().int().min(1).max(5);

export const categoryRatingSchema = z.object({
  categoryId: z.string(),
  ratings: z.record(z.string(), ratingValue),
  evidenceNote: z.string().default(""),
  adaptationNote: z.string().default(""),
});

export const evidenceItemSchema = z.object({
  id: z.string(),
  category: z.string().max(200).default(""),
  evidenceText: z.string().max(2000),
  evidenceType: z.string().max(200),
  severity: z.string().max(20),
  relatedCriterionId: z.string().max(200).optional(),
  createdAt: z.string(),
});

// Length caps protect the database and the AI request from oversized input.
const SHORT = 200;
const MED = 2000;
const LONG = 20000;

const shortText = (max = SHORT) =>
  z.string().max(max, `Please keep this under ${max} characters.`);

export const evaluationFormSchema = z.object({
  // Teaching context
  institutionType: z.string().min(1, "Please choose an institution type.").max(SHORT),
  learnerLevel: z.string().min(1, "Please choose a learner level.").max(SHORT),
  learnerProfile: shortText(MED).default(""),
  weeklyHours: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.coerce.number().min(0).max(80).nullable(),
    )
    .default(null),
  courseDuration: shortText().default(""),
  courseGoal: z.string().min(1, "Please choose a course goal.").max(SHORT),
  examAlignment: shortText(MED).default(""),
  learnerNeeds: shortText(MED).default(""),
  constraints: shortText(MED).default(""),

  // Coursebook unit information
  coursebookName: z.string().min(1, "Coursebook name is required.").max(SHORT),
  publisher: shortText().default(""),
  claimedLevel: shortText(50).default(""),
  unitTitle: z.string().min(1, "Unit number/title is required.").max(SHORT),
  unitSkills: z.array(z.string().max(SHORT)).max(20).default([]),
  unitTopic: shortText().default(""),
  unitText: z
    .string()
    .min(20, "Please paste a unit summary or short description (min 20 characters).")
    .max(
      LONG,
      "That's very long — please paste a unit summary, not an entire unit (max 20,000 characters).",
    ),
  teacherNotes: shortText(MED).default(""),

  // Ratings keyed by categoryId
  ratings: z.record(z.string(), categoryRatingSchema),

  // Whether the user wants to attempt AI generation (if a key is configured)
  useAI: z.boolean().default(true),

  // ---- v0.3 additions (all optional) ----
  mode: z.enum(["quick", "full", "coordinator"]).default("full"),
  problemTags: z.array(z.string().max(SHORT)).max(20).default([]),
  classSize: shortText().default(""),
  availableLessonTime: shortText().default(""),

  // Syllabus / exam alignment checker
  courseOutcomes: shortText(MED).default(""),
  weeklySyllabusGoals: shortText(MED).default(""),
  examType: shortText().default(""),
  examFormats: z.array(z.string().max(SHORT)).max(30).default([]),
  cefrDescriptors: shortText(MED).default(""),
  institutionPriorities: shortText(MED).default(""),

  // Evidence bank
  evidenceBank: z.array(evidenceItemSchema).max(100).default([]),

  // Decisions
  teacherFinalDecision: shortText(MED).default(""),
  coordinatorRecommendation: shortText().default(""),
});

export type EvaluationFormValues = z.infer<typeof evaluationFormSchema>;

// Problem-first ("diagnose") mode uses a lighter schema.
export const diagnoseFormSchema = z.object({
  problemTags: z
    .array(z.string().max(SHORT))
    .min(1, "Select at least one problem.")
    .max(20),
  learnerLevel: z.string().min(1, "Please choose a learner level.").max(SHORT),
  classSize: shortText().default(""),
  availableLessonTime: shortText().default(""),
  unitTopic: shortText().default(""),
  unitText: z
    .string()
    .min(20, "Please add a short unit summary (min 20 characters).")
    .max(LONG),
  evidenceNotes: shortText(MED).default(""),
  coursebookName: shortText().default("Untitled coursebook"),
  unitTitle: shortText().default("Untitled unit"),
  useAI: z.boolean().default(true),
});

export type DiagnoseFormValues = z.infer<typeof diagnoseFormSchema>;
