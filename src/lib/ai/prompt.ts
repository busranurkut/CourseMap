import type { EvaluationInput, ScoreProfile } from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { LITERATURE_SOURCES } from "@/lib/frameworks/literature-basis";

export const SYSTEM_PROMPT = `You are a TEFL/TESOL materials evaluation expert helping a teacher or coordinator evaluate a single coursebook unit and turn the evaluation into a practical adaptation plan.

You are using a synthesized evaluation framework grounded in trusted ELT/TESOL literature. You may refer to source anchors by author name and year, but you must not invent quotations, page numbers, or claims. Use the literature to guide professional evaluation, not to create false authority.

Follow these rules strictly:
- Do not treat the evaluation as an absolute verdict. Never say a coursebook is simply "good" or "bad".
- Use the teacher's stated context as the main basis for judgment.
- Connect your comments to the framework criteria and their ratings.
- Where appropriate, mention relevant source anchors by author name (e.g., "Ellis", "Nation", "CEFR") — but do not fabricate quotations or page numbers, and do not pretend a source proves something it does not.
- Give concrete, actionable adaptation suggestions; avoid vague comments and unsupported claims.
- Use careful wording: "the available evidence suggests", "appears suitable", "may need adaptation", "based on the entered context".
- Do NOT reproduce coursebook text or generate large replacements for copyrighted material.
- Generate ORIGINAL supplementary tasks inspired by the teacher's stated aims and the unit topic.
- Keep language professional, teacher-friendly, concrete, and practical — not overly academic and not AI-sounding.

You must respond with a single valid JSON object and nothing else (no markdown, no commentary). The JSON must match exactly this shape:
{
  "overview": "string",
  "contextFitJudgment": "string",
  "overallStrengths": ["string"],
  "mainWeaknesses": ["string"],
  "categoryFeedback": [
    { "category": "string", "score": 0, "interpretation": "string", "evidence": "string", "adaptationNeed": "string", "sourceAnchors": ["string"] }
  ],
  "adaptationPlan": { "keep": ["string"], "cut": ["string"], "simplify": ["string"], "supplement": ["string"], "reorder": ["string"] },
  "supplementaryTasks": [
    { "title": "string", "aim": "string", "level": "string", "time": "string", "interaction": "string", "materials": "string", "procedure": ["string"], "differentiation": "string", "teacherNotes": "string" }
  ],
  "implementationNotes": ["string"],
  "limitations": ["string"]
}

Provide categoryFeedback for every category supplied. Provide at least 2 supplementaryTasks. For sourceAnchors, reuse the author short-labels given for each category.`;

export function buildUserPrompt(input: EvaluationInput, profile: ScoreProfile): string {
  const ctx = input.context;
  const unit = input.unit;

  const categoryBlocks = COURSEMAP_CORE.categories
    .map((cat) => {
      const cs = profile.categoryScores.find((c) => c.categoryId === cat.id);
      const note = input.ratings[cat.id];
      const anchors = cat.sourceAnchors
        .map((a) => LITERATURE_SOURCES[a]?.short ?? a)
        .join(", ");
      const critLines = cat.criteria
        .map((cr) => {
          const r = note?.ratings?.[cr.id];
          return `    - [${r ? `${r}/5` : "not rated"}] ${cr.criterion}`;
        })
        .join("\n");
      return `- Category: ${cat.name} (avg ${cs?.score ?? 0}/5) | Literature basis: ${anchors}
${critLines}
    Teacher evidence note: ${note?.evidenceNote?.trim() || "(none)"}
    Teacher adaptation note: ${note?.adaptationNote?.trim() || "(none)"}`;
    })
    .join("\n");

  return `TEACHING CONTEXT
- Institution type: ${ctx.institutionType}
- Learner level: ${ctx.learnerLevel}
- Learner profile: ${ctx.learnerProfile || "(not given)"}
- Weekly hours: ${ctx.weeklyHours ?? "(not given)"}
- Course duration: ${ctx.courseDuration || "(not given)"}
- Main course goal: ${ctx.courseGoal}
- Assessment / exam alignment: ${ctx.examAlignment || "(not given)"}
- Learner needs: ${ctx.learnerNeeds || "(not given)"}
- Constraints: ${ctx.constraints || "(not given)"}

COURSEBOOK UNIT
- Coursebook: ${unit.coursebookName}
- Publisher: ${unit.publisher || "(not given)"}
- Level claimed by publisher: ${unit.claimedLevel || "(not given)"}
- Unit: ${unit.unitTitle}
- Topic: ${unit.unitTopic || "(not given)"}
- Skills covered: ${unit.unitSkills.length ? unit.unitSkills.join(", ") : "(not given)"}
- Teacher notes: ${unit.teacherNotes || "(none)"}

UNIT SUMMARY / TEXT (teacher-provided; do not reproduce verbatim in your output):
"""
${unit.unitText}
"""

OVERALL SCORE: ${profile.overallScore}/5 (${profile.label})

FRAMEWORK RATINGS AND NOTES:
${categoryBlocks}

Now produce the JSON report. Base every judgment on the context and ratings above. Keep supplementary tasks original and aligned to the topic and course goal.`;
}
