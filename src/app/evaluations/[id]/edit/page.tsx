import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { toFormValues } from "@/lib/db/serialize";
import { EvaluationForm } from "@/components/forms/evaluation-form";
import { EthicsNote } from "@/components/ethics-note";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit evaluation — CourseMap",
};

export default async function EditEvaluationPage({ params }: { params: { id: string } }) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: params.id },
  });
  if (!evaluation) notFound();

  const initialValues = toFormValues(evaluation);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/evaluations/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to report
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit evaluation</h1>
        <p className="max-w-prose text-muted-foreground">
          Update the context, unit, or ratings and save to regenerate the report.{" "}
          {evaluation.coursebookName} — {evaluation.unitTitle}
        </p>
      </div>
      <EthicsNote />
      <EvaluationForm initialValues={initialValues} evaluationId={params.id} />
    </div>
  );
}
