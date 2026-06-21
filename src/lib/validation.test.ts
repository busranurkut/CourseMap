import { describe, it, expect } from "vitest";
import { evaluationFormSchema } from "@/lib/validation";

const validBase = {
  institutionType: "University prep school",
  learnerLevel: "B1",
  courseGoal: "Academic English",
  coursebookName: "Sample Book",
  unitTitle: "Unit 1",
  unitText: "A sufficiently long fictional unit summary used for validation tests.",
  ratings: {},
};

describe("evaluationFormSchema", () => {
  it("accepts a minimal valid payload and applies defaults", () => {
    const parsed = evaluationFormSchema.parse(validBase);
    expect(parsed.useAI).toBe(true);
    expect(parsed.unitSkills).toEqual([]);
    expect(parsed.weeklyHours).toBeNull();
  });

  it("rejects a missing required field", () => {
    const { institutionType, ...rest } = validBase;
    const result = evaluationFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects too-short unit text", () => {
    const result = evaluationFormSchema.safeParse({
      ...validBase,
      unitText: "too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized unit text (over the 20k cap)", () => {
    const result = evaluationFormSchema.safeParse({
      ...validBase,
      unitText: "x".repeat(20001),
    });
    expect(result.success).toBe(false);
  });

  it("coerces an empty weeklyHours to null", () => {
    const parsed = evaluationFormSchema.parse({ ...validBase, weeklyHours: "" });
    expect(parsed.weeklyHours).toBeNull();
  });

  it("accepts a numeric weeklyHours", () => {
    const parsed = evaluationFormSchema.parse({ ...validBase, weeklyHours: 6 });
    expect(parsed.weeklyHours).toBe(6);
  });
});
