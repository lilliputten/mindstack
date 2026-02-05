'use server';

import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { hourMs } from '@/constants/datetime';

import { recentTopicsCount } from '../constants';

/** Auto-revalidate every hour (in seconds) */
const revalidateTimeoutSec = Math.round(hourMs / 1000);

interface TParams {
  take?: number;
  locale?: string; // TODO: To use locale in sort order calculation
}

export async function getRecentTopics({ take = recentTopicsCount, locale }: TParams) {
  try {
    // NOTE: Don't use `getAvailableTopics`, because it uses nextjs context
    // (`auth`, for example, what is unavailable during edge/SSG, if called from
    // `generateStaticParams`)
    const where: Prisma.TopicWhereInput = {
      isPublic: true,
      ...(locale && {
        OR: [{ langCode: locale }, { langCode: null }, { langCode: '' }],
      }),
    };

    const orderBy: Prisma.TopicOrderByWithRelationInput[] = [
      // { langCode: locale } // ???
      { createdAt: 'desc' },
    ];

    const topics = await prisma.topic.findMany({
      where,
      orderBy,
      take,
      include: {
        _count: {
          select: { questions: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            grade: true,
          },
        },
        categories: {
          select: {
            id: true,
          },
        },
      },
    });

    return topics;
  } catch (error) {
    const message = 'Failed to get recent topics';
    const details = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[getRecentTopics:SCOPE_getRecentTopics]', message, details, {
      error,
      take,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}

export const getCachedRecentTopics = async ({ take = recentTopicsCount }: TParams) => {
  const cachedFn = unstable_cache(
    async () => getRecentTopics({ take }),
    ['recent-topics', `take-${take}`],
    {
      tags: [
        // Cache keys to invalidate
        `recent-topics-take-${take}`,
        'recent-topics-all',
      ],
      revalidate: revalidateTimeoutSec,
    },
  );
  return cachedFn();
};
