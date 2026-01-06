'use server';

import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { dayMs } from '@/constants/datetime';

export async function immediatelyCleanStaleUserPayments(minAge: number = dayMs) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }
    const beforeTime = new Date(Date.now() - minAge);
    const result = await prisma.userPayment.deleteMany({
      where: {
        userId: user.id,
        status: {
          in: ['PENDING', 'CANCELED', 'FAILED'],
        },
        createdAt: {
          lt: beforeTime,
        },
      },
    });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[immediatelyCleanStaleUserPayments] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}

export const cleanStaleUserPayments = async (minAge: number = dayMs) => {
  const cachedFn = unstable_cache(
    async () => immediatelyCleanStaleUserPayments(dayMs),
    ['clean-stale-payments'],
    {
      tags: ['clean-stale-payments'],
      revalidate: Math.round(minAge / 1000), // Revalidate period (in seconds)
    },
  );
  return cachedFn();
};
