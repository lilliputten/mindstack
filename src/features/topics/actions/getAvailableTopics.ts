'use server';

import { ExtendedUser } from '@/@types/next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TGetAvailableTopicsParams, TGetAvailableTopicsResults } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

import { IncludedStatsSelect, IncludedUserSelect, IncludedUserTopicWorkoutSelect } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getAvailableTopics(
  params: TGetAvailableTopicsParams & TOptions = {},
): Promise<TGetAvailableTopicsResults> {
  const {
    topicIds,
    skip, // = 0,
    take, // = itemsLimit,
    adminMode,
    showOnlyMyTopics,
    orderBy = { updatedAt: 'desc' },
    // TopicIncludeParamsSchema
    includeUser = false,
    includeWorkout = false,
    includeStats = false,
    includeQuestionsCount = true,
    includeQuestions = false,
    // Search parameters
    searchText,
    hasWorkoutStats,
    hasActiveWorkouts,
    hasQuestions,
    minCreatedAt,
    maxCreatedAt,
    minUpdatedAt,
    maxUpdatedAt,
    langCode,
    langName,
    searchLang,
    // Options (no error console output and debugger stops, for tests)
    noDebug,
  } = params;
  if (isDev) {
    // DEBUG: Emulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const user: ExtendedUser | undefined = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  // Data to pass to prisma
  const include: Prisma.TopicInclude = {
    _count: { select: { questions: includeQuestionsCount } },
  };
  const where: Prisma.TopicWhereInput = {};
  const findManyArgs: Prisma.TopicFindManyArgs = { skip, take, orderBy, where, include };

  // Prepare data...
  try {
    // Check if conditions are correct...
    if (!user && showOnlyMyTopics) {
      throw new Error('Only authorized users can get their own data');
    }
    if (adminMode && !isAdmin) {
      throw new Error('Admin mode is allowed only for administrators');
    }
    if (!userId && showOnlyMyTopics && !adminMode) {
      return { items: [], totalCount: 0 };
    }
    // Create the "include" data...
    if (includeUser) {
      include.user = { select: IncludedUserSelect };
    }
    if (includeQuestions) {
      include.questions = true;
    }
    if (includeWorkout) {
      include.userTopicWorkout = { select: IncludedUserTopicWorkoutSelect };
    }
    if (includeStats) {
      include.workoutStats = { select: IncludedStatsSelect };
    }
    // Create the "where" data...
    if (!userId) {
      // Limit with public data for nonauthorized user in non-admin mode and without any other conditions
      where.isPublic = true;
    } else if (showOnlyMyTopics) {
      // Request only this user data
      where.userId = userId;
    } else if (!adminMode) {
      // Request public or this user data
      where.OR = [{ userId }, { isPublic: true }];
    }
    if (topicIds) {
      // Limit the results by specified ids
      where.id = { in: topicIds };
    }
    // Search text in name, description, keywords
    if (searchText) {
      const searchConditions: Prisma.TopicWhereInput[] = [
        // TODO: Handle markdown text and full-text fuzzy search?
        { name: { contains: searchText, mode: 'insensitive' } },
        { description: { contains: searchText, mode: 'insensitive' } },
        { keywords: { contains: searchText, mode: 'insensitive' } },
      ];
      if (where.OR) {
        // Combine existing OR conditions with search conditions using AND
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
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
        where.userTopicWorkout = { some: { started: true, finished: false } };
      } else {
        where.userTopicWorkout = { none: { started: true, finished: false } };
      }
    }
    // Filter by questions existence
    if (hasQuestions !== undefined) {
      if (hasQuestions) {
        where.questions = { some: {} };
      } else {
        where.questions = { none: {} };
      }
    }
    // Filter by creation date range
    if (minCreatedAt !== undefined || maxCreatedAt !== undefined) {
      where.createdAt = {};
      if (minCreatedAt) where.createdAt.gte = minCreatedAt;
      if (maxCreatedAt) where.createdAt.lte = maxCreatedAt;
    }
    // Filter by update date range
    if (minUpdatedAt !== undefined || maxUpdatedAt !== undefined) {
      where.updatedAt = {};
      if (minUpdatedAt) where.updatedAt.gte = minUpdatedAt;
      if (maxUpdatedAt) where.updatedAt.lte = maxUpdatedAt;
    }
    // Filter by language
    if (langCode) {
      where.langCode = langCode;
    }
    if (langName) {
      where.langName = langName;
    }
    // Search in both langCode and langName
    if (searchLang) {
      const langConditions: Prisma.TopicWhereInput[] =
        searchLang.length === 2
          ? [{ langCode: searchLang.toLowerCase() }]
          : [{ langName: { contains: searchLang, mode: 'insensitive' } }];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: langConditions }];
        delete where.OR;
      } else if (where.AND) {
        where.AND = Array.isArray(where.AND)
          ? [...where.AND, { OR: langConditions }]
          : [where.AND, { OR: langConditions }];
      } else {
        where.OR = langConditions;
      }
    }
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableTopicsCore] Error preparing data', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }

  // Retrieve data...
  try {
    const [items, totalCount] = await prisma.$transaction([
      prisma.topic.findMany(findManyArgs),
      prisma.topic.count({ where }),
    ]);
    return { items, totalCount } satisfies TGetAvailableTopicsResults;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableTopicsCore] Error retrieving data', {
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
