"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { CategoryScore } from "@/lib/types";

// Short labels for axis readability.
function shortName(name: string): string {
  return name
    .replace(" and ", " & ")
    .replace("Reading and Listening", "Texts")
    .replace("Vocabulary and Grammar Treatment", "Vocab/Grammar")
    .replace("Task Sequencing and Lesson Flow", "Sequencing")
    .replace("Engagement, Relevance, and Motivation", "Engagement")
    .replace("Cultural, Social, & Inclusive Content", "Inclusive")
    .replace("Assessment and Exam Alignment", "Assessment")
    .replace("Adaptability & Teacher Usability", "Adaptability")
    .replace("Context & Learner Fit", "Context")
    .replace("Syllabus & Curriculum Alignment", "Syllabus")
    .replace("Language Level & Cognitive Load", "Level/Load")
    .replace("Skills Balance & Integration", "Skills")
    .replace("Communicative & Task Value", "Communicative");
}

function barColor(score: number): string {
  if (score === 0) return "#cbd5e1";
  if (score < 3) return "#dc2626";
  if (score < 3.7) return "#d97706";
  return "#2563eb";
}

export function ScoreChart({ categoryScores }: { categoryScores: CategoryScore[] }) {
  const data = categoryScores.map((c) => ({
    category: shortName(c.categoryName),
    full: c.categoryName,
    score: c.score,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-80 w-full">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Score profile (radar)</p>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.4}
            />
            <Tooltip
              formatter={(v: number) => [`${v}/5`, "Score"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-80 w-full">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Category scores (bar)</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="category"
              width={90}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(v: number) => [`${v}/5`, "Score"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={barColor(d.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
