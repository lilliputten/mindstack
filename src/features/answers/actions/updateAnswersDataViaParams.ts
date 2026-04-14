'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { newItemIdPrefix } from '@/entities/HeadlessEditor';
import { TAnswerId, TNewAnswer, TNewOrOldAnswer } from '@/features/answers/types';
import { checkAnswersLimit } from '@/features/users/services/checkContentLimits';

import { TAnswer } from '../types';

interface TUpdateAnswersDataViaParams {
  updatedItems?: TNewOrOldAnswer[];
  addedItems?: TNewAnswer[];
  deletedIds?: string[];
}

export interface TUpdateAnswersDataViaParamsResults {
  added?: TAnswer[];
  autoAddedIds?: Record<TAnswerId, TAnswerId>;
  updated?: TAnswer[];
  deletedIds?: TAnswerId[];
}

async function collectQuestionIds(data: TUpdateAnswersDataViaParams): Promise<Set<string>> {
  const { updatedItems = [], addedItems = [], deletedIds = [] } = data;
  const questionIds = new Set<string>();

  if (updatedItems.length > 0) {
    const existing = await prisma.answer.findMany({
      where: { id: { in: updatedItems.map((a) => a.id) } },
      select: { questionId: true },
    });
    existing.forEach((a) => questionIds.add(a.questionId));
  }

  addedItems.forEach((a) => {
    if (a.questionId) questionIds.add(a.questionId);
  });

  if (deletedIds.length > 0) {
    const toDelete = await prisma.answer.findMany({
      where: { id: { in: deletedIds } },
      select: { questionId: true },
    });
    toDelete.forEach((a) => questionIds.add(a.questionId));
  }

  return questionIds;
}

async function assertUserCanModifyAnswersForQuestions(
  questionIds: Set<string>,
  userId: string,
  role: string,
) {
  if (questionIds.size === 0) return;

  const questions = await prisma.question.findMany({
    where: { id: { in: [...questionIds] } },
    select: { id: true, topic: { select: { userId: true } } },
  });

  const unauthorized = questions.filter((q) => q.topic.userId !== userId && role !== 'ADMIN');

  if (unauthorized.length > 0) {
    throw new Error('Current user is not allowed to modify answers for some questions');
  }
}

/**
 * Updates, adds, and deletes answers in a single transaction (headless editor save).
 */
export async function updateAnswersDataViaParams(
  data: TUpdateAnswersDataViaParams,
): Promise<TUpdateAnswersDataViaParamsResults> {
  const { updatedItems = [], addedItems = [], deletedIds = [] } = data;

  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Undefined user');
  }

  const questionIds = await collectQuestionIds(data);
  await assertUserCanModifyAnswersForQuestions(questionIds, userId, user.role);

  if (addedItems.length > 0 && user.role !== 'ADMIN') {
    const answersLimit = await checkAnswersLimit();
    const addCount = addedItems.length;
    if (!answersLimit.canCreate) {
      throw new ContentLimitError('ANSWERS_LIMIT_REACHED', answersLimit.reasonCode, user?.grade);
    }
    if (
      !answersLimit.isUnlimited &&
      answersLimit.remaining >= 0 &&
      addCount > answersLimit.remaining
    ) {
      throw new ContentLimitError('ANSWERS_LIMIT_REACHED', answersLimit.reasonCode, user?.grade);
    }
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const results = await prisma.$transaction(async (tx) => {
      const out: TUpdateAnswersDataViaParamsResults = {};

      if (updatedItems.length > 0) {
        const updated = await Promise.all(
          updatedItems.map(async (item) => {
            const { id } = item;
            const data: Prisma.AnswerUpdateInput = {
              text: item.text,
              explanation: item.explanation === undefined ? undefined : item.explanation,
              isCorrect: item.isCorrect,
              isGenerated: item.isGenerated,
              order: item.order === undefined ? undefined : item.order,
            };
            return tx.answer.update({
              where: { id },
              data,
            });
          }),
        );
        out.updated = updated as TAnswer[];
      }

      if (addedItems.length > 0) {
        const added = await Promise.all(
          addedItems.map(async (item) => {
            const mutable = { ...item } as TNewAnswer & { id?: string; isNew?: boolean };
            delete mutable.isNew;

            const origId = mutable.id;
            const hasNewOrigId = !!origId && String(origId).startsWith(newItemIdPrefix);
            if (hasNewOrigId) {
              delete mutable.id;
            }

            if (!mutable.text) {
              throw new Error('Not specified answer text');
            }

            const createPayload: Prisma.AnswerCreateInput = {
              text: mutable.text,
              question: { connect: { id: mutable.questionId } },
              explanation: mutable.explanation ?? undefined,
              isCorrect: mutable.isCorrect ?? false,
              isGenerated: mutable.isGenerated ?? false,
              order: mutable.order ?? undefined,
            };

            const created = await tx.answer.create({
              data: createPayload,
            });

            if (hasNewOrigId && origId !== created.id) {
              if (!out.autoAddedIds) out.autoAddedIds = {};
              out.autoAddedIds[origId] = created.id;
            }

            return created;
          }),
        );
        out.added = added as TAnswer[];
      }

      if (deletedIds.length > 0) {
        const existing = await tx.answer.findMany({
          where: { id: { in: deletedIds } },
          select: { id: true },
        });
        const actualIds = existing.map((a) => a.id);

        await tx.answer.deleteMany({
          where: { id: { in: deletedIds } },
        });

        out.deletedIds = actualIds;
      }

      return out;
    });

    return results;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateAnswersDataViaParams] catch', {
      error,
      data,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
