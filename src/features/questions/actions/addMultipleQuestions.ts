'use server';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { checkQuestionsLimit } from '@/features/users/services/checkContentLimits';

import { TAvailableQuestion, TNewQuestion } from '../types';

function getCreateQuestionData(questionData: TNewQuestion) {
  try {
    const {
      answers,
      // answersCount: _answersCount,
      ...questionFields
    } = questionData;
    if ('answersCount' in questionFields) {
      delete questionFields['answersCount'];
    }
    const answersData = answers?.length && {
      answers: {
        create: answers.map((answer) => ({
          ...answer,
          isGenerated: questionFields.isGenerated || false,
        })),
      },
    };
    const data = {
      ...questionFields,
      ...answersData,
    };
    return data;
  } catch (error) {
    const humanMsg = 'Can not create question';
    const errDetails = getErrorText(error);
    const errName = error instanceof Error ? error.name : 'UnknownError';
    const errMsg = [humanMsg, errName].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[addMultipleQuestions:getCreateQuestionData] ❌', humanMsg, {
      errDetails,
      errName,
      error,
      questionData,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(errMsg);
  }
}

export async function addMultipleQuestions(
  newQuestions: TNewQuestion[],
): Promise<TAvailableQuestion[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be signed in');
  }

  if (!newQuestions.length) {
    return [];
  }

  try {
    // Check questions limit before creating
    if (newQuestions.length > 1) {
      // For bulk operations, check if user has enough remaining quota
      const questionsLimit = await checkQuestionsLimit();
      if (!questionsLimit.isUnlimited && questionsLimit.remaining < newQuestions.length) {
        throw new ContentLimitError(
          'QUESTIONS_LIMIT_REACHED',
          `Cannot add ${newQuestions.length} questions. Only ${questionsLimit.remaining} remaining.`,
          user.grade,
        );
      }
    }

    // Verify user has access to the topic
    const topicId = newQuestions[0].topicId;
    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        OR: [{ userId: user.id }, { isPublic: true }],
      },
    });

    if (!topic) {
      throw new Error('Topic not found or access denied');
    }

    if (topic.userId !== user.id && user.role !== 'ADMIN') {
      throw new Error('Current user is not allowed to add questions to this topic');
    }

    const questionDataItems = newQuestions.map(getCreateQuestionData);
    const prismaPromises = questionDataItems.map((data) => {
      return prisma.question.create({
        data,
        include: {
          _count: {
            select: { answers: true },
          },
        },
      });
    });
    /* console.log('[addMultipleQuestions] prismaPromises', {
     *   questionDataItems,
     *   prismaPromises,
     *   newQuestions,
     * });
     */
    debugger; // eslint-disable-line no-debugger
    const createdQuestions = await prisma.$transaction(prismaPromises);

    return createdQuestions;
  } catch (error) {
    const humanMsg = 'Can not add multiple questions';
    const errDetails = getErrorText(error);
    const errName = error instanceof Error ? error.name : 'UnknownError';
    const errMsg = [humanMsg, errName].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[addMultipleQuestions] ❌', humanMsg, {
      errDetails,
      errName,
      error,
      newQuestions,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(errMsg);
  }
}
