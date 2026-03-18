-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "extra_query" DROP NOT NULL,
ALTER COLUMN "extra_query" DROP DEFAULT;

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "extra_query" DROP NOT NULL,
ALTER COLUMN "extra_query" DROP DEFAULT;
