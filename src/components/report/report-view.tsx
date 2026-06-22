"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Printer,
  Copy,
  Check,
  FilePlus2,
  Pencil,
  Sparkles,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScoreChart } from "@/components/report/score-chart";
import type { EvaluationInput, GeneratedReport, ConfidenceLevel } from "@/lib/types";
import {
  reportToMarkdown,
  lessonPlanToMarkdown,
  adaptationPlanToMarkdown,
  coordinatorSummaryToMarkdown,
  teacherEvaluationToMarkdown,
} from "@/lib/export/markdown";
import { sourceLabels, REPORT_FRAMEWORK_NOTE } from "@/lib/frameworks/literature-basis";

function scoreBadgeVariant(score: number): "muted" | "danger" | "warning" | "success" {
  if (score === 0) return "muted";
  if (score < 3) return "danger";
  if (score < 3.7) return "warning";
  return "success";
}

function confidenceVariant(
  level?: ConfidenceLevel,
): "muted" | "danger" | "warning" | "success" {
  if (level === "High") return "success";
  if (level === "Medium") return "warning";
  if (level === "Low") return "danger";
  return "muted";
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {items.length ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">None noted.</p>
      )}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">None noted.</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  );
}

function SeparationNotice() {
  return (
    <div className="flex gap-3 rounded-lg border border-primary/30 bg-accent/40 p-3 text-sm text-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        The teacher&apos;s ratings and evidence notes are the basis of this report.
        AI-supported interpretation is provided to help organize and adapt, not to replace
        professional judgment.
      </p>
    </div>
  );
}

export function ReportView({
  input,
  report,
  evaluationId,
}: {
  input: EvaluationInput;
  report: GeneratedReport;
  evaluationId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const p = report.scoreProfile;
  const isDiagnose = report.mode === "diagnose";

  const safeName = `${input.unit.coursebookName}-${input.unit.unitTitle}`
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();

  function download(suffix: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coursemap-${safeName}-${suffix}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyPlan() {
    const ap = report.adaptationPlan;
    const text = [
      "ADAPTATION PLAN",
      `Keep:\n${ap.keep.map((i) => `- ${i}`).join("\n")}`,
      `Cut:\n${ap.cut.map((i) => `- ${i}`).join("\n")}`,
      `Simplify:\n${ap.simplify.map((i) => `- ${i}`).join("\n")}`,
      `Supplement:\n${ap.supplement.map((i) => `- ${i}`).join("\n")}`,
      `Reorder:\n${ap.reorder.map((i) => `- ${i}`).join("\n")}`,
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <div className="print-container space-y-6">
      {/* Header + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isDiagnose ? "Quick diagnosis" : "Evaluation report"}
          </h1>
          <p className="text-muted-foreground">
            {input.unit.coursebookName} — {input.unit.unitTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={report.generatedBy === "ai" ? "default" : "secondary"}>
              {report.generatedBy === "ai" ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI-supported
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Template-based
                </span>
              )}
            </Badge>
            {report.mode && report.mode !== "full" && (
              <Badge variant="outline">{report.mode} mode</Badge>
            )}
            {report.confidenceLevel && (
              <Badge variant={confidenceVariant(report.confidenceLevel)}>
                {report.confidenceLevel} confidence
              </Badge>
            )}
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
          <Button variant="outline" size="sm" onClick={copyPlan}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy plan"}
          </Button>
          {evaluationId && !isDiagnose && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/evaluations/${evaluationId}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/evaluations/new">
              <FilePlus2 className="h-4 w-4" /> New
            </Link>
          </Button>
        </div>
      </div>

      <SeparationNotice />

      <Tabs defaultValue="teacher" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teacher">Teacher evaluation</TabsTrigger>
          <TabsTrigger value="ai">AI interpretation</TabsTrigger>
          <TabsTrigger value="adaptation">Adaptation plan</TabsTrigger>
          <TabsTrigger value="lesson">Lesson plan</TabsTrigger>
          <TabsTrigger value="coordinator">Coordinator summary</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* TEACHER EVALUATION */}
        <TabsContent value="teacher" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="print-card md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Overall fit (teacher ratings)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {p.overallScore > 0 ? p.overallScore.toFixed(2) : "—"}
                  <span className="text-lg font-normal text-muted-foreground"> / 5</span>
                </div>
                <Badge className="mt-2" variant={scoreBadgeVariant(p.overallScore)}>
                  {p.label}
                </Badge>
              </CardContent>
            </Card>
            <Card className="print-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">What the teacher entered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  {report.teacherEvaluationSummary || report.overview}
                </p>
                {input.teacherFinalDecision?.trim() && (
                  <p className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                    <span className="font-medium">Teacher final decision: </span>
                    {input.teacherFinalDecision}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {p.overallScore > 0 && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Score profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreChart categoryScores={p.categoryScores} />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Teaching context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Institution:</span>{" "}
                  {input.context.institutionType}
                </p>
                <p>
                  <span className="text-muted-foreground">Level:</span>{" "}
                  {input.context.learnerLevel}
                </p>
                <p>
                  <span className="text-muted-foreground">Goal:</span>{" "}
                  {input.context.courseGoal}
                </p>
                <p>
                  <span className="text-muted-foreground">Class size:</span>{" "}
                  {input.context.classSize || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Lesson time:</span>{" "}
                  {input.context.availableLessonTime || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Constraints:</span>{" "}
                  {input.context.constraints || "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Coursebook unit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Coursebook:</span>{" "}
                  {input.unit.coursebookName}
                </p>
                <p>
                  <span className="text-muted-foreground">Unit:</span>{" "}
                  {input.unit.unitTitle}
                </p>
                <p>
                  <span className="text-muted-foreground">Topic:</span>{" "}
                  {input.unit.unitTopic || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Skills:</span>{" "}
                  {input.unit.unitSkills.join(", ") || "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {input.evidenceBank && input.evidenceBank.length > 0 && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Evidence bank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {input.evidenceBank.map((e) => (
                  <div key={e.id} className="rounded-md border border-border p-3 text-sm">
                    <div className="mb-1 flex flex-wrap gap-1">
                      <Badge variant="outline">{e.evidenceType}</Badge>
                      <Badge
                        variant={
                          e.severity === "High"
                            ? "danger"
                            : e.severity === "Medium"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {e.severity}
                      </Badge>
                      {e.category && <Badge variant="muted">{e.category}</Badge>}
                    </div>
                    <p className="text-foreground">{e.evidenceText}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI INTERPRETATION */}
        <TabsContent value="ai" className="space-y-4">
          {report.confidenceSummary && (
            <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p>{report.confidenceSummary}</p>
            </div>
          )}
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-base">AI-supported interpretation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground">
              <p>{report.aiSupportedInterpretation || report.overview}</p>
              {report.contextFitJudgment && (
                <p>
                  <span className="font-medium">Context-fit judgment: </span>
                  {report.contextFitJudgment}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Key strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <Bullets items={report.overallStrengths} />
              </CardContent>
            </Card>
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Main weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <Bullets items={report.mainWeaknesses} />
              </CardContent>
            </Card>
          </div>

          {report.categoryFeedback.length > 0 && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Literature-based comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.categoryFeedback.map((c, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{c.category}</h4>
                      <div className="flex items-center gap-2">
                        {c.sourceAnchors.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Literature basis: {sourceLabels(c.sourceAnchors).join(", ")}
                          </span>
                        )}
                        <Badge variant={scoreBadgeVariant(c.score)}>
                          {c.score > 0 ? `${c.score.toFixed(2)}/5` : "—"}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{c.interpretation}</p>
                    {c.evidence && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Evidence: </span>
                        {c.evidence}
                      </p>
                    )}
                    {c.adaptationNeed && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Adaptation need:{" "}
                        </span>
                        {c.adaptationNeed}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ADAPTATION PLAN */}
        <TabsContent value="adaptation" className="space-y-4">
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-base">Adaptation plan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PlanList title="What to keep" items={report.adaptationPlan.keep} />
              <PlanList title="What to cut" items={report.adaptationPlan.cut} />
              <PlanList title="What to simplify" items={report.adaptationPlan.simplify} />
              <PlanList
                title="What to supplement"
                items={report.adaptationPlan.supplement}
              />
              <PlanList title="What to reorder" items={report.adaptationPlan.reorder} />
            </CardContent>
          </Card>

          {report.beforeAfterPlan && report.beforeAfterPlan.length > 0 && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">
                  Before / After adaptation plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.beforeAfterPlan.map((b, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-2"
                  >
                    <div>
                      <Badge variant="muted" className="mb-1">
                        Before · {b.category}
                      </Badge>
                      <p className="text-sm text-foreground">{b.originalStage}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Issue: </span>
                        {b.identifiedIssue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Evidence: </span>
                        {b.evidence}
                      </p>
                    </div>
                    <div>
                      <Badge variant="success" className="mb-1">
                        After · {b.timeRequired}
                      </Badge>
                      <p className="text-sm text-foreground">{b.adaptedStage}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Action: </span>
                        {b.adaptationAction}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Benefit: </span>
                        {b.expectedBenefit}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {report.syllabusExamAlignment && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Syllabus / exam alignment</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <PlanList
                  title="Supported outcomes"
                  items={report.syllabusExamAlignment.supportedOutcomes}
                />
                <PlanList
                  title="Weakly supported"
                  items={report.syllabusExamAlignment.weaklySupportedOutcomes}
                />
                <PlanList
                  title="Missing exam preparation"
                  items={report.syllabusExamAlignment.missingExamPreparation}
                />
                <PlanList
                  title="Recommended exam-aligned adaptations"
                  items={report.syllabusExamAlignment.recommendedExamAlignedAdaptations}
                />
                {report.syllabusExamAlignment.recommendedFinalOutputTask && (
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    <span className="font-medium text-foreground">
                      Recommended final output task:{" "}
                    </span>
                    {report.syllabusExamAlignment.recommendedFinalOutputTask}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {report.adaptationRecipesUsed && report.adaptationRecipesUsed.length > 0 && (
            <Card className="print-card">
              <CardHeader>
                <CardTitle className="text-base">Adaptation recipes used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.adaptationRecipesUsed.map((r) => (
                    <Badge key={r.id} variant="secondary">
                      {r.title}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Browse all recipes on the{" "}
                  <Link href="/recipes" className="text-primary underline">
                    Adaptation recipes
                  </Link>{" "}
                  page.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {report.supplementaryTasks.map((t, idx) => (
              <Card key={idx} className="print-card">
                <CardHeader>
                  <CardTitle className="text-base">
                    Supplementary task {idx + 1}: {t.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Aim:</span> {t.aim}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Level: {t.level}</span>
                    <span>Time: {t.time}</span>
                    {t.interaction && <span>Interaction: {t.interaction}</span>}
                  </div>
                  <p>
                    <span className="text-muted-foreground">Materials:</span>{" "}
                    {t.materials}
                  </p>
                  <div>
                    <p className="text-muted-foreground">Procedure:</p>
                    <ol className="mt-1 list-decimal space-y-1 pl-5">
                      {t.procedure.map((s, si) => (
                        <li key={si}>{s}</li>
                      ))}
                    </ol>
                  </div>
                  {t.differentiation && (
                    <p>
                      <span className="text-muted-foreground">Differentiation:</span>{" "}
                      {t.differentiation}
                    </p>
                  )}
                  {t.teacherNotes && (
                    <p>
                      <span className="text-muted-foreground">Teacher notes:</span>{" "}
                      {t.teacherNotes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LESSON PLAN */}
        <TabsContent value="lesson" className="space-y-4">
          {report.lessonPlan ? (
            <Card className="print-card">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{report.lessonPlan.title}</CardTitle>
                  {evaluationId && (
                    <Button asChild variant="outline" size="sm" className="no-print">
                      <Link href={`/evaluations/${evaluationId}/print/lesson-plan`}>
                        <Printer className="h-4 w-4" /> Print lesson plan
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-1 sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Level:</span>{" "}
                    {report.lessonPlan.level}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Length:</span>{" "}
                    {report.lessonPlan.lessonLength}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Class profile:</span>{" "}
                    {report.lessonPlan.classProfile}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Main aim:</span>{" "}
                    {report.lessonPlan.mainAim}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Subsidiary aims</p>
                  <Bullets items={report.lessonPlan.subsidiaryAims} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="p-2 font-medium">Stage</th>
                        <th className="p-2 font-medium">Time</th>
                        <th className="p-2 font-medium">Aim</th>
                        <th className="p-2 font-medium">Teacher</th>
                        <th className="p-2 font-medium">Student</th>
                        <th className="p-2 font-medium">Interaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.lessonPlan.stages.map((s, i) => (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0 align-top"
                        >
                          <td className="p-2 font-medium text-foreground">{s.stage}</td>
                          <td className="p-2">{s.time}</td>
                          <td className="p-2">{s.aim}</td>
                          <td className="p-2">{s.teacherAction}</td>
                          <td className="p-2">{s.studentAction}</td>
                          <td className="p-2">{s.interaction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  <span className="text-muted-foreground">Assessment link:</span>{" "}
                  {report.lessonPlan.assessmentLink}
                </p>
                <p>
                  <span className="text-muted-foreground">Homework / extension:</span>{" "}
                  {report.lessonPlan.homeworkExtension}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="print-card">
              <CardContent className="py-8 text-center text-muted-foreground">
                No lesson plan available for this report.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* COORDINATOR SUMMARY */}
        <TabsContent value="coordinator" className="space-y-4">
          {report.coordinatorSummary ? (
            <Card className="print-card">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Coordinator summary</CardTitle>
                  <Badge variant="default">
                    {report.coordinatorSummary.recommendation}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-foreground">{report.coordinatorSummary.summary}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PlanList
                    title="Main strengths"
                    items={report.coordinatorSummary.mainStrengths}
                  />
                  <PlanList
                    title="Main concerns"
                    items={report.coordinatorSummary.mainConcerns}
                  />
                </div>
                <PlanList
                  title="Required adaptations"
                  items={report.coordinatorSummary.requiredAdaptations}
                />
                <p>
                  <span className="font-medium">Exam/syllabus alignment: </span>
                  {report.coordinatorSummary.examAlignmentJudgment}
                </p>
                {input.teacherFinalDecision?.trim() && (
                  <p className="rounded-md bg-muted/50 p-3">
                    <span className="font-medium">
                      Teacher / coordinator final decision:{" "}
                    </span>
                    {input.teacherFinalDecision}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="print-card">
              <CardContent className="py-8 text-center text-muted-foreground">
                No coordinator summary available for this report.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => download("full-report", reportToMarkdown(input, report))}
                >
                  <Download className="h-4 w-4" /> Full report (Markdown)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    download(
                      "teacher-evaluation",
                      teacherEvaluationToMarkdown(input, report),
                    )
                  }
                >
                  <Download className="h-4 w-4" /> Teacher evaluation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    download("adaptation-plan", adaptationPlanToMarkdown(report))
                  }
                >
                  <Download className="h-4 w-4" /> Adaptation plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => download("lesson-plan", lessonPlanToMarkdown(report))}
                >
                  <Download className="h-4 w-4" /> Lesson plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    download("coordinator-summary", coordinatorSummaryToMarkdown(report))
                  }
                >
                  <Download className="h-4 w-4" /> Coordinator summary
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print / Save as PDF
                </Button>
                {evaluationId && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/evaluations/${evaluationId}/print/lesson-plan`}>
                      <Printer className="h-4 w-4" /> Print lesson plan
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="print-card">
          <CardHeader>
            <CardTitle className="text-base">Teacher implementation notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Bullets items={report.implementationNotes} />
          </CardContent>
        </Card>
        <Card className="print-card">
          <CardHeader>
            <CardTitle className="text-base">
              Limitations & professional judgment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bullets items={report.limitations} />
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {REPORT_FRAMEWORK_NOTE}
      </p>
    </div>
  );
}
