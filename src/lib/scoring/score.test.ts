import { describe, it, expect } from "vitest";
import { computeScoreProfile, scoreLabel, SCORE_BANDS } from "@/lib/scoring/score";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import type { RatingsByCategory, Rating } from "@/lib/types";

describe("scoreLabel", () => {
  it("maps each band to the documented label", () => {
    expect(scoreLabel(0)).toBe("Not yet rated");
    expect(scoreLabel(1.0)).toBe("Very weak fit");
    expect(scoreLabel(1.9)).toBe("Very weak fit");
    expect(scoreLabel(2.0)).toBe("Needs substantial adaptation");
    expect(scoreLabel(2.9)).toBe("Needs substantial adaptation");
    expect(scoreLabel(3.0)).toBe("Usable with adaptation");
    expect(scoreLabel(3.6)).toBe("Usable with adaptation");
    expect(scoreLabel(3.7)).toBe("Strong fit");
    expect(scoreLabel(4.4)).toBe("Strong fit");
    expect(scoreLabel(4.5)).toBe("Excellent fit");
    expect(scoreLabel(5.0)).toBe("Excellent fit");
  });

  it("exposes the documented score bands", () => {
    expect(SCORE_BANDS).toHaveLength(5);
    expect(SCORE_BANDS[0]).toMatchObject({ min: 1.0, max: 1.9 });
  });
});

function ratingsFor(values: Record<string, Rating[]>): RatingsByCategory {
  const out: RatingsByCategory = {};
  for (const cat of COURSEMAP_CORE.categories) {
    const vals = values[cat.id];
    const ratings: Record<string, Rating> = {};
    if (vals) {
      cat.criteria.forEach((cr, i) => {
        if (vals[i] !== undefined) ratings[cr.id] = vals[i];
      });
    }
    out[cat.id] = { categoryId: cat.id, ratings, evidenceNote: "", adaptationNote: "" };
  }
  return out;
}

describe("computeScoreProfile", () => {
  it("returns zero overall when nothing is rated", () => {
    const profile = computeScoreProfile(COURSEMAP_CORE, ratingsFor({}));
    expect(profile.overallScore).toBe(0);
    expect(profile.label).toBe("Not yet rated");
    expect(profile.categoryScores).toHaveLength(COURSEMAP_CORE.categories.length);
  });

  it("averages criteria within a category and ignores unrated categories in the overall", () => {
    const first = COURSEMAP_CORE.categories[0];
    const profile = computeScoreProfile(
      COURSEMAP_CORE,
      ratingsFor({ [first.id]: [4, 2, 3] }),
    );
    const cat = profile.categoryScores.find((c) => c.categoryId === first.id)!;
    expect(cat.score).toBe(3); // (4+2+3)/3
    // only one category rated, so overall equals that category
    expect(profile.overallScore).toBe(3);
  });

  it("computes overall as the mean of rated category scores", () => {
    const [a, b] = COURSEMAP_CORE.categories;
    const profile = computeScoreProfile(
      COURSEMAP_CORE,
      ratingsFor({ [a.id]: [5, 5, 5], [b.id]: [1, 1, 1] }),
    );
    expect(profile.overallScore).toBe(3); // mean of 5 and 1
  });
});
