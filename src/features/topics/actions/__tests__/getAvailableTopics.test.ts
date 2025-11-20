// import { ExtendedUser } from '@/@types/next-auth';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { getAvailableTopics } from '../getAvailableTopics';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'question'; id: string }
  | { type: 'workout'; userId: string; topicId: string }
  | { type: 'workoutStats'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'workoutStats') {
      await jestPrisma.workoutStats.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'workout') {
      await jestPrisma.userTopicWorkout.deleteMany({
        where: { userId: created.userId, topicId: created.topicId },
      });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getAvailableTopics', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return only public topics for an unauthorized user', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
      createdIds.push({ type: 'user', id: user.id });
      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Private', isPublic: false, userId: user.id },
      });
      const topicIds = [topic1, topic2].map(({ id }) => id);
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items, totalCount } = await getAvailableTopics({ topicIds, noDebug: true });
      expect(items).toHaveLength(1);
      expect(totalCount).toBe(1);
      expect(items[0].id).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return public and own topics for an authorized user by default', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com`, role: 'USER' },
      });
      const user2 = await jestPrisma.user.create({ data: { email: `user2-${dateTag}@test.com` } });
      [user1, user2].forEach(({ id }) => createdIds.push({ type: 'user', id }));
      const topic0 = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user2.id },
      });
      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Private', isPublic: false, userId: user1.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'User2 Private', isPublic: false, userId: user2.id },
      });
      const topicIds = [topic0, topic1, topic2].map(({ id }) => id);
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      mockedGetCurrentUser.mockResolvedValue(user1 as TUser);
      const { items, totalCount } = await getAvailableTopics({ topicIds, noDebug: true });
      expect(totalCount).toBe(2);
      expect(items.map((t) => t.id).sort()).toEqual([topic0.id, topic1.id].sort());
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return only own topics for an authorized user when showOnlyMyTopics is true', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com`, role: 'USER' },
      });
      const user2 = await jestPrisma.user.create({
        data: { email: `user2-${dateTag}@test.com`, role: 'USER' },
      });
      [user1, user2].forEach(({ id }) => createdIds.push({ type: 'user', id }));
      const topic1 = await jestPrisma.topic.create({
        data: { name: `public-${dateTag}`, isPublic: false, userId: user1.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: `public-${dateTag}`, isPublic: true, userId: user2.id },
      });
      const topicIds = [topic1, topic2].map(({ id }) => id);
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      mockedGetCurrentUser.mockResolvedValue(user1 as TUser);
      const { items, totalCount } = await getAvailableTopics({
        topicIds,
        showOnlyMyTopics: true,
        noDebug: true,
      });
      expect(totalCount).toBe(1);
      expect(items[0].id).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return all topics for an admin user in adminMode', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const admin = await jestPrisma.user.create({
        data: { email: `admin-${dateTag}@test.com`, role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: admin.id });
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user1.id });
      const t1 = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user1.id },
      });
      const t2 = await jestPrisma.topic.create({
        data: { name: 'Private', isPublic: false, userId: user1.id },
      });
      const t3 = await jestPrisma.topic.create({
        data: { name: 'Admin', isPublic: false, userId: admin.id },
      });
      const topicIds = [t1.id, t2.id, t3.id];
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      mockedGetCurrentUser.mockResolvedValue(admin as TUser);
      const { items, totalCount } = await getAvailableTopics({
        topicIds,
        adminMode: true,
        noDebug: true,
      });
      expect(totalCount).toBe(3);
      expect(items).toHaveLength(3);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not allow non-admin user to use adminMode', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user1.id });
      mockedGetCurrentUser.mockResolvedValue(user1);
      await expect(getAvailableTopics({ adminMode: true, noDebug: true })).rejects.toThrow(
        'Admin mode is allowed only for administrators',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include user info when includeUser is true', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com` },
      });
      createdIds.push({ type: 'user', id: user1.id });
      const publicTopic = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user1.id },
      });
      createdIds.push({ type: 'topic', id: publicTopic.id });
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items } = await getAvailableTopics({ includeUser: true, noDebug: true });
      expect(items[0].user).toBeDefined();
      expect(items[0].user).not.toBeFalsy();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not include user info when includeUser is false', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com` },
      });
      createdIds.push({ type: 'user', id: user1.id });
      const publicTopic = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user1.id },
      });
      createdIds.push({ type: 'topic', id: publicTopic.id });
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items } = await getAvailableTopics({ includeUser: false, noDebug: true });
      expect(items[0].user).toBeFalsy();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include workout info when includeWorkout is true', async () => {
    const now = new Date();
    const dateTag = formatDateTag(now);
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({ data: { email: `user1-${dateTag}@test.com` } });
      createdIds.push({ type: 'user', id: user1.id });
      const t1 = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user1.id },
      });
      [t1].forEach(({ id }) => createdIds.push({ type: 'topic', id }));
      const w1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user1.id, topicId: t1.id },
      });
      [w1].forEach(({ userId, topicId }) => createdIds.push({ type: 'workout', userId, topicId }));
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items } = await getAvailableTopics({ includeWorkout: true, noDebug: true });
      expect(items[0].userTopicWorkout).toBeDefined();
      expect(items[0].userTopicWorkout).not.toBeFalsy();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include questions count when includeQuestionsCount is true', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-${dateTag}@test.com` },
      });
      createdIds.push({ type: 'user', id: user1.id });
      const publicTopic = await jestPrisma.topic.create({
        data: { name: 'Public', isPublic: true, userId: user1.id },
      });
      createdIds.push({ type: 'topic', id: publicTopic.id });
      const question = await jestPrisma.question.create({
        data: { text: 'Q1', topicId: publicTopic.id },
      });
      createdIds.push({ type: 'question', id: question.id });
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items } = await getAvailableTopics({ includeQuestionsCount: true, noDebug: true });
      expect(items.find((t) => t.id === publicTopic.id)?._count?.questions).toBe(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle pagination with skip and take', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-pagination-${dateTag}@test.com` },
      });
      createdIds.push({ type: 'user', id: user.id });
      const t1 = await jestPrisma.topic.create({
        data: { name: `t1-${dateTag}`, isPublic: true, userId: user.id },
      });
      const t2 = await jestPrisma.topic.create({
        data: { name: `t2-${dateTag}`, isPublic: true, userId: user.id },
      });
      const t3 = await jestPrisma.topic.create({
        data: { name: `t3-${dateTag}`, isPublic: true, userId: user.id },
      });
      const topicIds = [t1.id, t2.id, t3.id];
      topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
      mockedGetCurrentUser.mockResolvedValue(undefined);
      const { items: page1, totalCount } = await getAvailableTopics({
        topicIds,
        take: 2,
        orderBy: { name: 'asc' },
        noDebug: true,
      });
      expect(page1).toHaveLength(2);
      expect(totalCount).toBe(3);
      const { items: page2 } = await getAvailableTopics({
        topicIds,
        skip: 2,
        take: 2,
        noDebug: true,
      });
      expect(page2).toHaveLength(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  describe('search and filter parameters', () => {
    it('should filter by searchText in name, description, keywords', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: {
            name: 'JavaScript Basics',
            description: 'Learn JS',
            isPublic: true,
            userId: user.id,
          },
        });
        const t2 = await jestPrisma.topic.create({
          data: {
            name: 'Python Advanced',
            keywords: 'javascript,python',
            isPublic: true,
            userId: user.id,
          },
        });
        const t3 = await jestPrisma.topic.create({
          data: {
            name: 'React Components',
            description: 'UI components',
            isPublic: true,
            userId: user.id,
          },
        });
        [t1, t2, t3].forEach(({ id }) => createdIds.push({ type: 'topic', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const topicIds = [t1.id, t2.id, t3.id];
        const { items } = await getAvailableTopics({
          topicIds,
          searchText: 'javascript',
          noDebug: true,
        });
        expect(items).toHaveLength(2);
        expect(items.map((t) => t.id).sort()).toEqual([t1.id, t2.id].sort());
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should filter by hasWorkoutStats', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: { name: 'With Stats', isPublic: true, userId: user.id },
        });
        const t2 = await jestPrisma.topic.create({
          data: { name: 'Without Stats', isPublic: true, userId: user.id },
        });
        const topicIds = [t1.id, t2.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        // Create workout first, then stats
        const _workout = await jestPrisma.userTopicWorkout.create({
          data: { userId: user.id, topicId: t1.id },
        });
        createdIds.push({ type: 'workout', userId: user.id, topicId: t1.id });
        const stats = await jestPrisma.workoutStats.create({
          data: {
            userId: user.id,
            topicId: t1.id,
            totalQuestions: 5,
            correctAnswers: 3,
            ratio: 60,
            timeSeconds: 120,
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        });
        createdIds.push({ type: 'workoutStats', id: stats.id });
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: withStats } = await getAvailableTopics({
          topicIds,
          hasWorkoutStats: true,
          noDebug: true,
        });
        expect(withStats).toHaveLength(1);
        expect(withStats[0].id).toBe(t1.id);
        const { items: withoutStats } = await getAvailableTopics({
          topicIds,
          hasWorkoutStats: false,
          noDebug: true,
        });
        expect(withoutStats).toHaveLength(1);
        expect(withoutStats[0].id).toBe(t2.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should filter by hasActiveWorkouts', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: { name: 'Active Workout', isPublic: true, userId: user.id },
        });
        const t2 = await jestPrisma.topic.create({
          data: { name: 'No Active Workout', isPublic: true, userId: user.id },
        });
        const topicIds = [t1.id, t2.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        await jestPrisma.userTopicWorkout.create({
          data: { userId: user.id, topicId: t1.id, started: true, finished: false },
        });
        createdIds.push({ type: 'workout', userId: user.id, topicId: t1.id });
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: withActive } = await getAvailableTopics({
          topicIds,
          hasActiveWorkouts: true,
          noDebug: true,
        });
        expect(withActive).toHaveLength(1);
        expect(withActive[0].id).toBe(t1.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should filter by date ranges', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const oldDate = new Date('2023-01-01');
        const recentDate = new Date('2024-01-01');
        const t1 = await jestPrisma.topic.create({
          data: {
            name: 'Old Topic',
            isPublic: true,
            userId: user.id,
            createdAt: oldDate,
            updatedAt: oldDate,
          },
        });
        const t2 = await jestPrisma.topic.create({
          data: {
            name: 'Recent Topic',
            isPublic: true,
            userId: user.id,
            createdAt: recentDate,
            updatedAt: recentDate,
          },
        });
        const topicIds = [t1.id, t2.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: afterDate } = await getAvailableTopics({
          topicIds,
          minCreatedAt: new Date('2023-12-01'),
          noDebug: true,
        });
        expect(afterDate).toHaveLength(1);
        expect(afterDate[0].id).toBe(t2.id);
        const { items: beforeDate } = await getAvailableTopics({
          topicIds,
          maxUpdatedAt: new Date('2023-12-01'),
          noDebug: true,
        });
        expect(beforeDate).toHaveLength(1);
        expect(beforeDate[0].id).toBe(t1.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should filter by language', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: {
            name: 'English Topic',
            isPublic: true,
            userId: user.id,
            langCode: 'en',
            langName: 'English',
          },
        });
        const t2 = await jestPrisma.topic.create({
          data: {
            name: 'Spanish Topic',
            isPublic: true,
            userId: user.id,
            langCode: 'es',
            langName: 'Spanish',
          },
        });
        const topicIds = [t1.id, t2.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: byCode } = await getAvailableTopics({
          topicIds,
          langCode: 'en',
          noDebug: true,
        });
        expect(byCode).toHaveLength(1);
        expect(byCode[0].id).toBe(t1.id);
        const { items: byName } = await getAvailableTopics({
          topicIds,
          langName: 'Spanish',
          noDebug: true,
        });
        expect(byName).toHaveLength(1);
        expect(byName[0].id).toBe(t2.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should filter by hasQuestions', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: { name: 'With Questions', isPublic: true, userId: user.id },
        });
        const t2 = await jestPrisma.topic.create({
          data: { name: 'Without Questions', isPublic: true, userId: user.id },
        });
        const topicIds = [t1.id, t2.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        const question = await jestPrisma.question.create({
          data: { text: 'Test Question', topicId: t1.id },
        });
        createdIds.push({ type: 'question', id: question.id });
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: withQuestions } = await getAvailableTopics({
          topicIds,
          hasQuestions: true,
          noDebug: true,
        });
        expect(withQuestions).toHaveLength(1);
        expect(withQuestions[0].id).toBe(t1.id);
        const { items: withoutQuestions } = await getAvailableTopics({
          topicIds,
          hasQuestions: false,
          noDebug: true,
        });
        expect(withoutQuestions).toHaveLength(1);
        expect(withoutQuestions[0].id).toBe(t2.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should search by searchLang in both langCode and langName', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: {
            name: 'English Topic',
            isPublic: true,
            userId: user.id,
            langCode: 'en',
            langName: 'English',
          },
        });
        const t2 = await jestPrisma.topic.create({
          data: {
            name: 'Spanish Topic',
            isPublic: true,
            userId: user.id,
            langCode: 'es',
            langName: 'Español',
          },
        });
        const t3 = await jestPrisma.topic.create({
          data: {
            name: 'German Topic',
            isPublic: true,
            userId: user.id,
            langCode: 'de',
            langName: 'Deutsch',
          },
        });
        const topicIds = [t1.id, t2.id, t3.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        // Test exact langCode match
        const { items: exactMatch } = await getAvailableTopics({
          topicIds,
          searchLang: 'en',
          noDebug: true,
        });
        expect(exactMatch).toHaveLength(1);
        expect(exactMatch[0].id).toBe(t1.id);
        // Test partial langName match
        const { items: partialMatch } = await getAvailableTopics({
          topicIds,
          searchLang: 'eut',
          noDebug: true,
        });
        expect(partialMatch).toHaveLength(1);
        expect(partialMatch[0].id).toBe(t3.id);
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });

  describe('orderBy', () => {
    it('should order by name alphabetically', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: { name: 'B Topic', isPublic: true, userId: user.id },
        });
        const t2 = await jestPrisma.topic.create({
          data: { name: 'A Topic', isPublic: true, userId: user.id },
        });
        const t3 = await jestPrisma.topic.create({
          data: { name: 'C Topic', isPublic: true, userId: user.id },
        });
        const topicIds = [t1.id, t2.id, t3.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items: asc } = await getAvailableTopics({
          topicIds,
          orderBy: { name: 'asc' },
          noDebug: true,
        });
        expect(asc.map((t) => t.name)).toEqual([
          // Compare results...
          'A Topic',
          'B Topic',
          'C Topic',
        ]);
        const { items: desc } = await getAvailableTopics({
          topicIds,
          orderBy: { name: 'desc' },
          noDebug: true,
        });
        expect(desc.map((t) => t.name)).toEqual([
          // Compare results...
          'C Topic',
          'B Topic',
          'A Topic',
        ]);
      } finally {
        await cleanupDb(createdIds);
      }
    });

    it('should order by question count', async () => {
      const dateTag = formatDateTag();
      const createdIds: CreatedId[] = [];
      try {
        const user = await jestPrisma.user.create({ data: { email: `user-${dateTag}@test.com` } });
        createdIds.push({ type: 'user', id: user.id });
        const t1 = await jestPrisma.topic.create({
          data: { name: 'Topic 1 (1q)', isPublic: true, userId: user.id },
        });
        const t2 = await jestPrisma.topic.create({
          data: { name: 'Topic 2 (2q)', isPublic: true, userId: user.id },
        });
        const t3 = await jestPrisma.topic.create({
          data: { name: 'Topic 3 (0q)', isPublic: true, userId: user.id },
        });
        const topicIds = [t1.id, t2.id, t3.id];
        topicIds.forEach((id) => createdIds.push({ type: 'topic', id }));
        const q1 = await jestPrisma.question.create({ data: { text: 'q1', topicId: t2.id } });
        const q2 = await jestPrisma.question.create({ data: { text: 'q2', topicId: t2.id } });
        const q3 = await jestPrisma.question.create({ data: { text: 'q3', topicId: t1.id } });
        [q1, q2, q3].forEach(({ id }) => createdIds.push({ type: 'question', id }));
        mockedGetCurrentUser.mockResolvedValue(undefined);
        const { items } = await getAvailableTopics({
          topicIds,
          orderBy: { questions: { _count: 'desc' } },
          noDebug: true,
        });
        const topicNames = items.map((t) => t.name);
        expect(topicNames).toEqual([
          // Compare results...
          'Topic 2 (2q)',
          'Topic 1 (1q)',
          'Topic 3 (0q)',
        ]);
      } finally {
        await cleanupDb(createdIds);
      }
    });
  });
});
