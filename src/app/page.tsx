import Link from "next/link";
import {
  ClipboardCheck,
  Stethoscope,
  Wrench,
  FileDown,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EthicsNote } from "@/components/ethics-note";

const features = [
  {
    icon: ClipboardCheck,
    title: "Evaluate",
    desc: "Rate a coursebook unit against a literature-grounded framework, in relation to your specific teaching context.",
  },
  {
    icon: Stethoscope,
    title: "Diagnose gaps",
    desc: "See a score profile, strengths and weaknesses, and a context-fit judgment based on your ratings and notes.",
  },
  {
    icon: Wrench,
    title: "Adapt",
    desc: "Turn the evaluation into a concrete adaptation plan plus ready-made supplementary task drafts.",
  },
  {
    icon: FileDown,
    title: "Export",
    desc: "Export the full report as Markdown or print it to PDF for appraisal, accreditation or curriculum files.",
  },
];

const steps = [
  "Enter your teaching context",
  "Add the coursebook unit details and summary",
  "Rate the CourseMap Core Framework criteria",
  "Generate an evidence-based report and adaptation plan",
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" /> Literature-grounded ELT materials evaluation
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            CourseMap
          </h1>
          <p className="text-xl font-medium text-primary">
            From coursebook evaluation to actionable adaptation.
          </p>
          <p className="max-w-prose text-muted-foreground">
            CourseMap helps English teachers, materials developers and prep-school
            coordinators evaluate a coursebook unit against their teaching context,
            then turns the evaluation into a practical, documented adaptation plan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/evaluations/new">
                Start evaluation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/literature">See the literature basis</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>A simple, four-step workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <CardTitle className="pt-2 text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <EthicsNote />
    </div>
  );
}
