import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  cachedPrisma: PrismaClient | undefined;
};

const isJest = process.env.JEST_WORKER_ID !== undefined;
const isProduction = process.env.NODE_ENV !== 'development';

export const prisma = globalForPrisma.cachedPrisma ?? new PrismaClient();

if (!isProduction && !isJest) {
  globalForPrisma.cachedPrisma = prisma;
}
