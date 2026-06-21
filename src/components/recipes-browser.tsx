"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ADAPTATION_RECIPES } from "@/lib/adaptation/recipes";
import { sourceLabels } from "@/lib/frameworks/literature-basis";
import type { PrepLevel } from "@/lib/types";

const SKILLS = ["Reading", "Listening", "Speaking", "Writing", "Grammar", "Vocabulary"];
const PREP_LEVELS: PrepLevel[] = ["No prep", "Low prep", "Medium prep"];

const ALL_PROBLEM_TAGS = Array.from(
  new Set(ADAPTATION_RECIPES.flatMap((r) => r.problemTags)),
).sort();

export function RecipesBrowser() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [prep, setPrep] = useState("");
  const [problem, setProblem] = useState("");

  const filtered = useMemo(() => {
    return ADAPTATION_RECIPES.filter((r) => {
      if (
        query &&
        !`${r.title} ${r.whenToUse}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (skill && !r.skills.includes(skill)) return false;
      if (prep && r.prepLevel !== prep) return false;
      if (problem && !r.problemTags.includes(problem)) return false;
      return true;
    });
  }, [query, skill, prep, problem]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search recipes"
        />
        <Select
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          aria-label="Problem"
        >
          <option value="">Any problem</option>
          {ALL_PROBLEM_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          aria-label="Skill"
        >
          <option value="">Any skill</option>
          {SKILLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={prep}
          onChange={(e) => setPrep(e.target.value)}
          aria-label="Prep time"
        >
          <option value="">Any prep level</option>
          {PREP_LEVELS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} recipe{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{r.title}</CardTitle>
                <div className="flex gap-1">
                  <Badge variant="secondary">{r.prepLevel}</Badge>
                  <Badge variant="muted">{r.timeNeeded}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{r.whenToUse}</p>
              <div>
                <p className="font-medium text-foreground">Procedure</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {r.procedure.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Differentiation: </span>
                {r.differentiation}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {r.skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
              {r.sourceAnchors.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Literature basis: {sourceLabels(r.sourceAnchors).join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
