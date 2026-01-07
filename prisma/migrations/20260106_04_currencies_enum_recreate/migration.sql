-- Add EUR CurrencyType enum value, if absent
ALTER TYPE "CurrencyType" ADD VALUE IF NOT EXISTS 'EUR';
