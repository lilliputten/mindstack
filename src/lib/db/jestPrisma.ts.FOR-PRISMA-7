// NOTE: Is it required? (Used only for jest.)

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

import 'server-only';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const jestPrisma = new PrismaClient({
  adapter,
  log: ['error'],
});
