import { describe, it, expect } from "vitest";
import { generateFallbackReport } from "@/lib/report/fallback";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import type { EvaluationInput, RatingsByCategory, Rating } from "@/lib/types";

function buildInput(): EvaluationInput {
  const ratings: RatingsByCategory = {};
  for (const cat of COURSEMAP_CORE.categories) {
    const r: Record<string, Rating> = {};
    cat.criteria.forEach((cr) => (r[cr.id] = 3 as Rating));
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
      courseDuration: "14 weeks",
      courseGoal: "Academic English",
      examAlignment: "",
      learnerNeeds: "",
      constraints: "large classes",
    },
    unit: {
      coursebookName: "Sample Book",
      publisher: "",
      claimedLevel: "B1",
      unitTitle: "Unit 1: Travel",
      unitSkills: ["Reading", "Writing"],
      unitTopic: "Travel",
      unitText: "A fictional summary of a travel unit used for testing purposes only.",
      teacherNotes: "",
    },
    ratings,
  };
}

describe("generateFallbackReport", () => {
  const report = generateFallbackReport(buildInput());

  it("is marked as fallback-generated", () => {
    expect(report.generatedBy).toBe("fallback");
  });

  it("produces a category feedback entry for every framework category", () => {
    expect(report.categoryFeedback).toHaveLength(COURSEMAP_CORE.categories.length);
  });

  it("includes at least two original supplementary tasks with procedures", () => {
    expect(report.supplementaryTasks.length).toBeGreaterThanOrEqual(2);
    for (const task of report.supplementaryTasks) {
      expect(task.title).toBeTruthy();
      expect(task.aim).toBeTruthy();
      expect(task.procedure.length).toBeGreaterThan(0);
    }
  });

  it("provides a full adaptation plan", () => {
    const ap = report.adaptationPlan;
    expect(ap.supplement.length).toBeGreaterThan(0);
    expect(ap.reorder.length).toBeGreaterThan(0);
  });

  it("attaches a computed score profile", () => {
    expect(report.scoreProfile.overallScore).toBe(3);
    expect(report.scoreProfile.label).toBe("Usable with adaptation");
  });

  it("avoids absolute verdict language in the overview", () => {
    const text = report.overview.toLowerCase();
    expect(text).not.toContain("this coursebook is bad");
    expect(text).not.toContain("this coursebook is good");
  });
});
