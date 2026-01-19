'use server';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { TNewAnswer } from '@/features/answers/types';
import { checkAnswersLimit } from '@/features/users/services/checkContentLimits';

import { TAnswer } from '../types';

export async function addNewAnswer(newAnswer: TNewAnswer) {
  if (isDev) {
    // DEBUG: Emulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const user = await getCurrentUser();
  const userId = user?.id;
  try {
    if (!userId) {
      throw new Error('Undefined user');
    }
    if (!newAnswer.text) {
      throw new Error('Not specified answer text');
    }
    if (!newAnswer.questionId) {
      throw new Error('Not specified answers owner question');
    }
    const question = await prisma.question.findUnique({
      where: { id: newAnswer.questionId },
    });
    if (!question) {
      throw new Error('Not found owner question for the answer');
    }
    const topic = await prisma.topic.findUnique({
      where: { id: question.topicId },
    });
    if (!topic) {
      throw new Error('Not found owner topic for the deleting question');
    }
    // Check if the current user is allowed to delete the topic?
    if (userId !== topic?.userId && user.role !== 'ADMIN') {
      throw new Error('Current user is not allowed to delete the question');
    }

    // Check answers limit before creating
    const answersLimit = await checkAnswersLimit();
    if (!answersLimit.canCreate) {
      throw new ContentLimitError('ANSWERS_LIMIT_REACHED', answersLimit.reasonCode, user?.grade);
    }

    const data = { ...newAnswer };
    const addedAnswer = await prisma.answer.create({
      data,
    });
    return addedAnswer as TAnswer;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[addNewAnswer] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
