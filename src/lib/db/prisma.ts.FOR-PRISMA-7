import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  cachedPrisma: PrismaClient | undefined;
};

const isJest = process.env.JEST_WORKER_ID !== undefined;
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.cachedPrisma ??
  new PrismaClient({
    adapter,
    log: isProduction
      ? ['error']
      : [
          // 'query',
          'error',
          'warn',
        ],
  });

if (!isProduction && !isJest) {
  globalForPrisma.cachedPrisma = prisma;
}

export default prisma;
