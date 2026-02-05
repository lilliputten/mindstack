'use server';

import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { TLocale } from '@/i18n/types';
import { hourMs } from '@/constants/datetime';

import { recentCategoriesCount } from '../constants';

/** Auto-revalidate every hour (in seconds) */
const revalidateTimeoutSec = Math.round(hourMs / 1000);

interface TParams {
  take?: number;
  locale?: TLocale;
}

export async function getRecentCategories({ take = recentCategoriesCount, locale }: TParams) {
  try {
    // NOTE: Don't use `getAvailableCategories`, because it uses nextjs context
    // (`auth`, for example, what is unavailable during edge/SSG, if called from
    // `generateStaticParams`)
    const where: Prisma.CategoryWhereInput = {
      status: 'PUBLIC',
    };

    // If locale is specified, only return categories that have translations for this locale
    if (locale) {
      where.translations = {
        some: {
          locale,
        },
      };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ topics: { _count: 'desc' } }, { createdAt: 'desc' }],
      take,
      include: {
        _count: {
          select: { topics: true },
        },
        translations: true,
      },
    });

    return categories;
  } catch (error) {
    const message = 'Failed to get recent categories';
    const details = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[getRecentCategories]', message, details, {
      error,
      locale,
      take,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}

export const getCachedRecentCategories = async ({
  take = recentCategoriesCount,
  locale,
}: TParams) => {
  const localeKey = locale ?? 'all';
  const cachedFn = unstable_cache(
    async () => getRecentCategories({ take, locale }),
    ['recent-categories', `take-${take}`, `locale-${localeKey}`],
    {
      tags: [
        // Cache keys to invalidate
        `recent-categories-take-${take}-locale-${localeKey}`,
        'recent-categories-all',
      ],
      revalidate: revalidateTimeoutSec,
    },
  );
  return cachedFn();
};
