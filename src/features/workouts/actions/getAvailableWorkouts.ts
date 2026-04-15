'use server';

import { ExtendedUser } from '@/@types/next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { ServerAuthError } from '@/lib/errors';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/config';

import { TGetAvailableWorkoutsParams, TGetAvailableWorkoutsResults } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getAvailableWorkouts(
  params: TGetAvailableWorkoutsParams & TOptions = {},
): Promise<TGetAvailableWorkoutsResults> {
  const {
    workoutIds,
    topicIds,
    categoryIds,
    skip,
    take,
    adminMode,
    orderBy = { updatedAt: 'desc' },
    includeUser = false,
    includeTopic = true,
    includeCategories = true,
    includeStats = true,
    // Search parameters
    searchText,
    hasWorkoutStats,
    hasActiveWorkouts,
    minStarted,
    maxStarted,
    minFinished,
    maxFinished,
    // Language parameters
    langCode,
    langName,
    searchLang,
    noDebug,
  } = params;

  if (isDev) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const user: ExtendedUser | undefined = await getCurrentUser();
  const userId = user?.id;
  const isUser = !!userId;
  const isAdmin = user?.role === 'ADMIN';

  const include: Prisma.UserTopicWorkoutInclude = {};
  const where: Prisma.UserTopicWorkoutWhereInput = {};
  const findManyArgs: Prisma.UserTopicWorkoutFindManyArgs = {
    skip,
    take,
    orderBy: orderBy as Prisma.UserTopicWorkoutOrderByWithRelationInput,
    where,
    include,
  };

  try {
    // Authorization checks
    if (!user) {
      throw new ServerAuthError('UNATHORIZED');
    }
    if (adminMode && !isAdmin) {
      throw new ServerAuthError('ADMIN_REQUIRED');
    }

    // Include relations
    if (includeUser) {
      include.user = { select: { id: true, name: true, email: true, image: true } };
    }

    if (includeTopic) {
      include.topic = true;
      if (includeCategories) {
        include.topic = {
          include: {
            categories: true,
          },
        };
      }
    }

    if (includeStats) {
      include.workoutStats = true;
    }

    // Filter conditions
    if (!adminMode && isUser) {
      where.userId = userId;
    }

    if (workoutIds) {
      const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
      where.AND = [...existingAnd, { topicId: { in: workoutIds } }];
    }

    if (topicIds) {
      const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
      where.AND = [...existingAnd, { topicId: { in: topicIds } }];
    }

    if (categoryIds?.length) {
      where.topic = {
        ...((where.topic as Prisma.TopicWhereInput) || {}),
        categories: { some: { id: { in: categoryIds } } },
      };
    }

    // Search text in topic name, description, keywords
    if (searchText) {
      const searchTextStr = String(searchText);
      where.topic = {
        ...((where.topic as Prisma.TopicWhereInput) || {}),
        OR: [
          { name: { contains: searchTextStr, mode: 'insensitive' } },
          { description: { contains: searchTextStr, mode: 'insensitive' } },
          { keywords: { contains: searchTextStr, mode: 'insensitive' } },
        ],
      };
    }

    // Filter by language
    if (langCode) {
      where.topic = {
        ...((where.topic as Prisma.TopicWhereInput) || {}),
        langCode: langCode,
      };
    }

    if (langName) {
      where.topic = {
        ...((where.topic as Prisma.TopicWhereInput) || {}),
        langName: langName,
      };
    }

    // Search in both langCode and langName
    if (searchLang) {
      const langConditions: Prisma.TopicWhereInput[] =
        searchLang.length === 2
          ? [{ langCode: searchLang.toLowerCase() }]
          : [{ langName: { contains: searchLang, mode: 'insensitive' } }];

      const existingTopicConditions = (where.topic as Prisma.TopicWhereInput) || {};
      const mergedConditions = existingTopicConditions.OR
        ? {
            OR: [
              ...(Array.isArray(existingTopicConditions.OR)
                ? existingTopicConditions.OR
                : [existingTopicConditions.OR]),
              ...langConditions,
            ],
          }
        : { OR: langConditions };

      where.topic = {
        ...existingTopicConditions,
        ...mergedConditions,
      };
    }

    // Filter by workout stats existence
    if (hasWorkoutStats !== undefined) {
      if (hasWorkoutStats) {
        where.workoutStats = { some: {} };
      } else {
        where.workoutStats = { none: {} };
      }
    }

    // Filter by active workouts
    if (hasActiveWorkouts !== undefined) {
      if (hasActiveWorkouts) {
        where.started = true;
        where.finished = false;
      } else {
        where.OR = [{ started: false }, { finished: true }];
      }
    }

    // Date range filters
    if (minStarted || maxStarted) {
      where.startedAt = {};
      if (minStarted)
        where.startedAt.gte = minStarted instanceof Date ? minStarted : new Date(minStarted);
      if (maxStarted)
        where.startedAt.lte = maxStarted instanceof Date ? maxStarted : new Date(maxStarted);
    }

    if (minFinished || maxFinished) {
      where.finishedAt = {};
      if (minFinished)
        where.finishedAt.gte = minFinished instanceof Date ? minFinished : new Date(minFinished);
      if (maxFinished)
        where.finishedAt.lte = maxFinished instanceof Date ? maxFinished : new Date(maxFinished);
    }
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableWorkouts] Error preparing data', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }

  try {
    const [items, totalCount] = await prisma.$transaction([
      prisma.userTopicWorkout.findMany(findManyArgs),
      prisma.userTopicWorkout.count({ where }),
    ]);

    return { items, totalCount };
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableWorkouts] Error retrieving data', {
        error,
        findManyArgs,
        where,
        include,
        orderBy,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
