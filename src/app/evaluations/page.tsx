import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { toSummary } from "@/lib/db/serialize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryRowActions } from "@/components/history-row-actions";
import { formatDate } from "@/lib/utils";
import { scoreLabel } from "@/lib/scoring/score";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evaluation history — CourseMap",
};

function scoreVariant(score: number): "muted" | "danger" | "warning" | "success" {
  if (!score) return "muted";
  if (score < 3) return "danger";
  if (score < 3.7) return "warning";
  return "success";
}

export default async function HistoryPage() {
  const rows = (await prisma.evaluation.findMany({ orderBy: { createdAt: "desc" } })).map(
    toSummary,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluation history</h1>
          <p className="text-muted-foreground">
            Saved evaluations stored locally on this machine.
          </p>
        </div>
        <Button asChild>
          <Link href="/evaluations/new">
            <FilePlus2 className="h-4 w-4" /> New evaluation
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No evaluations yet.{" "}
            <Link href="/evaluations/new" className="text-primary underline">
              Create your first one
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Coursebook</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Level</th>
                    <th className="px-4 py-3 font-medium">Overall</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {r.coursebookName}
                      </td>
                      <td className="px-4 py-3">{r.unitTitle}</td>
                      <td className="px-4 py-3">{r.learnerLevel}</td>
                      <td className="px-4 py-3">
                        {r.overallScore ? (
                          <Badge variant={scoreVariant(r.overallScore)}>
                            {r.overallScore.toFixed(2)} · {scoreLabel(r.overallScore)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <HistoryRowActions
                          id={r.id}
                          label={`${r.coursebookName} — ${r.unitTitle}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
