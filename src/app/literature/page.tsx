import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LITERATURE_SOURCES } from "@/lib/frameworks/literature-basis";

export const metadata: Metadata = {
  title: "Literature basis — CourseMap",
};

const usage = [
  ["Cunningsworth & McGrath", "Coursebook evaluation and context fit."],
  ["Tomlinson", "Materials-development principles and learner engagement."],
  ["Richards & Graves", "Curriculum and syllabus alignment."],
  ["Nation", "Vocabulary, reading and input demands."],
  ["Ellis & Nunan", "Task quality and communicative value."],
  ["CEFR (2001, 2020)", "Proficiency alignment."],
  ["McDonough, Shaw & Masuhara", "Adaptation decisions."],
  ["Mishan & Timmis", "TESOL materials-development perspectives."],
  ["Littlejohn", "Principled analysis of materials beneath the surface."],
];

export default function LiteraturePage() {
  const references = Object.values(LITERATURE_SOURCES)
    .map((s) => s.apa)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Literature basis</h1>
        <p className="max-w-prose text-muted-foreground">
          CourseMap is grounded in established ELT / TESOL materials-evaluation
          literature.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How CourseMap is grounded</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              The criteria are <strong>original and synthesized</strong>, not copied
              from any copyrighted checklist.
            </li>
            <li>
              Evaluation is <strong>decision support</strong>, not an absolute verdict.
            </li>
            <li>Teachers should always apply professional judgment.</li>
            <li>
              AI-generated suggestions should be reviewed before classroom use.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How CourseMap uses the literature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {usage.map(([who, what]) => (
              <div key={who} className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold text-foreground">{who}</p>
                <p className="text-sm text-muted-foreground">{what}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>References (APA)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-foreground">
            {references.map((r) => (
              <li key={r} className="pl-8 -indent-8 leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Author attributions are used to indicate the principles behind each
        criterion. CourseMap does not reproduce text from these sources and does not
        fabricate quotations or page numbers.
      </p>
    </div>
  );
}
