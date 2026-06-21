import type {
  Framework,
  RatingsByCategory,
  ScoreProfile,
  CategoryScore,
} from "@/lib/types";

/** Map an overall (or category) score to a human-readable fit label. */
export function scoreLabel(score: number): string {
  if (score <= 0) return "Not yet rated";
  if (score < 2.0) return "Very weak fit";
  if (score < 3.0) return "Needs substantial adaptation";
  if (score < 3.7) return "Usable with adaptation";
  if (score < 4.5) return "Strong fit";
  return "Excellent fit";
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Average of a category's criteria ratings (0 if none rated). */
function averageCategoryScore(ratings: Record<string, number>): number {
  const values = Object.values(ratings).filter((v) => v > 0);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Compute the full score profile from a framework + user ratings.
 * Category score = average of its rated criteria.
 * Overall score = average of rated category scores.
 */
export function computeScoreProfile(
  framework: Framework,
  ratings: RatingsByCategory,
): ScoreProfile {
  const categoryScores: CategoryScore[] = framework.categories.map((cat) => {
    const catRatings = ratings[cat.id]?.ratings ?? {};
    const score = round(averageCategoryScore(catRatings));
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      score,
      sourceAnchors: cat.sourceAnchors,
    };
  });

  const rated = categoryScores.filter((c) => c.score > 0);
  const overallScore =
    rated.length === 0
      ? 0
      : round(rated.reduce((a, c) => a + c.score, 0) / rated.length);

  return {
    categoryScores,
    overallScore,
    label: scoreLabel(overallScore),
  };
}

export const SCORE_BANDS = [
  { min: 1.0, max: 1.9, label: "Very weak fit" },
  { min: 2.0, max: 2.9, label: "Needs substantial adaptation" },
  { min: 3.0, max: 3.6, label: "Usable with adaptation" },
  { min: 3.7, max: 4.4, label: "Strong fit" },
  { min: 4.5, max: 5.0, label: "Excellent fit" },
];
