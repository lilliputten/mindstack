import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';
import { generateTestEmail } from '@/jest/test/testUtils';

import { deleteAnswers } from '../deleteAnswers';

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

describe('deleteAnswers', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should delete multiple answers for topic owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('user'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${dateTag}`, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${dateTag}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      const answer1 = await jestPrisma.answer.create({
        data: { text: `Answer1-${dateTag}`, questionId: question.id },
      });
      const answer2 = await jestPrisma.answer.create({
        data: { text: `Answer2-${dateTag}`, questionId: question.id },
      });
      createdIds.push({ type: 'answer', id: answer1.id });
      createdIds.push({ type: 'answer', id: answer2.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteAnswers([answer1.id, answer2.id]);
      expect(result.count).toBe(2);

      // Verify answers are deleted
      const remainingAnswers = await jestPrisma.answer.findMany({
        where: { id: { in: [answer1.id, answer2.id] } },
      });
      expect(remainingAnswers).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete multiple answers for admin user', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: generateTestEmail('owner'), role: 'USER' },
      });
      const admin = await jestPrisma.user.create({
        data: { email: generateTestEmail('admin'), role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: owner.id });
      createdIds.push({ type: 'user', id: admin.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${dateTag}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const question = await jestPrisma.question.create({
        data: { text: `Question-${dateTag}`, topicId: topic.id },
      });
      createdIds.push({ type: 'question', id: question.id });

      const answer1 = await jestPrisma.answer.create({
        data: { text: `Answer1-${dateTag}`, questionId: question.id },
      });
      const answer2 = await jestPrisma.answer.create({
        data: { text: `Answer2-${dateTag}`, questionId: question.id },
      });
      createdIds.push({ type: 'answer', id: answer1.id });
      createdIds.push({ type: 'answer', id: answer2.id });

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const result = await deleteAnswers([answer1.id, answer2.id]);
      expect(result.count).toBe(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);
    await expect(deleteAnswers(['answer1', 'answer2'])).rejects.toThrow('Undefined user');
  });

  it('should throw error when some answers are not found', async () => {
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('user'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(deleteAnswers(['nonexistent1', 'nonexistent2'])).rejects.toThrow(
        'Some answers not found',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to delete answers', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: generateTestEmail('owner-del'), role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: generateTestEmail('other-del'), role: 'USER' },
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

      const answer = await jestPrisma.answer.create({
        data: { text: `Answer-${dateTag}`, questionId: question.id },
      });
      createdIds.push({ type: 'answer', id: answer.id });

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      await expect(deleteAnswers([answer.id])).rejects.toThrow(
        'Current user is not allowed to delete the answer',
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
        data: { email: generateTestEmail('user-empty'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteAnswers([]);
      expect(result.count).toBe(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
