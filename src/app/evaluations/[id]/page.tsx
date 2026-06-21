import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { toInput, toReport } from "@/lib/db/serialize";
import { generateFallbackReport } from "@/lib/report/fallback";
import { ReportView } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: params.id },
  });
  if (!evaluation) notFound();

  const input = toInput(evaluation);
  // Use the stored report; regenerate a fallback if it is somehow missing.
  const report = toReport(evaluation) ?? generateFallbackReport(input);

  return <ReportView input={input} report={report} evaluationId={evaluation.id} />;
}
