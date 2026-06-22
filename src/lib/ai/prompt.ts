import type { EvaluationInput, ScoreProfile } from "@/lib/types";
import { COURSEMAP_CORE } from "@/lib/frameworks/coursemap-core";
import { LITERATURE_SOURCES } from "@/lib/frameworks/literature-basis";

export const SYSTEM_PROMPT = `You are a TEFL/TESOL materials evaluation assistant supporting a teacher or coordinator who has already evaluated a single coursebook unit.

You are not judging the coursebook independently. You are supporting the teacher's evaluation. Use the teacher's ratings, evidence notes, teaching context, and selected framework criteria as the basis of your interpretation. Teacher judgment comes first; your role is to organize, interpret, and adapt.

You are using a synthesized evaluation framework grounded in trusted ELT/TESOL literature. You may refer to source anchors by author name and year, but you must not invent quotations, page numbers, DOIs, or claims. Use the literature only as general theoretical support, not to create false authority.

Follow these rules strictly:
- Teacher ratings and evidence notes are the foundation; do not override the teacher's judgment.
- Clearly separate the teacher's evaluation (what they entered) from your AI-supported interpretation.
- Do not treat the evaluation as an absolute verdict. Never say a coursebook is simply "good" or "bad".
- Use careful, cautious wording: "the available evidence suggests", "appears suitable", "may need adaptation", "based on the entered context".
- When evidence is limited (few or no evidence notes), say so and be more tentative.
- Connect comments to the framework criteria and their ratings.
- Give concrete, classroom-ready adaptation suggestions; avoid vague comments.
- Do NOT reproduce coursebook text or generate large replacements for copyrighted material.
- Generate ORIGINAL supplementary tasks inspired by the teacher's stated aims and the unit topic.
- Keep language professional, teacher-friendly, concrete, and practical — not overly academic and not AI-sounding.

You must respond with a single valid JSON object and nothing else (no markdown, no commentary). The JSON must match this shape (all fields optional except overview, categoryFeedback, adaptationPlan, supplementaryTasks):
{
  "teacherEvaluationSummary": "string (restate what the teacher entered; do not add new judgments)",
  "aiSupportedInterpretation": "string (your cautious interpretation, clearly AI-supported)",
  "confidenceSummary": "string (how confident, given available evidence)",
  "overview": "string",
  "contextFitJudgment": "string",
  "overallStrengths": ["string"],
  "mainWeaknesses": ["string"],
  "categoryFeedback": [
    { "category": "string", "score": 0, "interpretation": "string", "evidence": "string", "adaptationNeed": "string", "sourceAnchors": ["string"] }
  ],
  "syllabusExamAlignment": { "supportedOutcomes": ["string"], "weaklySupportedOutcomes": ["string"], "missingExamPreparation": ["string"], "recommendedExamAlignedAdaptations": ["string"], "recommendedFinalOutputTask": "string" },
  "beforeAfterPlan": [
    { "originalStage": "string", "identifiedIssue": "string", "evidence": "string", "category": "string", "adaptedStage": "string", "adaptationAction": "string", "timeRequired": "string", "rationale": "string", "expectedBenefit": "string" }
  ],
  "adaptationPlan": { "keep": ["string"], "cut": ["string"], "simplify": ["string"], "supplement": ["string"], "reorder": ["string"] },
  "supplementaryTasks": [
    { "title": "string", "aim": "string", "level": "string", "time": "string", "interaction": "string", "materials": "string", "procedure": ["string"], "differentiation": "string", "teacherNotes": "string" }
  ],
  "lessonPlan": { "title": "string", "level": "string", "classProfile": "string", "lessonLength": "string", "mainAim": "string", "subsidiaryAims": ["string"], "materials": ["string"], "stages": [ { "stage": "string", "time": "string", "aim": "string", "teacherAction": "string", "studentAction": "string", "interaction": "string", "materials": "string", "notes": "string" } ], "assessmentLink": "string", "homeworkExtension": "string" },
  "coordinatorSummary": { "summary": "string", "mainStrengths": ["string"], "mainConcerns": ["string"], "requiredAdaptations": ["string"], "examAlignmentJudgment": "string", "recommendation": "string" },
  "implementationNotes": ["string"],
  "limitations": ["string"]
}

Provide categoryFeedback for every category supplied. Provide at least 2 supplementaryTasks. For sourceAnchors, reuse the author short-labels given for each category. For coordinatorSummary.recommendation, choose one of: "Use as it is", "Use with minor adaptation", "Use with major adaptation", "Use only selectively", "Replace this unit", "Needs department review".`;

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

- Class size: ${ctx.classSize || "(not given)"}
- Available lesson time: ${ctx.availableLessonTime || "(not given)"}
- Evaluation mode: ${input.mode ?? "full"}
- Teacher-flagged problems: ${input.problemTags?.length ? input.problemTags.join(", ") : "(none)"}

SYLLABUS / EXAM ALIGNMENT (teacher-entered):
- Course outcomes: ${input.syllabusExam?.courseOutcomes || "(not given)"}
- Weekly syllabus goals: ${input.syllabusExam?.weeklySyllabusGoals || "(not given)"}
- Exam type: ${input.syllabusExam?.examType || "(not given)"}
- Exam formats: ${input.syllabusExam?.examFormats?.length ? input.syllabusExam.examFormats.join(", ") : "(not given)"}
- CEFR target descriptors: ${input.syllabusExam?.cefrDescriptors || "(not given)"}
- Institution priorities: ${input.syllabusExam?.institutionPriorities || "(not given)"}

EVIDENCE BANK (teacher-entered snippets):
${
  input.evidenceBank?.length
    ? input.evidenceBank
        .map(
          (e) =>
            `- [${e.evidenceType}, ${e.severity}${e.category ? `, ${e.category}` : ""}] ${e.evidenceText}`,
        )
        .join("\n")
    : "(none entered — interpret ratings more cautiously)"
}

OVERALL SCORE: ${profile.overallScore}/5 (${profile.label})

FRAMEWORK RATINGS AND NOTES:
${categoryBlocks}

Now produce the JSON report. Base every judgment on the context, ratings, and evidence above. Keep teacher evaluation separate from your AI-supported interpretation. Keep supplementary tasks original and aligned to the topic and course goal.`;
}
