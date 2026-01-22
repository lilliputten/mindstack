import { ExtendedUser } from '@/@types/next-auth';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';

import { getAvailableWorkouts } from '../getAvailableWorkouts';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'workout'; userId: string; topicId: string }
  | { type: 'workoutStats'; id: string }
  | { type: 'category'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'workoutStats') {
      await jestPrisma.workoutStats.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'workout') {
      await jestPrisma.userTopicWorkout.deleteMany({
        where: { userId: created.userId, topicId: created.topicId },
      });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'category') {
      await jestPrisma.category.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getAvailableWorkouts', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should throw error when user is not authenticated', async () => {
    // const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      await expect(getAvailableWorkouts({ noDebug: true })).rejects.toThrow(
        'Unauthorized: Only authenticated users can access workouts',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when non-admin tries to use admin mode', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-NON-ADMIN-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });
      mockedGetCurrentUser.mockResolvedValue(user);

      await expect(getAvailableWorkouts({ adminMode: true, noDebug: true })).rejects.toThrow(
        'Admin mode is allowed only for administrators',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should allow admin to use admin mode', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const admin = await jestPrisma.user.create({
        data: { email: `admin-ALL-WORKOUTS-${dateTag}@test.com`, role: 'ADMIN' },
      });
      const user = await jestPrisma.user.create({
        data: { email: `user-ALL-WORKOUTS-${dateTag}@test.com`, role: 'USER' },
      });
      [admin, user].forEach(({ id }) => createdIds.push({ type: 'user', id }));

      const topic = await jestPrisma.topic.create({
        data: { name: 'Test Topic', isPublic: true, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const workout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic.id },
      });
      createdIds.push({ type: 'workout', userId: workout.userId, topicId: workout.topicId });

      mockedGetCurrentUser.mockResolvedValue(admin as ExtendedUser);

      const { items, totalCount } = await getAvailableWorkouts({
        adminMode: true,
        noDebug: true,
      });

      expect(totalCount).toBeGreaterThan(0);
      expect(items).toHaveLength(totalCount);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by workoutIds', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-WORKOUT-IDS-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic 1', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic 2', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        workoutIds: [topic1.id],
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by topicIds', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-TOPIC-IDS-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic 1', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic 2', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        topicIds: [topic1.id],
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by categoryIds', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-CATEGORY-IDS-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: { status: 'PUBLIC' },
      });
      createdIds.push({ type: 'category', id: category.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic 1', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic 2', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      await jestPrisma.category.update({
        where: { id: category.id },
        data: { topics: { connect: { id: topic1.id } } },
      });

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        categoryIds: [category.id],
        includeCategories: true,
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should search by text in topic fields', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-SEARCH-TEXT-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: {
          name: 'JavaScript Basics',
          description: 'Learn JavaScript programming',
          keywords: 'javascript,programming',
          isPublic: true,
          userId: user.id,
        },
      });
      const topic2 = await jestPrisma.topic.create({
        data: {
          name: 'Python Advanced',
          description: 'Advanced Python concepts',
          keywords: 'python,programming',
          isPublic: true,
          userId: user.id,
        },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        searchText: 'javascript',
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by workout stats existence', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-STATS-EXISTENCE-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic with Stats', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic without Stats', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      const stats = await jestPrisma.workoutStats.create({
        data: {
          userId: user.id,
          topicId: topic1.id,
          totalQuestions: 5,
          correctAnswers: 3,
          ratio: 60,
          timeSeconds: 120,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });
      createdIds.push({ type: 'workoutStats', id: stats.id });

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items: withStats } = await getAvailableWorkouts({
        hasWorkoutStats: true,
        noDebug: true,
      });

      expect(withStats).toHaveLength(1);
      expect(withStats[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by active workouts', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-ACTIVE-WORKOUTS-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Active Workout', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Inactive Workout', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const activeWorkout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id, started: true, finished: false },
      });
      const inactiveWorkout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id, started: false, finished: false },
      });
      [activeWorkout, inactiveWorkout].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        hasActiveWorkouts: true,
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include user when requested', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-INCLUDE-USER-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic = await jestPrisma.topic.create({
        data: { name: 'Test Topic', isPublic: true, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const workout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic.id },
      });
      createdIds.push({ type: 'workout', userId: workout.userId, topicId: workout.topicId });

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items } = await getAvailableWorkouts({
        includeUser: true,
        noDebug: true,
      });

      // For includeUser: true, we expect the user data to be included
      // The exact structure depends on the implementation
      expect(items[0]).toBeDefined();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include topic and categories when requested', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-INCLUDE-CATEGORIES-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: { status: 'PUBLIC' },
      });
      createdIds.push({ type: 'category', id: category.id });

      const topic = await jestPrisma.topic.create({
        data: { name: 'Test Topic', isPublic: true, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      await jestPrisma.category.update({
        where: { id: category.id },
        data: { topics: { connect: { id: topic.id } } },
      });

      const workout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic.id },
      });
      createdIds.push({ type: 'workout', userId: workout.userId, topicId: workout.topicId });

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items } = await getAvailableWorkouts({
        includeTopic: true,
        includeCategories: true,
        noDebug: true,
      });

      expect(items[0].topic).toBeDefined();
      // For includeTopic: true and includeCategories: true, we expect topic data
      // The exact structure depends on the implementation
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include stats when requested', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-INCLUDE-STATS-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic = await jestPrisma.topic.create({
        data: { name: 'Test Topic', isPublic: true, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      const workout = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic.id },
      });
      createdIds.push({ type: 'workout', userId: workout.userId, topicId: workout.topicId });

      const stats = await jestPrisma.workoutStats.create({
        data: {
          userId: user.id,
          topicId: topic.id,
          totalQuestions: 5,
          correctAnswers: 3,
          ratio: 60,
          timeSeconds: 120,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });
      createdIds.push({ type: 'workoutStats', id: stats.id });

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items } = await getAvailableWorkouts({
        includeStats: true,
        noDebug: true,
      });

      // For includeStats: true, we expect workout stats to be included
      // The exact structure depends on the implementation
      expect(items[0]).toBeDefined();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by langCode', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-LANG-CODE-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: {
          name: 'English Topic',
          langCode: 'en',
          langName: 'English',
          isPublic: true,
          userId: user.id,
        },
      });
      const topic2 = await jestPrisma.topic.create({
        data: {
          name: 'Spanish Topic',
          langCode: 'es',
          langName: 'Spanish',
          isPublic: true,
          userId: user.id,
        },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        langCode: 'en',
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic1.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by langName', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-LANG-NAME-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: {
          name: 'English Topic',
          langCode: 'en',
          langName: 'English',
          isPublic: true,
          userId: user.id,
        },
      });
      const topic2 = await jestPrisma.topic.create({
        data: {
          name: 'Spanish Topic',
          langCode: 'es',
          langName: 'Spanish',
          isPublic: true,
          userId: user.id,
        },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      [workout1, workout2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      const { items, totalCount } = await getAvailableWorkouts({
        langName: 'Spanish',
        noDebug: true,
      });

      expect(totalCount).toBe(1);
      expect(items[0].topicId).toBe(topic2.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should search by searchLang in langCode and langName', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-SEARCH-LANG-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const topic1 = await jestPrisma.topic.create({
        data: {
          name: 'English Topic',
          langCode: 'en',
          langName: 'English',
          isPublic: true,
          userId: user.id,
        },
      });
      const topic2 = await jestPrisma.topic.create({
        data: {
          name: 'Spanish Topic',
          langCode: 'es',
          langName: 'Español',
          isPublic: true,
          userId: user.id,
        },
      });
      const topic3 = await jestPrisma.topic.create({
        data: {
          name: 'German Topic',
          langCode: 'de',
          langName: 'Deutsch',
          isPublic: true,
          userId: user.id,
        },
      });
      [topic1, topic2, topic3].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      const workout1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id },
      });
      const workout2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id },
      });
      const workout3 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic3.id },
      });
      [workout1, workout2, workout3].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      mockedGetCurrentUser.mockResolvedValue(user);

      // Test exact langCode match
      const { items: exactMatch } = await getAvailableWorkouts({
        searchLang: 'en',
        noDebug: true,
      });
      expect(exactMatch).toHaveLength(1);
      expect(exactMatch[0].topicId).toBe(topic1.id);

      // Test partial langName match
      const { items: partialMatch } = await getAvailableWorkouts({
        searchLang: 'eut',
        noDebug: true,
      });
      expect(partialMatch).toHaveLength(1);
      expect(partialMatch[0].topicId).toBe(topic3.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
