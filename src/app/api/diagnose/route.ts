import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { diagnoseFormSchema } from "@/lib/validation";
import { generateDiagnoseReport } from "@/lib/report/diagnose";
import { checkRateLimit, maybeSweep } from "@/lib/rate-limit";
import type { EvaluationInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/diagnose — problem-first quick diagnosis, saved as a "diagnose" evaluation.
export async function POST(req: NextRequest) {
  maybeSweep();
  const limited = checkRateLimit(req, { scope: "diagnose", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = diagnoseFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const v = parsed.data;
  const input: EvaluationInput = {
    context: {
      institutionType: "Not specified",
      learnerLevel: v.learnerLevel,
      learnerProfile: "",
      weeklyHours: null,
      courseDuration: "",
      courseGoal: "Not specified",
      examAlignment: "",
      learnerNeeds: "",
      constraints: "",
      classSize: v.classSize,
      availableLessonTime: v.availableLessonTime,
    },
    unit: {
      coursebookName: v.coursebookName || "Untitled coursebook",
      publisher: "",
      claimedLevel: "",
      unitTitle: v.unitTitle || "Untitled unit",
      unitSkills: [],
      unitTopic: v.unitTopic,
      unitText: v.unitText,
      teacherNotes: v.evidenceNotes,
    },
    ratings: {},
    mode: "diagnose",
    problemTags: v.problemTags,
  };

  const report = generateDiagnoseReport(input);

  try {
    const saved = await prisma.evaluation.create({
      data: {
        institutionType: input.context.institutionType,
        learnerLevel: input.context.learnerLevel,
        courseGoal: input.context.courseGoal,
        classSize: v.classSize || null,
        availableLessonTime: v.availableLessonTime || null,
        coursebookName: input.unit.coursebookName,
        unitTitle: input.unit.unitTitle,
        unitTopic: input.unit.unitTopic || null,
        unitText: input.unit.unitText,
        teacherNotes: v.evidenceNotes || null,
        ratingsJson: "{}",
        reportJson: JSON.stringify(report),
        overallScore: 0,
        generatedBy: "fallback",
        mode: "diagnose",
        problemTagsJson: JSON.stringify(v.problemTags),
      },
    });
    return NextResponse.json({ id: saved.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not save diagnosis.", detail: String(err) },
      { status: 500 },
    );
  }
}
