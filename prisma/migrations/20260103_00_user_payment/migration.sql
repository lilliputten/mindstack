-- CreateEnum
CREATE TYPE "UserPaymentProvider" AS ENUM ('YOOKASSA', 'STRIPE');

-- CreateEnum
CREATE TYPE "UserPaymentStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCEED');

-- CreateTable
CREATE TABLE "user_payments" (
    "user_id" TEXT NOT NULL,
    "provider" "UserPaymentProvider" NOT NULL DEFAULT 'YOOKASSA',
    "payment_id" TEXT NOT NULL,
    "unique_key" TEXT NOT NULL,
    "status" "UserPaymentStatus" NOT NULL,
    "subscription_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "user_provider_unique_created" ON "user_payments"("user_id", "provider", "unique_key", "created_at");

-- CreateIndex
CREATE INDEX "status_created" ON "user_payments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_payment_unique" ON "user_payments"("user_id", "provider", "payment_id", "unique_key");

-- AddForeignKey
ALTER TABLE "user_payments" ADD CONSTRAINT "user_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
