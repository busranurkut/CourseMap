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

const ratingValue = z.coerce.number().int().min(1).max(5);

export const categoryRatingSchema = z.object({
  categoryId: z.string(),
  ratings: z.record(z.string(), ratingValue),
  evidenceNote: z.string().default(""),
  adaptationNote: z.string().default(""),
});

export const evaluationFormSchema = z.object({
  // Teaching context
  institutionType: z.string().min(1, "Please choose an institution type."),
  learnerLevel: z.string().min(1, "Please choose a learner level."),
  learnerProfile: z.string().default(""),
  weeklyHours: z
    .union([z.coerce.number().min(0).max(80), z.literal("")])
    .transform((v) => (v === "" ? null : Number(v)))
    .nullable()
    .default(null),
  courseDuration: z.string().default(""),
  courseGoal: z.string().min(1, "Please choose a course goal."),
  examAlignment: z.string().default(""),
  learnerNeeds: z.string().default(""),
  constraints: z.string().default(""),

  // Coursebook unit information
  coursebookName: z.string().min(1, "Coursebook name is required."),
  publisher: z.string().default(""),
  claimedLevel: z.string().default(""),
  unitTitle: z.string().min(1, "Unit number/title is required."),
  unitSkills: z.array(z.string()).default([]),
  unitTopic: z.string().default(""),
  unitText: z
    .string()
    .min(20, "Please paste a unit summary or short description (min 20 characters)."),
  teacherNotes: z.string().default(""),

  // Ratings keyed by categoryId
  ratings: z.record(z.string(), categoryRatingSchema),

  // Whether the user wants to attempt AI generation (if a key is configured)
  useAI: z.boolean().default(true),
});

export type EvaluationFormValues = z.infer<typeof evaluationFormSchema>;
