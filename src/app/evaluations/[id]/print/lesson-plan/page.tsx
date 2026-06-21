import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { toInput, toReport } from "@/lib/db/serialize";
import { generateFallbackReport } from "@/lib/report/fallback";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function LessonPlanPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: params.id } });
  if (!evaluation) notFound();

  const input = toInput(evaluation);
  const report = toReport(evaluation) ?? generateFallbackReport(input);
  const lp = report.lessonPlan;

  if (!lp) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          No lesson plan is available for this evaluation.
        </p>
        <Link href={`/evaluations/${params.id}`} className="text-primary underline">
          Back to report
        </Link>
      </div>
    );
  }

  return (
    <div className="print-container mx-auto max-w-3xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <Link
          href={`/evaluations/${params.id}`}
          className="text-sm text-primary underline"
        >
          ← Back to report
        </Link>
        <PrintButton />
      </div>

      <header>
        <h1 className="text-2xl font-bold">{lp.title}</h1>
        <p className="text-sm text-muted-foreground">
          {input.unit.coursebookName} — {input.unit.unitTitle}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <div>
          <dt className="inline text-muted-foreground">Level: </dt>
          <dd className="inline">{lp.level}</dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground">Length: </dt>
          <dd className="inline">{lp.lessonLength}</dd>
        </div>
        <div className="col-span-2">
          <dt className="inline text-muted-foreground">Class profile: </dt>
          <dd className="inline">{lp.classProfile}</dd>
        </div>
        <div className="col-span-2">
          <dt className="inline text-muted-foreground">Main aim: </dt>
          <dd className="inline">{lp.mainAim}</dd>
        </div>
      </dl>

      <section>
        <h2 className="mb-1 font-semibold">Subsidiary aims</h2>
        <ul className="list-disc pl-5 text-sm">
          {lp.subsidiaryAims.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-1 font-semibold">Materials</h2>
        <ul className="list-disc pl-5 text-sm">
          {lp.materials.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Procedure</h2>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2">Stage</th>
              <th className="p-2">Time</th>
              <th className="p-2">Aim</th>
              <th className="p-2">Teacher</th>
              <th className="p-2">Student</th>
              <th className="p-2">Interaction</th>
              <th className="p-2">Materials</th>
            </tr>
          </thead>
          <tbody>
            {lp.stages.map((s, i) => (
              <tr key={i} className="border-b border-border align-top">
                <td className="p-2 font-medium">{s.stage}</td>
                <td className="p-2">{s.time}</td>
                <td className="p-2">{s.aim}</td>
                <td className="p-2">{s.teacherAction}</td>
                <td className="p-2">{s.studentAction}</td>
                <td className="p-2">{s.interaction}</td>
                <td className="p-2">{s.materials}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="text-sm">
        <p>
          <span className="text-muted-foreground">Assessment link: </span>
          {lp.assessmentLink}
        </p>
        <p>
          <span className="text-muted-foreground">Homework / extension: </span>
          {lp.homeworkExtension}
        </p>
      </section>
    </div>
  );
}
