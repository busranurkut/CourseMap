import type { Metadata } from "next";
import { EvaluationForm } from "@/components/forms/evaluation-form";
import { EthicsNote } from "@/components/ethics-note";

export const metadata: Metadata = {
  title: "New evaluation — CourseMap",
};

export default function NewEvaluationPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">New evaluation</h1>
        <p className="max-w-prose text-muted-foreground">
          Describe your teaching context, add the coursebook unit, and rate it
          against the CourseMap Core Framework. Then generate an evidence-based
          report and adaptation plan.
        </p>
      </div>
      <EthicsNote />
      <EvaluationForm />
    </div>
  );
}
