-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionType" TEXT NOT NULL,
    "learnerLevel" TEXT NOT NULL,
    "learnerProfile" TEXT,
    "weeklyHours" INTEGER,
    "courseDuration" TEXT,
    "courseGoal" TEXT NOT NULL,
    "examAlignment" TEXT,
    "learnerNeeds" TEXT,
    "constraints" TEXT,
    "coursebookName" TEXT NOT NULL,
    "publisher" TEXT,
    "claimedLevel" TEXT,
    "unitTitle" TEXT NOT NULL,
    "unitSkills" TEXT,
    "unitTopic" TEXT,
    "unitText" TEXT,
    "teacherNotes" TEXT,
    "ratingsJson" TEXT NOT NULL,
    "reportJson" TEXT,
    "overallScore" DOUBLE PRECISION,
    "generatedBy" TEXT NOT NULL DEFAULT 'fallback',

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

