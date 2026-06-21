import type { Metadata } from "next";
import { DiagnoseForm } from "@/components/forms/diagnose-form";
import { EthicsNote } from "@/components/ethics-note";

export const metadata: Metadata = {
  title: "Fix a unit quickly",
};

export default function DiagnosePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fix a weak unit quickly</h1>
        <p className="max-w-prose text-muted-foreground">
          Problem-first mode: tell CourseMap what is going wrong, and get a fast,
          recipe-driven adaptation plan. For a full, documented evaluation, use{" "}
          <span className="font-medium text-foreground">New evaluation</span> instead.
        </p>
      </div>
      <EthicsNote />
      <DiagnoseForm />
    </div>
  );
}
