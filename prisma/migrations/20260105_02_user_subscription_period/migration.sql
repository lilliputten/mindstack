-- CreateEnum
CREATE TYPE "UserSubscriptionPeriod" AS ENUM ('MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscription_period" "UserSubscriptionPeriod",
ADD COLUMN     "subscription_started_at" TIMESTAMP(3);
