'use server';

import { ExtendedUser } from '@/@types/next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TGetAvailableQuestionsParams, TGetAvailableQuestionsResults } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

// import { IncludedTopicSelect } from '../types';

interface TOptions {
  noDebug?: boolean;
}

/** Get available questions for `topicId`, or for other conditions (by `questionIds`), with a pagination by `skip` and `take` */
export async function getAvailableQuestions(
  params: TGetAvailableQuestionsParams & TOptions = {},
): Promise<TGetAvailableQuestionsResults> {
  const {
    topicId,
    questionIds,
    skip, // = 0,
    take, // = itemsLimit,
    adminMode,
    showOnlyMyQuestions,
    orderBy = { updatedAt: 'desc' },
    // QuestionIncludeParamsSchema
    includeTopic = false,
    includeAnswersCount = true,
    includeAnswers = false,
    // Options (no error console output and debugger stops, for tests)
    noDebug,
  } = params;
  if (isDev) {
    // DEBUG: Emulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  // TODO: Check if the owner question fit the admin conditions (the user is the owner, the user is admin or the topic is public?
  const user: ExtendedUser | undefined = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';
  try {
    // Check if conditions are correct...
    if (!user && showOnlyMyQuestions) {
      throw new Error('Only authorized users can get their own data from the system');
    }
    if (adminMode && !isAdmin) {
      throw new Error('Admin mode is allowed only for administrators');
    }
    if (!userId && showOnlyMyQuestions && !adminMode) {
      return { items: [], totalCount: 0 };
    }
    // Create the "include" data...
    const include: Prisma.QuestionInclude = {
      _count: { select: { answers: includeAnswersCount } },
    };
    if (includeTopic) {
      include.topic = true; // { select: IncludedTopicSelect };
    }
    if (includeAnswers) {
      include.answers = true;
    }
    // Create the "where" data...
    const whereTopic: Prisma.XOR<Prisma.TopicScalarRelationFilter, Prisma.TopicWhereInput> = {};
    // Check if the owner question fit the admin conditions (the user is the owner, the user is admin or the topic is public?
    if (!userId) {
      // Limit with public data for nonauthorized user in non-admin mode and without any other conditions
      whereTopic.isPublic = true;
    } else if (showOnlyMyQuestions) {
      // Request only this user data
      whereTopic.userId = userId;
    } else if (!adminMode) {
      // Request public or this user data
      whereTopic.OR = [{ userId }, { isPublic: true }];
    }
    const where: Prisma.QuestionWhereInput = {
      topic: Object.keys(whereTopic).length ? whereTopic : undefined,
      // topic: { isPublic: true },
    };
    if (topicId) {
      where.topicId = topicId;
    }
    if (questionIds) {
      // Limit the results by specified ids
      where.id = { in: questionIds };
    }
    // Combine all the request arguments...
    const args: Prisma.QuestionFindManyArgs = {
      skip,
      take,
      where,
      include,
      orderBy,
    };
    const [items, totalCount] = await prisma.$transaction([
      prisma.question.findMany(args),
      prisma.question.count({
        where,
      }),
    ]);
    // const questions: TAvailableQuestion[] = await prisma.question.findMany(args);
    return { items, totalCount } satisfies TGetAvailableQuestionsResults;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableQuestionsCore] catch', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
