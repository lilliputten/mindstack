/*
  Warnings:

  - You are about to drop the column `updating_now` on the `currencies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "currencies" DROP COLUMN "updating_now",
ADD COLUMN     "updating_since" TIMESTAMP(3);
