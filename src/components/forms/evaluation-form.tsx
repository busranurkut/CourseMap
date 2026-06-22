"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { RatingGroup } from "@/components/forms/rating-group";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  evaluationFormSchema,
  type EvaluationFormValues,
  INSTITUTION_TYPES,
  LEARNER_LEVELS,
  COURSE_GOALS,
  SKILL_OPTIONS,
  EXAM_FORMATS,
  EVIDENCE_TYPES,
  EVIDENCE_SEVERITIES,
  COORDINATOR_RECOMMENDATIONS,
} from "@/lib/validation";
import { PROBLEM_TAGS } from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { sourceLabels } from "@/lib/frameworks/literature-basis";

// Quick Evaluation rates a focused subset of the framework.
const QUICK_CATEGORY_IDS = [
  "level-cognitive-load",
  "engagement",
  "skills-balance",
  "communicative-value",
  "assessment-alignment",
  "adaptability",
];

const EVIDENCE_PLACEHOLDERS = [
  "The reading text is relevant, but the post-reading stage only checks comprehension.",
  "The unit does not prepare students for our paragraph-writing exam.",
  "The topic is interesting, but students may need vocabulary support.",
  "There is no freer speaking task after controlled practice.",
];

function buildDefaultRatings() {
  const ratings: EvaluationFormValues["ratings"] = {};
  for (const cat of COURSEMAP_CORE.categories) {
    ratings[cat.id] = {
      categoryId: cat.id,
      ratings: {},
      evidenceNote: "",
      adaptationNote: "",
    };
  }
  return ratings;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export interface EvaluationFormProps {
  /** When provided, the form edits an existing evaluation instead of creating one. */
  initialValues?: EvaluationFormValues;
  evaluationId?: string;
}

export function EvaluationForm({
  initialValues,
  evaluationId,
}: EvaluationFormProps = {}) {
  const router = useRouter();
  const isEditing = Boolean(evaluationId);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: initialValues ?? {
      institutionType: "",
      learnerLevel: "",
      learnerProfile: "",
      weeklyHours: null,
      courseDuration: "",
      courseGoal: "",
      examAlignment: "",
      learnerNeeds: "",
      constraints: "",
      coursebookName: "",
      publisher: "",
      claimedLevel: "",
      unitTitle: "",
      unitSkills: [],
      unitTopic: "",
      unitText: "",
      teacherNotes: "",
      ratings: buildDefaultRatings(),
      useAI: true,
      mode: "full",
      problemTags: [],
      classSize: "",
      availableLessonTime: "",
      courseOutcomes: "",
      weeklySyllabusGoals: "",
      examType: "",
      examFormats: [],
      cefrDescriptors: "",
      institutionPriorities: "",
      evidenceBank: [],
      teacherFinalDecision: "",
      coordinatorRecommendation: "",
    },
  });

  const selectedSkills = watch("unitSkills") ?? [];
  const mode = watch("mode") ?? "full";
  const examFormats = watch("examFormats") ?? [];
  const problemTags = watch("problemTags") ?? [];
  const evidenceBank = watch("evidenceBank") ?? [];

  const shownCategories =
    mode === "quick"
      ? COURSEMAP_CORE.categories.filter((c) => QUICK_CATEGORY_IDS.includes(c.id))
      : COURSEMAP_CORE.categories;

  function toggleSkill(skill: string) {
    const set = new Set(selectedSkills);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    setValue("unitSkills", Array.from(set), { shouldValidate: false });
  }

  function toggleExamFormat(fmt: string) {
    const set = new Set(examFormats);
    if (set.has(fmt)) set.delete(fmt);
    else set.add(fmt);
    setValue("examFormats", Array.from(set), { shouldValidate: false });
  }

  // Evidence bank helpers
  const [evText, setEvText] = useState("");
  const [evType, setEvType] = useState<string>(EVIDENCE_TYPES[0]);
  const [evSeverity, setEvSeverity] = useState<string>("Medium");
  const [evCategory, setEvCategory] = useState("");

  function addEvidence() {
    if (evText.trim().length < 3) return;
    const item = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: evCategory,
      evidenceText: evText.trim(),
      evidenceType: evType,
      severity: evSeverity,
      createdAt: new Date().toISOString(),
    };
    setValue("evidenceBank", [...evidenceBank, item], { shouldValidate: false });
    setEvText("");
  }

  function removeEvidence(id: string) {
    setValue(
      "evidenceBank",
      evidenceBank.filter((e) => e.id !== id),
      { shouldValidate: false },
    );
  }

  async function onSubmit(values: EvaluationFormValues) {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch(
        isEditing ? `/api/evaluations/${evaluationId}` : "/api/evaluations",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status}).`);
      }
      const data = await res.json();
      if (data.usedFallback && data.aiError) {
        toast.info("AI was unavailable, so a template-based report was generated.");
      } else {
        toast.success(isEditing ? "Report updated." : "Report generated.");
      }
      router.push(`/evaluations/${data.id ?? evaluationId}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  }

  function onInvalid() {
    toast.error("Please fix the highlighted fields, then generate the report.");
  }

  // Live progress for the sticky indicator.
  const all = watch();
  const requiredChecks = [
    Boolean(all.institutionType),
    Boolean(all.learnerLevel),
    Boolean(all.courseGoal),
    Boolean(all.coursebookName),
    Boolean(all.unitTitle),
    (all.unitText?.trim().length ?? 0) >= 20,
  ];
  const requiredDone = requiredChecks.filter(Boolean).length;
  const totalCategories = shownCategories.length;
  const ratedCategories = shownCategories.filter((c) => {
    const r = all.ratings?.[c.id]?.ratings ?? {};
    return Object.values(r).some((v) => Number(v) >= 1);
  }).length;

  const MODES: {
    value: "quick" | "full" | "coordinator";
    label: string;
    desc: string;
  }[] = [
    {
      value: "quick",
      label: "Quick evaluation",
      desc: "6 criteria + biggest problem. Fast.",
    },
    { value: "full", label: "Full evaluation", desc: "All 12 framework categories." },
    {
      value: "coordinator",
      label: "Coordinator review",
      desc: "Full evaluation + formal recommendation.",
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      {/* Mode selector */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation mode</CardTitle>
          <CardDescription>
            Teacher judgment first. AI support second. Choose how much detail to enter.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("mode", m.value, { shouldValidate: false })}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-accent/50 ring-1 ring-primary"
                    : "border-input bg-card hover:bg-muted",
                )}
              >
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Sticky progress */}
      <div className="no-print sticky top-[57px] z-20 -mx-1 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={cn(
                "h-4 w-4",
                requiredDone === requiredChecks.length
                  ? "text-emerald-600"
                  : "text-muted-foreground",
              )}
            />
            <span className="text-muted-foreground">
              Required fields:{" "}
              <span className="font-medium text-foreground">
                {requiredDone}/{requiredChecks.length}
              </span>
            </span>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <span className="whitespace-nowrap text-muted-foreground">
              Categories rated:{" "}
              <span className="font-medium text-foreground">
                {ratedCategories}/{totalCategories}
              </span>
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(ratedCategories / totalCategories) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* A. Teaching context */}
      <Card>
        <CardHeader>
          <CardTitle>A. Teaching context</CardTitle>
          <CardDescription>
            The context is the main basis for judging fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="institutionType">Institution type *</Label>
            <Select id="institutionType" {...register("institutionType")}>
              <option value="">Select…</option>
              {INSTITUTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <FieldError message={errors.institutionType?.message} />
          </div>
          <div>
            <Label htmlFor="learnerLevel">Learner level *</Label>
            <Select id="learnerLevel" {...register("learnerLevel")}>
              <option value="">Select…</option>
              {LEARNER_LEVELS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <FieldError message={errors.learnerLevel?.message} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="learnerProfile">Learner profile</Label>
            <Textarea
              id="learnerProfile"
              placeholder="Age, background, motivation, prior knowledge…"
              {...register("learnerProfile")}
            />
          </div>
          <div>
            <Label htmlFor="weeklyHours">Weekly course hours</Label>
            <Input
              id="weeklyHours"
              type="number"
              min={0}
              max={80}
              placeholder="e.g. 6"
              {...register("weeklyHours")}
            />
          </div>
          <div>
            <Label htmlFor="classSize">Class size</Label>
            <Input id="classSize" placeholder="e.g. 28" {...register("classSize")} />
          </div>
          <div>
            <Label htmlFor="availableLessonTime">Available lesson time</Label>
            <Input
              id="availableLessonTime"
              placeholder="e.g. 50 minutes"
              {...register("availableLessonTime")}
            />
          </div>
          <div>
            <Label htmlFor="courseDuration">Course duration</Label>
            <Input
              id="courseDuration"
              placeholder="e.g. 14-week semester"
              {...register("courseDuration")}
            />
          </div>
          <div>
            <Label htmlFor="courseGoal">Main course goal *</Label>
            <Select id="courseGoal" {...register("courseGoal")}>
              <option value="">Select…</option>
              {COURSE_GOALS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <FieldError message={errors.courseGoal?.message} />
          </div>
          <div>
            <Label htmlFor="examAlignment">Assessment / exam alignment</Label>
            <Textarea
              id="examAlignment"
              placeholder="Which exam or in-house assessment do learners face?"
              {...register("examAlignment")}
            />
          </div>
          <div>
            <Label htmlFor="learnerNeeds">Learner needs</Label>
            <Textarea
              id="learnerNeeds"
              placeholder="e.g. academic reading strategies, fluency in discussion…"
              {...register("learnerNeeds")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="constraints">Constraints</Label>
            <Textarea
              id="constraints"
              placeholder="e.g. limited time, exam pressure, large classes, mixed levels, weak speaking confidence"
              {...register("constraints")}
            />
          </div>
        </CardContent>
      </Card>

      {/* B. Coursebook unit information */}
      <Card>
        <CardHeader>
          <CardTitle>B. Coursebook unit information</CardTitle>
          <CardDescription>
            Paste a unit summary — do not paste entire copyrighted units.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="coursebookName">Coursebook name *</Label>
            <Input id="coursebookName" {...register("coursebookName")} />
            <FieldError message={errors.coursebookName?.message} />
          </div>
          <div>
            <Label htmlFor="publisher">Publisher</Label>
            <Input id="publisher" {...register("publisher")} />
          </div>
          <div>
            <Label htmlFor="claimedLevel">Level claimed by publisher</Label>
            <Input
              id="claimedLevel"
              placeholder="e.g. B1"
              {...register("claimedLevel")}
            />
          </div>
          <div>
            <Label htmlFor="unitTitle">Unit number / title *</Label>
            <Input
              id="unitTitle"
              placeholder="e.g. Unit 4: Urban Life"
              {...register("unitTitle")}
            />
            <FieldError message={errors.unitTitle?.message} />
          </div>
          <div className="sm:col-span-2">
            <Label>Skills covered</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-muted-foreground hover:bg-muted",
                    )}
                    aria-pressed={active}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="unitTopic">Unit topic</Label>
            <Input
              id="unitTopic"
              placeholder="e.g. City problems and solutions"
              {...register("unitTopic")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="unitText">Unit text or unit summary *</Label>
            <Textarea
              id="unitText"
              className="min-h-[140px]"
              placeholder="Summarize the unit's sections, texts and tasks in your own words. Do not paste entire copyrighted material."
              {...register("unitText")}
            />
            <FieldError message={errors.unitText?.message} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="teacherNotes">Optional teacher notes</Label>
            <Textarea
              id="teacherNotes"
              placeholder="Anything else relevant to your decision…"
              {...register("teacherNotes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* C. Evaluation framework */}
      <Card>
        <CardHeader>
          <CardTitle>
            C. {mode === "quick" ? "Quick criteria" : COURSEMAP_CORE.name}
          </CardTitle>
          <CardDescription>
            Rate each criterion 1 (very weak) to 5 (very strong). Leave a criterion
            unrated if not applicable. Add evidence and adaptation notes per category.
            {mode === "quick" ? " Quick mode shows a focused set of six categories." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="rounded-md bg-accent/40 p-3 text-xs text-foreground">
            CourseMap works best when you add concrete evidence. A rating alone can guide
            the report, but evidence notes make the interpretation stronger.
          </p>
          {shownCategories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sourceLabels(cat.sourceAnchors).map((s) => (
                    <Badge key={s} variant="muted">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {cat.criteria.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="sm:pr-4">
                      <p className="text-sm font-medium text-foreground">
                        {cr.criterion}
                      </p>
                      <p className="text-xs text-muted-foreground">{cr.explanation}</p>
                    </div>
                    <Controller
                      control={control}
                      name={`ratings.${cat.id}.ratings.${cr.id}` as const}
                      render={({ field }) => (
                        <RatingGroup
                          label={cr.criterion}
                          value={field.value ? Number(field.value) : undefined}
                          onChange={(v) => field.onChange(v)}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`ev-${cat.id}`} className="text-xs">
                    Evidence note
                  </Label>
                  <Textarea
                    id={`ev-${cat.id}`}
                    className="min-h-[60px]"
                    placeholder={`e.g. ${EVIDENCE_PLACEHOLDERS[0]}`}
                    {...register(`ratings.${cat.id}.evidenceNote` as const)}
                  />
                </div>
                <div>
                  <Label htmlFor={`ad-${cat.id}`} className="text-xs">
                    Adaptation note
                  </Label>
                  <Textarea
                    id={`ad-${cat.id}`}
                    className="min-h-[60px]"
                    placeholder="What adaptation might this area need?"
                    {...register(`ratings.${cat.id}.adaptationNote` as const)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Biggest problem (Quick mode) */}
      {mode === "quick" && (
        <Card>
          <CardHeader>
            <CardTitle>Biggest problem</CardTitle>
            <CardDescription>What is the main issue with this unit?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={problemTags[0] ?? ""}
              onChange={(e) =>
                setValue("problemTags", e.target.value ? [e.target.value] : [], {
                  shouldValidate: false,
                })
              }
              aria-label="Biggest problem"
            >
              <option value="">Select…</option>
              {PROBLEM_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Syllabus / exam alignment (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Syllabus &amp; exam alignment (optional)</CardTitle>
          <CardDescription>
            Helps CourseMap check whether the unit prepares learners for your assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="courseOutcomes">Course outcomes</Label>
            <Textarea
              id="courseOutcomes"
              placeholder="e.g. By the end of the course, learners can write a structured academic paragraph."
              {...register("courseOutcomes")}
            />
          </div>
          <div>
            <Label htmlFor="weeklySyllabusGoals">Weekly syllabus goals</Label>
            <Textarea id="weeklySyllabusGoals" {...register("weeklySyllabusGoals")} />
          </div>
          <div>
            <Label htmlFor="examType">Exam type</Label>
            <Input
              id="examType"
              placeholder="e.g. In-house academic exam"
              {...register("examType")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Exam formats</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAM_FORMATS.map((fmt) => {
                const active = examFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleExamFormat(fmt)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="cefrDescriptors">CEFR target descriptors</Label>
            <Textarea id="cefrDescriptors" {...register("cefrDescriptors")} />
          </div>
          <div>
            <Label htmlFor="institutionPriorities">Institution priorities</Label>
            <Textarea id="institutionPriorities" {...register("institutionPriorities")} />
          </div>
        </CardContent>
      </Card>

      {/* Evidence bank */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence bank (optional)</CardTitle>
          <CardDescription>
            Evidence notes make the report more reliable. If no evidence is entered,
            CourseMap will interpret ratings more cautiously.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
            <Input
              placeholder={EVIDENCE_PLACEHOLDERS[1]}
              value={evText}
              onChange={(e) => setEvText(e.target.value)}
              aria-label="Evidence text"
            />
            <Select
              value={evType}
              onChange={(e) => setEvType(e.target.value)}
              aria-label="Evidence type"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select
              value={evSeverity}
              onChange={(e) => setEvSeverity(e.target.value)}
              aria-label="Severity"
            >
              {EVIDENCE_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button type="button" variant="outline" onClick={addEvidence}>
              Add
            </Button>
          </div>
          <Input
            placeholder="Category (optional, e.g. Communicative value)"
            value={evCategory}
            onChange={(e) => setEvCategory(e.target.value)}
            aria-label="Evidence category"
          />
          {evidenceBank.length > 0 && (
            <ul className="space-y-2">
              {evidenceBank.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-2 text-sm"
                >
                  <span>
                    <span className="mr-2 inline-flex gap-1">
                      <Badge variant="outline">{e.evidenceType}</Badge>
                      <Badge variant="muted">{e.severity}</Badge>
                    </span>
                    {e.evidenceText}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEvidence(e.id)}
                    className="shrink-0 text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "coordinator" ? "Coordinator decision" : "Teacher decision"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className={mode === "coordinator" ? "" : "sm:col-span-2"}>
            <Label htmlFor="teacherFinalDecision">
              Teacher / coordinator final decision
            </Label>
            <Textarea
              id="teacherFinalDecision"
              placeholder="Your own decision about this unit (this stays the teacher's judgment)."
              {...register("teacherFinalDecision")}
            />
          </div>
          {mode === "coordinator" && (
            <div>
              <Label htmlFor="coordinatorRecommendation">Recommendation</Label>
              <Select
                id="coordinatorRecommendation"
                {...register("coordinatorRecommendation")}
              >
                <option value="">Let CourseMap suggest…</option>
                {COORDINATOR_RECOMMENDATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* D. Generate */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Controller
            control={control}
            name="useAI"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                Use AI-supported generation if an Anthropic API key is configured
                (otherwise a template-based report is generated).
              </label>
            )}
          />
          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}
          <div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting
                ? isEditing
                  ? "Saving & regenerating…"
                  : "Generating report…"
                : isEditing
                  ? "Save & regenerate report"
                  : "Generate report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
