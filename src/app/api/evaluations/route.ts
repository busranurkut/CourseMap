import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { toSummary } from "@/lib/db/serialize";
import { evaluationFormSchema } from "@/lib/validation";
import { buildEvaluationInput } from "@/lib/report/build-input";
import { generateReport } from "@/lib/report/generate";
import { checkRateLimit, maybeSweep } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/evaluations — list saved evaluations (summaries).
export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ evaluations: evaluations.map(toSummary) });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not load evaluations.", detail: String(err) },
      { status: 500 },
    );
  }
}

// POST /api/evaluations — validate, generate report, persist, return the record.
export async function POST(req: NextRequest) {
  maybeSweep();
  const limited = checkRateLimit(req, { scope: "create", limit: 8, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = evaluationFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const values = parsed.data;
  const input = buildEvaluationInput(values);

  const { report, usedFallback, aiError } = await generateReport(input, values.useAI);

  try {
    const saved = await prisma.evaluation.create({
      data: {
        institutionType: values.institutionType,
        learnerLevel: values.learnerLevel,
        learnerProfile: values.learnerProfile,
        weeklyHours: values.weeklyHours,
        courseDuration: values.courseDuration,
        courseGoal: values.courseGoal,
        examAlignment: values.examAlignment,
        learnerNeeds: values.learnerNeeds,
        constraints: values.constraints,
        coursebookName: values.coursebookName,
        publisher: values.publisher,
        claimedLevel: values.claimedLevel,
        unitTitle: values.unitTitle,
        unitSkills: JSON.stringify(values.unitSkills),
        unitTopic: values.unitTopic,
        unitText: values.unitText,
        teacherNotes: values.teacherNotes,
        ratingsJson: JSON.stringify(input.ratings),
        reportJson: JSON.stringify(report),
        overallScore: report.scoreProfile.overallScore,
        generatedBy: report.generatedBy,
      },
    });

    return NextResponse.json(
      { id: saved.id, usedFallback, aiError: aiError ?? null },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Could not save evaluation.", detail: String(err) },
      { status: 500 },
    );
  }
}
