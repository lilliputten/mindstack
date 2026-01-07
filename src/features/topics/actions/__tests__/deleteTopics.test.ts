import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { deleteTopics } from '../deleteTopics';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId = { type: 'user'; id: string } | { type: 'topic'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('deleteTopics', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should delete multiple topics for owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: `Topic1-${dateTag}`, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: `Topic2-${dateTag}`, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic1.id });
      createdIds.push({ type: 'topic', id: topic2.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteTopics([topic1.id, topic2.id]);
      expect(result.count).toBe(2);

      // Verify topics are deleted
      const remainingTopics = await jestPrisma.topic.findMany({
        where: { id: { in: [topic1.id, topic2.id] } },
      });
      expect(remainingTopics).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete multiple topics for admin user', async () => {
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

      const topic1 = await jestPrisma.topic.create({
        data: { name: `Topic1-${dateTag}`, userId: owner.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: `Topic2-${dateTag}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic1.id });
      createdIds.push({ type: 'topic', id: topic2.id });

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const result = await deleteTopics([topic1.id, topic2.id]);
      expect(result.count).toBe(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);
    await expect(deleteTopics(['topic1', 'topic2'])).rejects.toThrow('Undefined user');
  });

  it('should throw error when some topics are not found', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(deleteTopics(['nonexistent1', 'nonexistent2'])).rejects.toThrow(
        'Some topics not found',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to delete topics', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `owner-auth-${dateTag}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `other-auth-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });
      createdIds.push({ type: 'user', id: otherUser.id });

      const topic = await jestPrisma.topic.create({
        data: { name: `Topic-${dateTag}`, userId: owner.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      await expect(deleteTopics([topic.id])).rejects.toThrow(
        'Current user is not allowed to delete the topic',
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
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteTopics([]);
      expect(result.count).toBe(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
