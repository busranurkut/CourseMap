-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "availableLessonTime" TEXT,
ADD COLUMN     "cefrDescriptorsJson" TEXT,
ADD COLUMN     "classSize" TEXT,
ADD COLUMN     "coordinatorRecommendation" TEXT,
ADD COLUMN     "evidenceBankJson" TEXT,
ADD COLUMN     "examFormatsJson" TEXT,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'full',
ADD COLUMN     "problemTagsJson" TEXT,
ADD COLUMN     "syllabusOutcomes" TEXT,
ADD COLUMN     "teacherFinalDecision" TEXT;
