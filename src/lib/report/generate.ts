import type { EvaluationInput, GeneratedReport } from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { computeScoreProfile } from "@/lib/scoring/score";
import { generateFallbackReport } from "@/lib/report/fallback";
import { generateAIReport, hasApiKey } from "@/lib/ai/generate";

export interface GenerateResult {
  report: GeneratedReport;
  /** True when the deterministic fallback was used (no key, opted out, or AI error). */
  usedFallback: boolean;
  /** Present when AI was attempted but failed and we fell back. */
  aiError?: string;
}

/**
 * Top-level report generation.
 * Uses the Anthropic API when a key is configured and `useAI` is true,
 * otherwise (or on any failure) uses the deterministic fallback generator.
 */
export async function generateReport(
  input: EvaluationInput,
  useAI: boolean,
): Promise<GenerateResult> {
  const profile = computeScoreProfile(COURSEMAP_CORE, input.ratings);

  if (useAI && hasApiKey()) {
    try {
      const report = await generateAIReport(input, profile);
      return { report, usedFallback: false };
    } catch (err) {
      const aiError = err instanceof Error ? err.message : String(err);
      return { report: generateFallbackReport(input), usedFallback: true, aiError };
    }
  }

  return { report: generateFallbackReport(input), usedFallback: true };
}
