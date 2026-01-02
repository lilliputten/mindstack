'use server';

import { ExtendedUser } from '@/@types/next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TGetAvailableAnswersParams, TGetAvailableAnswersResults } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

import { IncludedQuestionSelect } from '../types';

interface TOptions {
  noDebug?: boolean;
}

/** Get available answers for `questionId`, or for other conditions (by `answerIds`), with a pagination by `skip` and `take` */
export async function getAvailableAnswers(
  params: TGetAvailableAnswersParams & TOptions = {},
): Promise<TGetAvailableAnswersResults> {
  const {
    questionId,
    answerIds,
    skip, // = 0,
    take, // = itemsLimit,
    adminMode,
    showOnlyMyAnswers,
    orderBy = { updatedAt: 'desc' },
    // AnswerIncludeParamsSchema
    includeQuestion = false,
    // Options (no error console output and debugger stops, for tests)
    noDebug,
  } = params;
  if (isDev) {
    // DEBUG: Emulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  // TODO: Check if the owner answer fit the admin conditions (the user is the owner, the user is admin or the question is public?
  const user: ExtendedUser | undefined = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';
  try {
    // Check if conditions are correct...
    if (!user && showOnlyMyAnswers) {
      throw new Error('Only authorized users can get their own data from the system');
    }
    if (adminMode && !isAdmin) {
      throw new Error('Admin mode is allowed only for administrators');
    }
    if (!userId && showOnlyMyAnswers && !adminMode) {
      return { items: [], totalCount: 0 };
    }
    // Create the "include" data...
    const include: Prisma.AnswerInclude = {
      // _count: { select: { answers: includeAnswersCount } },
    };
    if (includeQuestion) {
      include.question = { select: IncludedQuestionSelect }; // Use specific shape to contract the included data
    }
    /*
     * // Create the "where" data...
     * const whereQuestion: Prisma.XOR<Prisma.QuestionScalarRelationFilter, Prisma.QuestionWhereInput> = {};
     * // Check if the owner answer fit the admin conditions (the user is the owner, the user is admin or the question is public?
     * if (!userId) {
     *   // Limit with public data for nonauthorized user in non-admin mode and without any other conditions
     *   whereQuestion.isPublic = true;
     * } else if (showOnlyMyAnswers) {
     *   // Request only this user data
     *   whereQuestion.userId = userId;
     * } else if (!adminMode) {
     *   // Request public or this user data
     *   whereQuestion.OR = [{ userId }, { isPublic: true }];
     * }
     */
    const where: Prisma.AnswerWhereInput = {
      // question: Object.keys(whereQuestion).length ? whereQuestion : undefined,
      // question: { isPublic: true },
    };
    if (questionId) {
      where.questionId = questionId;
    }
    if (answerIds) {
      // Limit the results by specified ids
      where.id = { in: answerIds };
    }
    // Combine all the request arguments...
    const args: Prisma.AnswerFindManyArgs = {
      skip,
      take,
      where,
      include,
      orderBy,
    };
    const [items, totalCount] = await prisma.$transaction([
      prisma.answer.findMany(args),
      prisma.answer.count({
        where,
      }),
    ]);
    // const answers: TAvailableAnswer[] = await prisma.answer.findMany(args);
    return { items, totalCount } satisfies TGetAvailableAnswersResults;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableAnswersCore] catch', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
