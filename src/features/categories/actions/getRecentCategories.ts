'use server';

import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { hourMs } from '@/constants/datetime';

/** Auto-revalidate every hour (in seconds) */
const revalidateTimeoutSec = Math.round(hourMs / 1000);

const defaultRecentCategoriesCount = 5;

export async function getRecentCategories(take: number = defaultRecentCategoriesCount) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: 'PUBLIC',
      },
      orderBy: [{ topics: { _count: 'desc' } }, { createdAt: 'desc' }],
      take,
      include: {
        _count: {
          select: { topics: true },
        },
        translations: {
          where: {
            locale: 'en', // Only include English translations for testing
          },
        },
      },
    });

    return categories;
  } catch (error) {
    const message = 'Failed to get recent categories';
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[getRecentCategories]', message, errMsg, { error });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}

export const getCachedRecentCategories = (take: number = defaultRecentCategoriesCount) => {
  const cachedFn = unstable_cache(
    async () => getRecentCategories(take),
    ['recent-categories', `take-${take}`],
    {
      tags: ['recent-categories', `recent-categories-take-${take}`, 'recent-categories-all'],
      revalidate: revalidateTimeoutSec,
    },
  );
  return cachedFn();
};
