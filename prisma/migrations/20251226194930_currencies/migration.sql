-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('USD', 'RUB', 'TGSTAR');

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "type" "CurrencyType" NOT NULL DEFAULT 'USD',
    "ratio" DOUBLE PRECISION NOT NULL,
    "updating_now" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currencies_type_key" ON "currencies"("type");

-- Insert default currency values with ratios as on 2025.12.26
INSERT INTO "currencies" ("type", "ratio", "updated_at")
SELECT 'USD', 1, '1970-01-01 00:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM "currencies" WHERE "type" = 'USD');

INSERT INTO "currencies" ("type", "ratio", "updated_at")
SELECT 'TGSTAR', 0.015, '1970-01-01 00:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM "currencies" WHERE "type" = 'TGSTAR');

INSERT INTO "currencies" ("type", "ratio", "updated_at")
SELECT 'RUB', 0.0128, '1970-01-01 00:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM "currencies" WHERE "type" = 'RUB');
