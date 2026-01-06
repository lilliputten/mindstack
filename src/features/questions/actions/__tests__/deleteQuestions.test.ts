import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { deleteQuestions } from '../deleteQuestions';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'question'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('deleteQuestions', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should delete multiple questions for topic owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-delete-multiple-questions-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${dateTag}`, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question1 = await jestPrisma.question.create({
        data: { text: `Question1-${dateTag}`, topicId: topic.id },
      });
      const question2 = await jestPrisma.question.create({
        data: { text: `Question2-${dateTag}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question1.id });
      createdIds.push({ type: 'question', id: question2.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteQuestions([question1.id, question2.id]);
      expect(result.count).toBe(2);

      // Verify questions are deleted
      const remainingQuestions = await jestPrisma.question.findMany({
        where: { id: { in: [question1.id, question2.id] } },
      });
      expect(remainingQuestions).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete multiple questions for admin user', async () => {
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

      const question1 = await jestPrisma.question.create({
        data: { text: `Question1-${dateTag}`, topicId: topic.id },
      });
      const question2 = await jestPrisma.question.create({
        data: { text: `Question2-${dateTag}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question1.id });
      createdIds.push({ type: 'question', id: question2.id });

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const result = await deleteQuestions([question1.id, question2.id]);
      expect(result.count).toBe(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);
    await expect(deleteQuestions(['question1', 'question2'])).rejects.toThrow('Undefined user');
  });

  it('should throw error when some questions are not found', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-some-questions-are-not-found-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(deleteQuestions(['nonexistent1', 'nonexistent2'])).rejects.toThrow(
        'Some questions not found',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to delete questions', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `owner-quest-${dateTag}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `other-quest-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });
      createdIds.push({ type: 'user', id: otherUser.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${dateTag}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${dateTag}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      await expect(deleteQuestions([question.id])).rejects.toThrow(
        'Current user is not allowed to delete the question',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle empty array', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-handle-empty-array-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteQuestions([]);
      expect(result.count).toBe(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
