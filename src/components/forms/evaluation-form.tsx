"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export function EvaluationForm({ initialValues, evaluationId }: EvaluationFormProps = {}) {
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
      router.push(`/evaluations/${data.id ?? evaluationId}`);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Input id="claimedLevel" placeholder="e.g. B1" {...register("claimedLevel")} />
          </div>
          <div>
            <Label htmlFor="unitTitle">Unit number / title *</Label>
            <Input id="unitTitle" placeholder="e.g. Unit 4: Urban Life" {...register("unitTitle")} />
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
                      <p className="text-sm font-medium text-foreground">{cr.criterion}</p>
                      <p className="text-xs text-muted-foreground">{cr.explanation}</p>
                    </div>
                    <Controller
                      control={control}
                      name={`ratings.${cat.id}.ratings.${cr.id}` as const}
                      render={({ field }) => (
                        <div className="flex shrink-0 gap-1" role="radiogroup" aria-label={cr.criterion}>
                          {[1, 2, 3, 4, 5].map((n) => {
                            const active = Number(field.value) === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                aria-label={`Rate ${n}`}
                                aria-pressed={active}
                                onClick={() => field.onChange(active ? undefined : n)}
                                className={cn(
                                  "h-8 w-8 rounded-md border text-sm font-medium transition-colors",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-card text-muted-foreground hover:bg-muted",
                                )}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
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
