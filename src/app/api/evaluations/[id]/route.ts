import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluationFormSchema } from "@/lib/validation";
import { buildEvaluationInput } from "@/lib/report/build-input";
import { generateReport } from "@/lib/report/generate";

export const dynamic = "force-dynamic";

// PUT /api/evaluations/:id — re-validate, regenerate the report, and update the record.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const existing = await prisma.evaluation.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Evaluation not found." }, { status: 404 });
  }

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
    const saved = await prisma.evaluation.update({
      where: { id: params.id },
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
    return NextResponse.json({ id: saved.id, usedFallback, aiError: aiError ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not update evaluation.", detail: String(err) },
      { status: 500 },
    );
  }
}

// DELETE /api/evaluations/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.evaluation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not delete evaluation.", detail: String(err) },
      { status: 404 },
    );
  }
}
