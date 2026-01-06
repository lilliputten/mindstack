-- AlterTable
ALTER TABLE "users" ALTER COLUMN "grade" SET DEFAULT 'BASIC';

-- Update existing users with grade 'GUEST' to 'BASIC'
UPDATE "users" SET "grade" = 'BASIC' WHERE "grade" = 'GUEST';
