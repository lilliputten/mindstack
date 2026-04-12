import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TNewOrOldQuestion, TNewQuestion } from '@/features/questions/types';
import { TUser } from '@/features/users/types/TUser';

import {
  TUpdateQuestionsDataViaParamsResults,
  updateQuestionsDataViaParams,
} from '../updateQuestionsDataViaParams';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'question'; id: string }
  | { type: 'answer'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'answer') {
      await jestPrisma.answer.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('updateQuestionsDataViaParams', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  describe('Basic Operations', () => {
    it('should handle empty data', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-empty-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({});
        expect(result).toEqual({});
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should add new questions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-add-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const newQuestions: TNewQuestion[] = [
          {
            text: `New Question 1 - ${dateTag}`,
            topicId: topic.id,
            isGenerated: false,
          },
          {
            text: `New Question 2 - ${dateTag}`,
            topicId: topic.id,
            isGenerated: false,
            answers: [
              { text: `Answer 1 - ${dateTag}`, isCorrect: true },
              { text: `Answer 2 - ${dateTag}`, isCorrect: false },
            ],
          },
        ];

        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({
          addedItems: newQuestions,
        });

        expect(result.added).toHaveLength(2);
        expect(result.updated).toBeUndefined();
        expect(result.deletedIds).toBeUndefined();

        // Verify questions were created
        const createdQuestions = await jestPrisma.question.findMany({
          where: { topicId: topic.id },
          include: { answers: true },
        });

        expect(createdQuestions).toHaveLength(2);
        const questionWithAnswers = createdQuestions.find((q) => q.answers.length > 0);
        expect(questionWithAnswers?.answers.length).toBeGreaterThan(0);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should update existing questions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-update-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Original Question - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const updatedQuestions: TNewOrOldQuestion[] = [
          {
            id: question.id,
            text: `Updated Question - ${dateTag}`,
            topicId: topic.id,
            isGenerated: true,
          },
        ];

        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({
          updatedItems: updatedQuestions,
        });

        expect(result.updated).toHaveLength(1);
        expect(result.updated![0].text).toContain('Updated Question');
        expect(result.added).toBeUndefined();
        expect(result.deletedIds).toBeUndefined();

        // Verify update in database
        const updatedQuestion = await jestPrisma.question.findUnique({
          where: { id: question.id },
        });
        expect(updatedQuestion?.text).toContain('Updated Question');
        expect(updatedQuestion?.isGenerated).toBe(true);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should delete questions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-delete-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question1 = await jestPrisma.question.create({
          data: { text: `Question 1 - ${dateTag}`, topicId: topic.id },
        });
        const question2 = await jestPrisma.question.create({
          data: { text: `Question 2 - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question1.id });
        createdIds.push({ type: 'question', id: question2.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({
          deletedIds: [question1.id],
        });

        expect(result.added).toBeUndefined();
        expect(result.updated).toBeUndefined();
        expect(result.deletedIds).toHaveLength(1);
        expect(result.deletedIds![0]).toBe(question1.id);

        // Verify deletion
        const remainingQuestions = await jestPrisma.question.findMany({
          where: { topicId: topic.id },
        });
        expect(remainingQuestions).toHaveLength(1);
        expect(remainingQuestions[0].id).toBe(question2.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should perform all operations in a single call', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-combined-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const existingQuestion = await jestPrisma.question.create({
          data: { text: `Existing - ${dateTag}`, topicId: topic.id },
        });
        const toDeleteQuestion = await jestPrisma.question.create({
          data: { text: `To Delete - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: existingQuestion.id });
        createdIds.push({ type: 'question', id: toDeleteQuestion.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: existingQuestion.id,
              text: `Updated - ${dateTag}`,
              topicId: topic.id,
            },
          ],
          addedItems: [
            {
              text: `Added - ${dateTag}`,
              topicId: topic.id,
            } as TNewQuestion,
          ],
          deletedIds: [toDeleteQuestion.id],
        });

        expect(result.updated).toHaveLength(1);
        expect(result.added).toHaveLength(1);
        expect(result.deletedIds).toHaveLength(1);
        expect(result.deletedIds![0]).toBe(toDeleteQuestion.id);

        // Verify final state
        const finalQuestions = await jestPrisma.question.findMany({
          where: { topicId: topic.id },
          orderBy: { createdAt: 'asc' },
        });

        expect(finalQuestions).toHaveLength(2);
        expect(finalQuestions[0].text).toContain('Updated');
        expect(finalQuestions[1].text).toContain('Added');
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('Security Checks', () => {
    it('should throw error when user is not authenticated', async () => {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      await expect(
        updateQuestionsDataViaParams({
          addedItems: [{ text: 'Test', topicId: 'some-id' } as TNewQuestion],
          noDebug: true,
        }),
      ).rejects.toThrow('Undefined user');
    });

    it('should throw error when user tries to update questions they do not own', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const owner = await jestPrisma.user.create({
          data: { email: `owner-${dateTag}@test.com`, role: 'USER' },
        });
        const otherUser = await jestPrisma.user.create({
          data: { email: `other-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: owner.id });
        createdIds.push({ type: 'user', id: otherUser.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: owner.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

        await expect(
          updateQuestionsDataViaParams({
            updatedItems: [
              {
                id: question.id,
                text: `Modified - ${dateTag}`,
                topicId: topic.id,
              },
            ],
            noDebug: true,
          }),
        ).rejects.toThrow('Current user is not allowed to modify questions in some topics');
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should allow admin to modify any questions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const owner = await jestPrisma.user.create({
          data: { email: `owner-${dateTag}@test.com`, role: 'USER' },
        });
        const admin = await jestPrisma.user.create({
          data: { email: `admin-${dateTag}@test.com`, role: 'ADMIN' },
        });
        createdIds.push({ type: 'user', id: owner.id });
        createdIds.push({ type: 'user', id: admin.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: owner.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(admin as TUser);

        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: question.id,
              text: `Admin Modified - ${dateTag}`,
              topicId: topic.id,
            },
          ],
        });

        expect(result.updated).toHaveLength(1);
        expect(result.updated![0].text).toContain('Admin Modified');
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('Answer Management', () => {
    it('should update answers when updating a question', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-answers-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });
        const oldAnswer = await jestPrisma.answer.create({
          data: { text: `Old Answer - ${dateTag}`, questionId: question.id, isCorrect: true },
        });
        createdIds.push({ type: 'question', id: question.id });
        createdIds.push({ type: 'answer', id: oldAnswer.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: question.id,
              text: `Updated Question - ${dateTag}`,
              topicId: topic.id,
              answers: [
                { text: `New Answer 1 - ${dateTag}`, isCorrect: true },
                { text: `New Answer 2 - ${dateTag}`, isCorrect: false },
              ],
            },
          ],
        });

        expect(result.updated).toHaveLength(1);
        expect(result.added).toBeUndefined();
        expect(result.deletedIds).toBeUndefined();

        // Verify answers were replaced
        const updatedQuestion = await jestPrisma.question.findUnique({
          where: { id: question.id },
          include: { answers: true },
        });

        expect(updatedQuestion?.answers).toHaveLength(2);
        expect(updatedQuestion?.answers.some((a) => a.text.includes('New Answer 1'))).toBe(true);
        expect(updatedQuestion?.answers.some((a) => a.text.includes('New Answer 2'))).toBe(true);

        // Old answer should be deleted
        const oldAnswerExists = await jestPrisma.answer.findUnique({
          where: { id: oldAnswer.id },
        });
        expect(oldAnswerExists).toBeNull();
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should create answers with new questions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-new-answers-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateQuestionsDataViaParams({
          addedItems: [
            {
              text: `Question with Answers - ${dateTag}`,
              topicId: topic.id,
              answers: [
                { text: `Correct Answer - ${dateTag}`, isCorrect: true },
                { text: `Wrong Answer - ${dateTag}`, isCorrect: false },
              ],
            } as TNewQuestion,
          ],
        });

        expect(result.added).toHaveLength(1);
        expect(result.updated).toBeUndefined();
        expect(result.deletedIds).toBeUndefined();

        const createdQuestion = await jestPrisma.question.findFirst({
          where: { topicId: topic.id, text: { contains: 'Question with Answers' } },
          include: { answers: true },
        });

        expect(createdQuestion?.answers).toHaveLength(2);
        expect(createdQuestion?.answers.some((a) => a.isCorrect)).toBe(true);
        expect(createdQuestion?.answers.some((a) => !a.isCorrect)).toBe(true);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should handle mixed new and existing answers when updating a question', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-mixed-answers-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });

        // Create two existing answers
        const existingAnswer1 = await jestPrisma.answer.create({
          data: {
            text: `Existing Answer 1 - ${dateTag}`,
            questionId: question.id,
            isCorrect: true,
          },
        });
        const existingAnswer2 = await jestPrisma.answer.create({
          data: {
            text: `Existing Answer 2 - ${dateTag}`,
            questionId: question.id,
            isCorrect: false,
          },
        });
        createdIds.push({ type: 'question', id: question.id });
        createdIds.push({ type: 'answer', id: existingAnswer1.id });
        createdIds.push({ type: 'answer', id: existingAnswer2.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        // Update question with:
        // - 1 updated existing answer (existingAnswer1)
        // - 1 new answer without ID
        // - Remove existingAnswer2 (not in the list)
        const result = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: question.id,
              text: `Updated Question - ${dateTag}`,
              topicId: topic.id,
              answers: [
                {
                  id: existingAnswer1.id, // ← Update this existing answer
                  text: `Modified Answer 1 - ${dateTag}`,
                  isCorrect: false, // Changed from true to false
                },
                {
                  // ← New answer without ID
                  text: `Brand New Answer - ${dateTag}`,
                  isCorrect: true,
                },
              ],
            },
          ],
        });

        expect(result.updated).toHaveLength(1);

        // Verify the changes
        const updatedQuestion = await jestPrisma.question.findUnique({
          where: { id: question.id },
          include: { answers: true },
        });

        expect(updatedQuestion?.answers).toHaveLength(2);

        // Check that existing answer was updated
        const modifiedAnswer = updatedQuestion?.answers.find((a) => a.id === existingAnswer1.id);
        expect(modifiedAnswer).toBeDefined();
        expect(modifiedAnswer?.text).toContain('Modified Answer 1');
        expect(modifiedAnswer?.isCorrect).toBe(false);

        // Check that new answer was created
        const newAnswer = updatedQuestion?.answers.find((a) => a.text.includes('Brand New Answer'));
        expect(newAnswer).toBeDefined();
        expect(newAnswer?.isCorrect).toBe(true);

        // Check that removed answer was deleted
        const removedAnswerExists = await jestPrisma.answer.findUnique({
          where: { id: existingAnswer2.id },
        });
        expect(removedAnswerExists).toBeNull();
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should handle new answers with __new prefix IDs', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-answer-ids-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        // Add new answers with __new prefix IDs
        const result = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: question.id,
              text: `Updated Question - ${dateTag}`,
              topicId: topic.id,
              answers: [
                {
                  id: '__new1', // Temporary ID
                  text: `New Answer 1 - ${dateTag}`,
                  isCorrect: true,
                },
                {
                  id: '__new2', // Temporary ID
                  text: `New Answer 2 - ${dateTag}`,
                  isCorrect: false,
                },
              ],
            },
          ],
        });

        expect(result.updated).toHaveLength(1);

        // Verify answers were actually created with real IDs
        const updatedQuestion = await jestPrisma.question.findUnique({
          where: { id: question.id },
          include: { answers: true },
        });

        expect(updatedQuestion?.answers).toHaveLength(2);
        expect(updatedQuestion?.answers.every((a) => !a.id.startsWith('__new'))).toBe(true);

        // Verify the answers have correct properties
        const answer1 = updatedQuestion?.answers.find((a) => a.text.includes('New Answer 1'));
        const answer2 = updatedQuestion?.answers.find((a) => a.text.includes('New Answer 2'));
        expect(answer1?.isCorrect).toBe(true);
        expect(answer2?.isCorrect).toBe(false);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should delete all answers when updating with empty answers array', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-delete-all-answers-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });

        await jestPrisma.answer.create({
          data: { text: `Answer 1 - ${dateTag}`, questionId: question.id, isCorrect: true },
        });
        await jestPrisma.answer.create({
          data: { text: `Answer 2 - ${dateTag}`, questionId: question.id, isCorrect: false },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateQuestionsDataViaParams({
          updatedItems: [
            {
              id: question.id,
              text: `Updated Question - ${dateTag}`,
              topicId: topic.id,
              answers: [], // Empty array should delete all answers
            },
          ],
        });

        expect(result.updated).toHaveLength(1);

        const updatedQuestion = await jestPrisma.question.findUnique({
          where: { id: question.id },
          include: { answers: true },
        });

        expect(updatedQuestion?.answers).toHaveLength(0);
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent question IDs in update gracefully', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-nonexistent-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        await expect(
          updateQuestionsDataViaParams({
            updatedItems: [
              {
                id: 'non-existent-id',
                text: 'Test',
                topicId: 'some-topic',
              },
            ],
            noDebug: true,
          }),
        ).rejects.toThrow();
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should handle partial deletions when some IDs do not exist', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `user-partial-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question - ${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        // Should delete the existing one and ignore non-existent
        const result: TUpdateQuestionsDataViaParamsResults = await updateQuestionsDataViaParams({
          deletedIds: [question.id, 'non-existent-id'],
        });

        expect(result.added).toBeUndefined();
        expect(result.updated).toBeUndefined();
        expect(result.deletedIds).toHaveLength(1);
        expect(result.deletedIds![0]).toBe(question.id);

        // Verify only the actual question was deleted
        const remainingQuestions = await jestPrisma.question.findMany({
          where: { topicId: topic.id },
        });
        expect(remainingQuestions).toHaveLength(0);
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });
});
