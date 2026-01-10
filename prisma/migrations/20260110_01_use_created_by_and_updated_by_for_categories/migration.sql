/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropIndex
DROP INDEX "categories_user_id_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "imageUrl",
DROP COLUMN "user_id",
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "categories"("status");
