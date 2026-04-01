import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { newItemIdPrefix } from '@/entities/HeadlessEditor';
import { TNewAnswer, TNewOrOldAnswer } from '@/features/answers/types';
import { TUser } from '@/features/users/types/TUser';

import {
  TUpdateAnswersDataViaParamsResults,
  updateAnswersDataViaParams,
} from '../updateAnswersDataViaParams';

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

describe('updateAnswersDataViaParams', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    consoleErrorSpy.mockRestore();
  });

  describe('Basic Operations', () => {
    it('should handle empty data', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-empty-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result: TUpdateAnswersDataViaParamsResults = await updateAnswersDataViaParams({});
        expect(result).toEqual({});
      } finally {
        await cleanupDb(createdIds);
      }
    });

    /** ADMIN bypasses `checkAnswersLimit`; BASIC users often hit ANSWERS_LIMIT_REACHED in CI DB. */
    it('should add new answers', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-add-${dateTag}@test.com`, role: 'ADMIN' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-Ans-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question-Ans-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const newAnswers: TNewAnswer[] = [
          {
            text: `New Answer 1 - ${dateTag}`,
            questionId: question.id,
            isCorrect: true,
          },
          {
            text: `New Answer 2 - ${dateTag}`,
            questionId: question.id,
            isCorrect: false,
          },
        ];

        const result: TUpdateAnswersDataViaParamsResults = await updateAnswersDataViaParams({
          addedItems: newAnswers,
        });

        expect(result.added).toHaveLength(2);
        expect(result.updated).toBeUndefined();
        expect(result.deletedIds).toBeUndefined();

        const created = await jestPrisma.answer.findMany({
          where: { questionId: question.id },
        });
        expect(created).toHaveLength(2);
        expect(created.some((a) => a.isCorrect)).toBe(true);
        expect(created.some((a) => !a.isCorrect)).toBe(true);
        created.forEach((a) => createdIds.push({ type: 'answer', id: a.id }));
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should map temporary ids for new answers', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-newid-${dateTag}@test.com`, role: 'ADMIN' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-NewId-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question-NewId-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const tempId = `${newItemIdPrefix}ans-${dateTag}`;
        const result = await updateAnswersDataViaParams({
          addedItems: [
            {
              id: tempId,
              text: `Temp id answer - ${dateTag}`,
              questionId: question.id,
              isCorrect: true,
            },
          ],
        });

        expect(result.added).toHaveLength(1);
        expect(result.autoAddedIds?.[tempId]).toBe(result.added![0].id);
        createdIds.push({ type: 'answer', id: result.added![0].id });
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should update existing answers', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-upd-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-Upd-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question-Upd-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const answer = await jestPrisma.answer.create({
          data: {
            text: `Original - ${dateTag}`,
            questionId: question.id,
            isCorrect: false,
          },
        });
        createdIds.push({ type: 'answer', id: answer.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const updatedItems: TNewOrOldAnswer[] = [
          {
            id: answer.id,
            text: `Updated - ${dateTag}`,
            questionId: question.id,
            isCorrect: true,
          },
        ];

        const result: TUpdateAnswersDataViaParamsResults = await updateAnswersDataViaParams({
          updatedItems,
        });

        expect(result.updated).toHaveLength(1);
        expect(result.updated![0].text).toContain('Updated');
        expect(result.updated![0].isCorrect).toBe(true);

        const fromDb = await jestPrisma.answer.findUnique({ where: { id: answer.id } });
        expect(fromDb?.text).toContain('Updated');
        expect(fromDb?.isCorrect).toBe(true);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should delete answers', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-del-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-Del-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question-Del-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const a1 = await jestPrisma.answer.create({
          data: { text: `A1 - ${dateTag}`, questionId: question.id },
        });
        const a2 = await jestPrisma.answer.create({
          data: { text: `A2 - ${dateTag}`, questionId: question.id },
        });
        createdIds.push({ type: 'answer', id: a1.id });
        createdIds.push({ type: 'answer', id: a2.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateAnswersDataViaParams({ deletedIds: [a1.id] });

        expect(result.deletedIds).toHaveLength(1);
        expect(result.deletedIds![0]).toBe(a1.id);

        const remaining = await jestPrisma.answer.findMany({ where: { questionId: question.id } });
        expect(remaining).toHaveLength(1);
        expect(remaining[0].id).toBe(a2.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should perform add, update, and delete in one call', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `answers-user-combo-${dateTag}@test.com`, role: 'ADMIN' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-Combo-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Question-Combo-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const existing = await jestPrisma.answer.create({
          data: { text: `Existing - ${dateTag}`, questionId: question.id, isCorrect: false },
        });
        const toDel = await jestPrisma.answer.create({
          data: { text: `To delete - ${dateTag}`, questionId: question.id },
        });
        createdIds.push({ type: 'answer', id: existing.id });
        createdIds.push({ type: 'answer', id: toDel.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateAnswersDataViaParams({
          updatedItems: [
            {
              id: existing.id,
              text: `Updated existing - ${dateTag}`,
              questionId: question.id,
              isCorrect: true,
            },
          ],
          addedItems: [{ text: `Added - ${dateTag}`, questionId: question.id } as TNewAnswer],
          deletedIds: [toDel.id],
        });

        expect(result.updated).toHaveLength(1);
        expect(result.added).toHaveLength(1);
        expect(result.deletedIds).toHaveLength(1);

        const finalAnswers = await jestPrisma.answer.findMany({
          where: { questionId: question.id },
        });
        expect(finalAnswers).toHaveLength(2);
        if (result.added?.[0]) {
          createdIds.push({ type: 'answer', id: result.added[0].id });
        }
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('Security Checks', () => {
    it('should throw when user is not authenticated', async () => {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      await expect(
        updateAnswersDataViaParams({
          addedItems: [{ text: 'Test', questionId: 'some-id' } as TNewAnswer],
        }),
      ).rejects.toThrow('Undefined user');
    });

    it('should throw when user tries to modify answers they do not own', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const owner = await jestPrisma.user.create({
          data: { email: `ans-owner-${dateTag}@test.com`, role: 'USER' },
        });
        const other = await jestPrisma.user.create({
          data: { email: `ans-other-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: owner.id });
        createdIds.push({ type: 'user', id: other.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-sec-${dateTag}`, userId: owner.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Q-sec-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const answer = await jestPrisma.answer.create({
          data: { text: `A-sec-${dateTag}`, questionId: question.id },
        });
        createdIds.push({ type: 'answer', id: answer.id });

        mockedGetCurrentUser.mockResolvedValue(other as TUser);

        await expect(
          updateAnswersDataViaParams({
            updatedItems: [
              {
                id: answer.id,
                text: `Hacked - ${dateTag}`,
                questionId: question.id,
              },
            ],
          }),
        ).rejects.toThrow('Current user is not allowed to modify answers for some questions');
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should allow admin to modify any answers', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const owner = await jestPrisma.user.create({
          data: { email: `ans-own2-${dateTag}@test.com`, role: 'USER' },
        });
        const admin = await jestPrisma.user.create({
          data: { email: `ans-adm-${dateTag}@test.com`, role: 'ADMIN' },
        });
        createdIds.push({ type: 'user', id: owner.id });
        createdIds.push({ type: 'user', id: admin.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-adm-${dateTag}`, userId: owner.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Q-adm-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const answer = await jestPrisma.answer.create({
          data: { text: `A-adm-${dateTag}`, questionId: question.id },
        });
        createdIds.push({ type: 'answer', id: answer.id });

        mockedGetCurrentUser.mockResolvedValue(admin as TUser);

        const result = await updateAnswersDataViaParams({
          updatedItems: [
            {
              id: answer.id,
              text: `Admin ok - ${dateTag}`,
              questionId: question.id,
            },
          ],
        });

        expect(result.updated).toHaveLength(1);
        expect(result.updated![0].text).toContain('Admin ok');
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should reject update for non-existent answer id', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `ans-ne-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-ne-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Q-ne-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        await expect(
          updateAnswersDataViaParams({
            updatedItems: [
              {
                id: 'non-existent-answer-id',
                text: 'x',
                questionId: question.id,
              },
            ],
          }),
        ).rejects.toThrow();
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should return only existing ids for partial delete list', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({
          data: { email: `ans-part-${dateTag}@test.com`, role: 'USER' },
        });
        createdIds.push({ type: 'user', id: user.id });

        const topic = await jestPrisma.topic.create({
          data: { name: `Topic-part-${dateTag}`, userId: user.id },
        });
        createdIds.push({ type: 'topic', id: topic.id });

        const question = await jestPrisma.question.create({
          data: { text: `Q-part-${dateTag}`, topicId: topic.id },
        });
        createdIds.push({ type: 'question', id: question.id });

        const answer = await jestPrisma.answer.create({
          data: { text: `A-part-${dateTag}`, questionId: question.id },
        });
        createdIds.push({ type: 'answer', id: answer.id });

        mockedGetCurrentUser.mockResolvedValue(user as TUser);

        const result = await updateAnswersDataViaParams({
          deletedIds: [answer.id, 'non-existent-answer-id'],
        });

        expect(result.deletedIds).toHaveLength(1);
        expect(result.deletedIds![0]).toBe(answer.id);

        const remaining = await jestPrisma.answer.findMany({ where: { questionId: question.id } });
        expect(remaining).toHaveLength(0);
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });
});
