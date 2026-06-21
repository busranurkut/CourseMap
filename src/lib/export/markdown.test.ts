import { describe, it, expect } from "vitest";
import { reportToMarkdown } from "@/lib/export/markdown";
import { generateFallbackReport } from "@/lib/report/fallback";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import type { EvaluationInput, RatingsByCategory, Rating } from "@/lib/types";

function buildInput(): EvaluationInput {
  const ratings: RatingsByCategory = {};
  for (const cat of COURSEMAP_CORE.categories) {
    const r: Record<string, Rating> = {};
    cat.criteria.forEach((cr) => (r[cr.id] = 4 as Rating));
    ratings[cat.id] = {
      categoryId: cat.id,
      ratings: r,
      evidenceNote: "",
      adaptationNote: "",
    };
  }
  return {
    context: {
      institutionType: "University prep school",
      learnerLevel: "B1",
      learnerProfile: "",
      weeklyHours: 6,
      courseDuration: "",
      courseGoal: "Academic English",
      examAlignment: "",
      learnerNeeds: "",
      constraints: "",
    },
    unit: {
      coursebookName: "Sample Book",
      publisher: "",
      claimedLevel: "B1",
      unitTitle: "Unit 1: Travel",
      unitSkills: ["Reading"],
      unitTopic: "Travel",
      unitText: "Fictional unit summary for testing.",
      teacherNotes: "",
    },
    ratings,
  };
}

describe("reportToMarkdown", () => {
  const input = buildInput();
  const md = reportToMarkdown(input, generateFallbackReport(input));

  it("includes the main report headings", () => {
    expect(md).toContain("# CourseMap Evaluation Report");
    expect(md).toContain("## Adaptation plan");
    expect(md).toContain("## Ready-made supplementary tasks");
    expect(md).toContain("## Category scores");
  });

  it("includes the coursebook and unit identifiers", () => {
    expect(md).toContain("Sample Book");
    expect(md).toContain("Unit 1: Travel");
  });

  it("includes the literature framework note", () => {
    expect(md).toContain("decision support");
  });
});
