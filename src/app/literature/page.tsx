import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sourcesByCategory } from "@/lib/frameworks/literature-basis";

export const metadata: Metadata = {
  title: "Literature basis",
};

function typeVariant(t: string): "default" | "secondary" | "muted" {
  if (t === "core") return "default";
  if (t === "ethics") return "secondary";
  return "muted";
}

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
  const grouped = sourcesByCategory();

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
              The criteria are <strong>original and synthesized</strong>, not copied from
              any copyrighted checklist.
            </li>
            <li>
              Evaluation is <strong>decision support</strong>, not an absolute verdict.
            </li>
            <li>Teachers should always apply professional judgment.</li>
            <li>AI-generated suggestions should be reviewed before classroom use.</li>
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
          <CardTitle>How to read source labels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          <p>
            Throughout CourseMap you will see compact labels such as{" "}
            <Badge variant="muted">Ellis</Badge> or{" "}
            <Badge variant="muted">CEFR (2020)</Badge>. These are{" "}
            <strong>source anchors</strong> — they indicate the principle a criterion or
            suggestion draws on. They are not quotations or citations of specific pages.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <Badge variant="default">core</Badge> coursebook evaluation &amp; materials
            development
            <Badge variant="muted">supporting</Badge> skills, tasks, vocabulary, CEFR
            <Badge variant="secondary">ethics</Badge> responsible, human-in-the-loop AI
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>References by category (APA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {group.category}
              </h3>
              <ul className="space-y-3 text-sm text-foreground">
                {group.sources.map((s) => (
                  <li key={s.key} className="pl-8 -indent-8 leading-relaxed">
                    <Badge
                      variant={typeVariant(s.sourceType)}
                      className="mr-1 align-middle"
                    >
                      {s.sourceType}
                    </Badge>
                    {s.apa}
                    {s.caution && (
                      <span className="ml-1 text-xs italic text-muted-foreground">
                        — {s.caution}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Author attributions indicate the principles behind each criterion. CourseMap does
        not reproduce text from these sources and does not fabricate quotations, page
        numbers, or DOIs. AI-supported interpretation must use sources only as general
        theoretical support.
      </p>
    </div>
  );
}
