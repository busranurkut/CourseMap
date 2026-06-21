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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreChart } from "@/components/report/score-chart";
import type { EvaluationInput, GeneratedReport } from "@/lib/types";
import { reportToMarkdown } from "@/lib/export/markdown";
import { sourceLabels, REPORT_FRAMEWORK_NOTE } from "@/lib/frameworks/literature-basis";

function scoreBadgeVariant(score: number): "muted" | "danger" | "warning" | "success" {
  if (score === 0) return "muted";
  if (score < 3) return "danger";
  if (score < 3.7) return "warning";
  return "success";
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

  function downloadMarkdown() {
    const md = reportToMarkdown(input, report);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = `${input.unit.coursebookName}-${input.unit.unitTitle}`
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    a.href = url;
    a.download = `coursemap-${safe}.md`;
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
          <h1 className="text-3xl font-bold tracking-tight">Evaluation report</h1>
          <p className="text-muted-foreground">
            {input.unit.coursebookName} — {input.unit.unitTitle}
          </p>
          <div className="mt-2 flex items-center gap-2">
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
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <Download className="h-4 w-4" /> Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
          <Button variant="outline" size="sm" onClick={copyPlan}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy plan"}
          </Button>
          {evaluationId && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/evaluations/${evaluationId}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/evaluations/new">
              <FilePlus2 className="h-4 w-4" /> New evaluation
            </Link>
          </Button>
        </div>
      </div>

      {/* Overall + overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="print-card md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Overall fit</CardTitle>
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
            <CardTitle className="text-base">Evaluation overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{report.overview}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="print-card">
        <CardHeader>
          <CardTitle className="text-base">Score profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreChart categoryScores={p.categoryScores} />
        </CardContent>
      </Card>

      {/* Context + unit summary */}
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
              <span className="text-muted-foreground">Weekly hours:</span>{" "}
              {input.context.weeklyHours ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Duration:</span>{" "}
              {input.context.courseDuration || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Goal:</span>{" "}
              {input.context.courseGoal}
            </p>
            <p>
              <span className="text-muted-foreground">Exam alignment:</span>{" "}
              {input.context.examAlignment || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Needs:</span>{" "}
              {input.context.learnerNeeds || "—"}
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
              <span className="text-muted-foreground">Publisher:</span>{" "}
              {input.unit.publisher || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Claimed level:</span>{" "}
              {input.unit.claimedLevel || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Unit:</span> {input.unit.unitTitle}
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

      {/* Context-fit + strengths/weaknesses */}
      <Card className="print-card">
        <CardHeader>
          <CardTitle className="text-base">Context-fit judgment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{report.contextFitJudgment}</p>
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

      {/* Category feedback */}
      <Card className="print-card">
        <CardHeader>
          <CardTitle className="text-base">Evidence-based comments by category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.categoryFeedback.map((c, idx) => (
            <div key={idx} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-foreground">{c.category}</h4>
                <div className="flex items-center gap-2">
                  {c.sourceAnchors.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Literature basis: {sourceLabels(c.sourceAnchors).join(", ")}
                    </span>
                  )}
                  <Badge variant={scoreBadgeVariant(c.score)}>
                    {c.score > 0 ? `${c.score.toFixed(2)}/5` : "not rated"}
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
                  <span className="font-medium text-foreground">Adaptation need: </span>
                  {c.adaptationNeed}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Adaptation plan */}
      <Card className="print-card">
        <CardHeader>
          <CardTitle className="text-base">Adaptation plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanList title="What to keep" items={report.adaptationPlan.keep} />
          <PlanList title="What to cut" items={report.adaptationPlan.cut} />
          <PlanList title="What to simplify" items={report.adaptationPlan.simplify} />
          <PlanList title="What to supplement" items={report.adaptationPlan.supplement} />
          <PlanList title="What to reorder" items={report.adaptationPlan.reorder} />
        </CardContent>
      </Card>

      {/* Supplementary tasks */}
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
                <span className="text-muted-foreground">Materials:</span> {t.materials}
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

      {/* Implementation + limitations */}
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
