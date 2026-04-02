'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { newItemIdPrefix } from '@/entities/HeadlessEditor';
import { TNewOrOldQuestion, TNewQuestion, TQuestionId } from '@/features/questions/types';

import { TQuestion } from '../types';

export interface TUpdateQuestionsDataViaParams {
  updatedItems?: TNewOrOldQuestion[];
  addedItems?: TNewQuestion[];
  deletedIds?: string[];
}

export interface TUpdateQuestionsDataViaParamsResults {
  /** Newly added items */
  added?: TQuestion[];
  /** Hash for auto-renamed 'new ids' */
  autoAddedIds?: Record<TQuestionId, TQuestionId>;
  /** Updated items */
  updated?: TQuestion[];
  /** Deleted item ids */
  deletedIds?: TQuestionId[];
}

/**
 * Updates, adds, and deletes questions in a single transaction.
 * Performs security checks to ensure user has access to modify the questions.
 * @param data - Object containing updatedItems, addedItems, and deletedIds
 * @returns Array of affected questions (updated and added)
 */
export async function updateQuestionsDataViaParams(
  data: TUpdateQuestionsDataViaParams,
): Promise<TUpdateQuestionsDataViaParamsResults> {
  const { updatedItems = [], addedItems = [], deletedIds = [] } = data;

  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('Undefined user');
  }

  // Collect all topic IDs that need to be checked
  const topicIdsToCheck = new Set<string>();

  // Get topic IDs for updated items
  if (updatedItems.length > 0) {
    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: updatedItems.map((item) => item.id) } },
      select: { topicId: true },
    });

    existingQuestions.forEach((q) => topicIdsToCheck.add(q.topicId));
  }

  // Get topic IDs for added items
  if (addedItems.length > 0) {
    addedItems.forEach((item) => {
      if (item.topicId) {
        topicIdsToCheck.add(item.topicId);
      }
    });
  }

  // Get topic IDs for deleted items
  if (deletedIds.length > 0) {
    const deletedQuestions = await prisma.question.findMany({
      where: { id: { in: deletedIds } },
      select: { topicId: true },
    });

    deletedQuestions.forEach((q) => topicIdsToCheck.add(q.topicId));
  }

  // Verify user has access to all affected topics
  const topics = await prisma.topic.findMany({
    where: { id: { in: Array.from(topicIdsToCheck) } },
    select: { id: true, userId: true },
  });

  // Check if user owns all topics or is admin
  const unauthorizedTopics = topics.filter(
    (topic) => topic.userId !== userId && user.role !== 'ADMIN',
  );

  if (unauthorizedTopics.length > 0) {
    throw new Error('Current user is not allowed to modify questions in some topics');
  }

  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const results = await prisma.$transaction(async (tx) => {
      const results: TUpdateQuestionsDataViaParamsResults = {};

      // Process updates
      if (updatedItems.length > 0) {
        const updatePromises = updatedItems.map(async (item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, _count, createdAt, updatedAt, answers, ...updateData } = item;

          // Update the question
          const updatedQuestion = await tx.question.update({
            where: { id },
            data: updateData,
          });

          // TODO: Handle answers update if present
          if (answers && Array.isArray(answers)) {
            // Delete existing answers
            await tx.answer.deleteMany({
              where: { questionId: id },
            });

            // Create new answers
            if (answers.length > 0) {
              await tx.answer.createMany({
                data: answers.map((answer) => ({
                  ...answer,
                  questionId: id,
                  isGenerated: item.isGenerated || false,
                })),
              });
            }
          }

          return updatedQuestion;
        });

        const updatedResults = await Promise.all(updatePromises);
        results.updated = updatedResults;
      }

      // Process additions
      if (addedItems.length > 0) {
        const addPromises = addedItems.map(async (item) => {
          const { answers, ...questionFields } = item;

          const origId = questionFields.id;
          const hasNewOrigId = !!origId && origId.startsWith(newItemIdPrefix);
          if (hasNewOrigId) {
            // It will be created automatically
            delete questionFields.id;
          }

          const addedQuestion = await tx.question.create({
            data: {
              ...questionFields,
              ...(answers?.length && {
                answers: {
                  create: answers.map((answer) => ({
                    ...answer,
                    isGenerated: item.isGenerated || false,
                  })),
                },
              }),
            },
          });
          if (hasNewOrigId && origId !== addedQuestion.id) {
            if (!results.autoAddedIds) results.autoAddedIds = {};
            results.autoAddedIds[origId] = addedQuestion.id;
          }

          // Update UserTopicWorkout questionsOrder for all users with this topic
          const workouts = await tx.userTopicWorkout.findMany({
            where: { topicId: item.topicId },
          });

          for (const workout of workouts) {
            const currentOrder = workout.questionsOrder || '';
            const newOrder = currentOrder
              ? `${currentOrder} ${addedQuestion.id}`
              : addedQuestion.id;

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

        const addedQuestions = await Promise.all(addPromises);
        results.added = addedQuestions;
      }

      // Process deletions
      if (deletedIds.length > 0) {
        // Get questions to delete with their topic IDs
        const questionsToDelete = await prisma.question.findMany({
          where: { id: { in: deletedIds } },
          select: { id: true, topicId: true },
        });

        // Track which IDs were actually found and will be deleted
        const actualDeletedIds = questionsToDelete.map((q) => q.id);

        // Group by topic for workout updates
        const topicQuestionMap = new Map<string, string[]>();
        questionsToDelete.forEach((q) => {
          const existing = topicQuestionMap.get(q.topicId) || [];
          existing.push(q.id);
          topicQuestionMap.set(q.topicId, existing);
        });

        // Update workouts for each affected topic
        for (const [topicId, questionIds] of topicQuestionMap.entries()) {
          const workouts = await tx.userTopicWorkout.findMany({
            where: { topicId },
          });

          for (const workout of workouts) {
            const questionsOrder = workout.questionsOrder ? workout.questionsOrder.split(' ') : [];
            const questionResults = workout.questionResults
              ? JSON.parse(workout.questionResults)
              : [];

            // Remove deleted questions from order and results
            const newQuestionsOrder = questionsOrder.filter((id) => !questionIds.includes(id));
            const deletedIndices = questionIds
              .map((id) => questionsOrder.indexOf(id))
              .filter((index) => index !== -1);

            // Remove corresponding results
            const newQuestionResults = questionResults.filter(
              (_: unknown, index: number) => !deletedIndices.includes(index),
            );

            // Adjust stepIndex if needed
            let newStepIndex = workout.stepIndex || 0;
            const removedBeforeStep = deletedIndices.filter((index) => index < newStepIndex).length;
            newStepIndex = Math.max(0, newStepIndex - removedBeforeStep);

            await tx.userTopicWorkout.update({
              where: {
                userId_topicId: {
                  userId: workout.userId,
                  topicId: workout.topicId,
                },
              },
              data: {
                questionsOrder: newQuestionsOrder.join(' '),
                questionsCount: newQuestionsOrder.length,
                questionResults: JSON.stringify(newQuestionResults),
                stepIndex: newStepIndex,
              },
            });
          }
        }

        // Delete the questions
        await tx.question.deleteMany({
          where: { id: { in: deletedIds } },
        });

        // Return only the IDs that were actually deleted
        results.deletedIds = actualDeletedIds;
      }

      return results;
    });

    return results;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateQuestionsDataViaParams] catch', {
      error,
      data,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
