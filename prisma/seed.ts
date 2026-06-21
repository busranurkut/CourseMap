import { PrismaClient } from "@prisma/client";
import { COURSEMAP_CORE } from "../src/lib/frameworks/coursemap-core";
import { generateFallbackReport } from "../src/lib/report/fallback";
import type { RatingsByCategory, Rating } from "../src/lib/types";

const prisma = new PrismaClient();

// Fictional sample data ONLY. No copyrighted coursebook text.
const SAMPLE_RATINGS: Record<string, number> = {
  "context-fit": 4,
  "syllabus-alignment": 3,
  "level-cognitive-load": 3,
  "skills-balance": 3,
  "communicative-value": 2,
  "text-quality": 4,
  "task-sequencing": 3,
  "vocab-grammar": 3,
  engagement: 4,
  "cultural-inclusive": 4,
  "assessment-alignment": 2,
  adaptability: 4,
};

function buildRatings(): RatingsByCategory {
  const ratings: RatingsByCategory = {};
  for (const cat of COURSEMAP_CORE.categories) {
    const base = (SAMPLE_RATINGS[cat.id] ?? 3) as Rating;
    const r: Record<string, Rating> = {};
    cat.criteria.forEach((cr, i) => {
      // small spread around the base so category averages look realistic
      const v = Math.min(5, Math.max(1, base + (i === 1 ? 1 : 0) - (i === 2 ? 1 : 0)));
      r[cr.id] = v as Rating;
    });
    ratings[cat.id] = {
      categoryId: cat.id,
      ratings: r,
      evidenceNote:
        cat.id === "communicative-value"
          ? "Most tasks are comprehension and controlled practice; little freer production."
          : "",
      adaptationNote:
        cat.id === "assessment-alignment"
          ? "No exam-style writing task; our learners face an academic writing exam."
          : "",
    };
  }
  return ratings;
}

async function main() {
  const ratings = buildRatings();

  const input = {
    context: {
      institutionType: "University prep school",
      learnerLevel: "B1",
      learnerProfile:
        "First-year university prep students preparing for English-medium study; motivated but with weak speaking confidence.",
      weeklyHours: 6,
      courseDuration: "14-week semester",
      courseGoal: "Academic English",
      examAlignment:
        "In-house academic reading and writing exam; speaking assessed via short presentations.",
      learnerNeeds:
        "Academic reading strategies, paragraph writing, fluency in discussion.",
      constraints: "Large classes (28), exam pressure, mixed levels.",
    },
    unit: {
      coursebookName: "Sample English B1",
      publisher: "CourseMap Sample Press (fictional)",
      claimedLevel: "B1",
      unitTitle: "Unit 4: Urban Life",
      unitSkills: ["Reading", "Vocabulary", "Speaking", "Writing"],
      unitTopic: "City problems and solutions",
      unitText:
        "Fictional unit summary: The unit opens with a vocabulary set on city life and a short reading about common urban problems (traffic, housing, green space). Comprehension questions follow, then a controlled grammar focus on comparatives. The unit closes with a short paragraph-writing task describing a city. This is an original summary written for demonstration; no real coursebook text is included.",
      teacherNotes:
        "Reading is relevant but follow-up stays comprehension-based; no real discussion or exam-style writing.",
    },
    ratings,
  };

  const report = generateFallbackReport(input);

  // Avoid duplicate sample rows on repeated seeds.
  await prisma.evaluation.deleteMany({
    where: { coursebookName: "Sample English B1", unitTitle: "Unit 4: Urban Life" },
  });

  await prisma.evaluation.create({
    data: {
      institutionType: input.context.institutionType,
      learnerLevel: input.context.learnerLevel,
      learnerProfile: input.context.learnerProfile,
      weeklyHours: input.context.weeklyHours,
      courseDuration: input.context.courseDuration,
      courseGoal: input.context.courseGoal,
      examAlignment: input.context.examAlignment,
      learnerNeeds: input.context.learnerNeeds,
      constraints: input.context.constraints,
      coursebookName: input.unit.coursebookName,
      publisher: input.unit.publisher,
      claimedLevel: input.unit.claimedLevel,
      unitTitle: input.unit.unitTitle,
      unitSkills: JSON.stringify(input.unit.unitSkills),
      unitTopic: input.unit.unitTopic,
      unitText: input.unit.unitText,
      teacherNotes: input.unit.teacherNotes,
      ratingsJson: JSON.stringify(ratings),
      reportJson: JSON.stringify(report),
      overallScore: report.scoreProfile.overallScore,
      generatedBy: "fallback",
    },
  });

  console.log("Seeded 1 sample evaluation:", input.unit.coursebookName, input.unit.unitTitle);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
