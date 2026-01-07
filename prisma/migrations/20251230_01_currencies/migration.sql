-- Create CurrencyType enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CurrencyType') THEN
        CREATE TYPE "CurrencyType" AS ENUM ('USD', 'EUR', 'RUB', 'TGSTAR');
    END IF;
END $$;

-- Create table only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'currencies' AND schemaname = 'public') THEN
        CREATE TABLE "currencies" (
            "id" SERIAL NOT NULL,
            "type" "CurrencyType" NOT NULL DEFAULT 'USD',
            "ratio" DOUBLE PRECISION NOT NULL,
            "updating_since" TIMESTAMP(3),
            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Create unique index only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'currencies_type_key' AND tablename = 'currencies') THEN
        CREATE UNIQUE INDEX "currencies_type_key" ON "currencies"("type");
    END IF;
END $$;
