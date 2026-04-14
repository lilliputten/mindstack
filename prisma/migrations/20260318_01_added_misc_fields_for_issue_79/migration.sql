-- AlterTable
ALTER TABLE "ai_generations" ADD COLUMN     "debugMode" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "extra_query" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "extra_query" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "expose_achievements" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_signed_in" TIMESTAMP(3);
