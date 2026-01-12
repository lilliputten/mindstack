/*
  Warnings:

  - You are about to drop the column `categoryId` on the `topics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_categoryId_fkey";

-- CreateTable
CREATE TABLE "_CategoryToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToTopic_B_index" ON "_CategoryToTopic"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToTopic" ADD CONSTRAINT "_CategoryToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTopic" ADD CONSTRAINT "_CategoryToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert existing categoryId into the junction table
INSERT INTO "_CategoryToTopic" ("A", "B")
SELECT "categoryId", "id" FROM "topics" WHERE "categoryId" IS NOT NULL;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "categoryId";
