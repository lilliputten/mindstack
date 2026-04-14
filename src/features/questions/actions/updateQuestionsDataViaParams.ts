'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { newItemIdPrefix } from '@/entities/HeadlessEditor/constants';
import { TAvailableAnswer } from '@/features/answers/types';
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

interface TOptions {
  noDebug?: boolean;
}

/**
 * Updates, adds, and deletes questions in a single transaction.
 * Performs security checks to ensure user has access to modify the questions.
 * @param data - Object containing updatedItems, addedItems, and deletedIds
 * @returns Array of affected questions (updated and added)
 */
export async function updateQuestionsDataViaParams(
  data: TUpdateQuestionsDataViaParams & TOptions,
): Promise<TUpdateQuestionsDataViaParamsResults> {
  const { updatedItems = [], addedItems = [], deletedIds = [], noDebug } = data;

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

    const results = await prisma.$transaction(
      async (tx) => {
        const results: TUpdateQuestionsDataViaParamsResults = {};

        // Process updates
        if (updatedItems.length > 0) {
          const updatePromises = updatedItems.map(async (item) => {
            const {
              id,
              // Skip extra data...
              _count,
              createdAt: _createdAt,
              updatedAt: _updatedAt,
              answers: rawAnswers,
              topic: _topic,
              // TODO: Remove all other, unexpected in the Prisma Question data model, data
              ...updateData
            } = item as TNewOrOldQuestion & { topic: unknown };

            // Cast answers to extended type to include optional fields from editor
            const answers = rawAnswers as TAvailableAnswer[] | undefined;

            // Update the question with nested answer operations
            const updatedQuestion = await tx.question.update({
              where: { id },
              data: {
                ...updateData,
                ...(answers &&
                  Array.isArray(answers) && {
                    answers: {
                      // First, delete answers that are not in the new list
                      deleteMany: {
                        id: {
                          notIn: answers
                            .filter((a): a is TAvailableAnswer & { id: string } => {
                              // Only keep answers with real IDs (not __new, not undefined)
                              return !!(a.id && !String(a.id).startsWith(newItemIdPrefix));
                            })
                            .map((a) => a.id),
                        },
                      },
                      // Create new answers (those without ID or with __new IDs)
                      create: answers
                        .filter((a): a is TAvailableAnswer => {
                          // New answers are those without ID or with __new prefix
                          return !a.id || String(a.id).startsWith(newItemIdPrefix);
                        })
                        .map((answer) => {
                          // Extract only the fields we need for creation
                          const { id: _answerId, questionId: _questionId, ...answerData } = answer;
                          return {
                            text: answerData.text,
                            explanation: answerData.explanation,
                            isCorrect: answerData.isCorrect ?? false,
                            order: answerData.order,
                            isGenerated: item.isGenerated || false,
                          };
                        }),
                      // Update existing answers (those with real IDs, not __new)
                      update: answers
                        .filter((a): a is TAvailableAnswer & { id: string } => {
                          // Existing answers have real IDs (not __new prefix)
                          return !!(a.id && !String(a.id).startsWith(newItemIdPrefix));
                        })
                        .map((answer) => {
                          const { id: answerId, questionId: _questionId, ...answerData } = answer;

                          return {
                            where: { id: answerId },
                            data: {
                              text: answerData.text,
                              explanation: answerData.explanation,
                              isCorrect: answerData.isCorrect ?? false,
                              order: answerData.order,
                              isGenerated: item.isGenerated || false,
                            },
                          };
                        }),
                    },
                  }),
              },
              include: {
                answers: true,
              },
            });

            return updatedQuestion;
          });

          const updatedResults = await Promise.all(updatePromises);
          results.updated = updatedResults;
        }

        // Process additions
        if (addedItems.length > 0) {
          const addPromises = addedItems.map(async (item) => {
            const { answers: rawAnswers, ...questionFields } = item;

            // Cast answers to extended type to include optional fields from editor
            const answers = rawAnswers as TAvailableAnswer[] | undefined;

            const origId = questionFields.id;
            const hasNewOrigId = !!origId && origId.startsWith(newItemIdPrefix);

            // Prepare question data for creation
            const { id: _questionId, ...questionDataWithoutId } = questionFields;
            const questionData = hasNewOrigId ? questionDataWithoutId : questionFields;

            // Add nested answer creation if answers exist
            const createData = {
              ...questionData,
              ...(answers?.length && {
                answers: {
                  create: answers.map((answer) => {
                    // Exclude 'id' and 'questionId' from nested creates
                    // These are auto-generated or set by Prisma relationships
                    const { id: _answerId, questionId: _questionId, ...answerData } = answer;

                    return {
                      text: answerData.text,
                      explanation: answerData.explanation,
                      isCorrect: answerData.isCorrect ?? false,
                      order: answerData.order,
                      isGenerated: item.isGenerated || false,
                    };
                  }),
                },
              }),
            };

            const addedQuestion = await tx.question.create({
              data: createData,
              include: {
                answers: true, // Include answers to get their generated IDs
              },
            });

            // Map question ID if it was a temporary ID
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
          const questionsToDelete = await tx.question.findMany({
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
              const questionsOrder = workout.questionsOrder
                ? workout.questionsOrder.split(' ')
                : [];
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
              const removedBeforeStep = deletedIndices.filter(
                (index) => index < newStepIndex,
              ).length;
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
      },
      {
        // Increase timeout to 30 seconds to handle bulk updates with nested answer operations
        timeout: 30000,
      },
    );

    return results;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[updateQuestionsDataViaParams] catch', {
        error,
        data,
        user,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
