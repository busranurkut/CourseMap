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
} from "@/lib/validation";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { sourceLabels } from "@/lib/frameworks/literature-basis";

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
    },
  });

  const selectedSkills = watch("unitSkills") ?? [];

  function toggleSkill(skill: string) {
    const set = new Set(selectedSkills);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    setValue("unitSkills", Array.from(set), { shouldValidate: false });
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
  const totalCategories = COURSEMAP_CORE.categories.length;
  const ratedCategories = COURSEMAP_CORE.categories.filter((c) => {
    const r = all.ratings?.[c.id]?.ratings ?? {};
    return Object.values(r).some((v) => Number(v) >= 1);
  }).length;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
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
          <CardTitle>C. {COURSEMAP_CORE.name}</CardTitle>
          <CardDescription>
            Rate each criterion 1 (very weak) to 5 (very strong). Leave a criterion
            unrated if not applicable. Add evidence and adaptation notes per category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {COURSEMAP_CORE.categories.map((cat) => (
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
                    placeholder="What in the unit supports your ratings?"
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
