'use server';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { TNewQuestion } from '@/features/questions/types';
import { checkQuestionsLimit } from '@/features/users/services/checkContentLimits';

import { TQuestion } from '../types';

/* TODO: To broadcast a client message to refresh topics data, including other tabs? */

/* TODO: Use the same parameters for "include" data, as in `getAvailableQuestionById`, see `IncludedTopicSelect` */

export async function addNewQuestion(newQuestion: TNewQuestion) {
  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!userId) {
      throw new ContentLimitError('UNAUTHORIZED', 'User not authenticated');
    }

    if (!newQuestion.text) {
      throw new Error('Not specified question name');
    }

    // Check questions limit before creating
    const questionsLimit = await checkQuestionsLimit();
    if (!questionsLimit.canCreate && !isAdmin) {
      throw new ContentLimitError(
        'QUESTIONS_LIMIT_REACHED',
        questionsLimit.reasonCode,
        user?.grade,
      );
    }

    const topic = await prisma.topic.findUnique({
      where: { id: newQuestion.topicId },
    });
    if (!topic) {
      throw new Error('Not found owner topic for adding question');
    }
    // Check if the current user is allowed to add the question?
    if (userId !== topic?.userId && !isAdmin) {
      throw new Error('Current user is not allowed to add the answer');
    }
    const result = await prisma.$transaction(async (tx) => {
      const { answers, ...questionFields } = newQuestion;
      const addedQuestion = await tx.question.create({
        data: {
          ...questionFields,
          ...(answers?.length && {
            answers: {
              create: answers.map((answer) => ({
                ...answer,
                isGenerated: questionFields.isGenerated || false,
              })),
            },
          }),
        },
      });

      // Update UserTopicWorkout questionsOrder for all users with this topic
      const workouts = await tx.userTopicWorkout.findMany({
        where: { topicId: newQuestion.topicId },
      });

      // TODO: Use Promise.all to update all the affected workouts simultaneously
      for (const workout of workouts) {
        const currentOrder = workout.questionsOrder || '';
        const newOrder = currentOrder ? `${currentOrder} ${addedQuestion.id}` : addedQuestion.id;

        await tx.userTopicWorkout.update({
          where: {
            userId_topicId: {
              userId: workout.userId,
              topicId: workout.topicId,
            },
          },
          data: {
            questionsCount: (workout.questionsCount || 0) + 1,
            questionsOrder: newOrder,
          },
        });
      }

      return addedQuestion;
    });

    return result as TQuestion;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[addNewQuestion] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
