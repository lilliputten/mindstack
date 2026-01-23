// Test to verify that workout filtering works correctly based on user role
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
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'category') {
      await jestPrisma.category.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getAvailableTopics - Workout Filtering by User Role', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it("should only return current user's workouts for non-admin users", async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      // Create two users
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-workout-filter-${dateTag}@test.com`, role: 'USER' },
      });
      const user2 = await jestPrisma.user.create({
        data: { email: `user2-workout-filter-${dateTag}@test.com`, role: 'USER' },
      });
      [user1, user2].forEach(({ id }) => createdIds.push({ type: 'user', id }));

      // Create a shared topic
      const topic = await jestPrisma.topic.create({
        data: { name: 'Shared Topic', isPublic: true, userId: user1.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      // Create workouts for both users on the same topic
      const w1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user1.id, topicId: topic.id, started: true, finished: false },
      });
      const w2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user2.id, topicId: topic.id, started: true, finished: false },
      });
      [w1, w2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      // Mock user1 (non-admin) and request workouts
      mockedGetCurrentUser.mockResolvedValue(user1 as TUser);
      const { items } = await getAvailableTopics({
        topicIds: [topic.id],
        includeWorkout: true,
        noDebug: true,
      });

      expect(items).toHaveLength(1);
      const topicResult = items[0];

      // Verify that only user1's workout is returned
      expect(topicResult.userTopicWorkout).toBeDefined();
      expect(topicResult.userTopicWorkout).not.toBeNull();
      if (topicResult.userTopicWorkout) {
        expect(topicResult.userTopicWorkout.length).toBe(1);
        expect(topicResult.userTopicWorkout[0].userId).toBe(user1.id);
      }
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it("should return all users' workouts for admin users", async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      // Create admin and regular user
      const admin = await jestPrisma.user.create({
        data: { email: `admin-workout-filter-${dateTag}@test.com`, role: 'ADMIN' },
      });
      const user = await jestPrisma.user.create({
        data: { email: `user-workout-filter-${dateTag}@test.com`, role: 'USER' },
      });
      [admin, user].forEach(({ id }) => createdIds.push({ type: 'user', id }));

      // Create a shared topic
      const topic = await jestPrisma.topic.create({
        data: { name: 'Shared Topic', isPublic: true, userId: user.id },
      });
      createdIds.push({ type: 'topic', id: topic.id });

      // Create workouts for both users on the same topic
      const w1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: admin.id, topicId: topic.id, started: true, finished: false },
      });
      const w2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic.id, started: true, finished: false },
      });
      [w1, w2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      // Mock admin user and request workouts
      mockedGetCurrentUser.mockResolvedValue(admin as TUser);
      const { items } = await getAvailableTopics({
        topicIds: [topic.id],
        includeWorkout: true,
        noDebug: true,
      });

      expect(items).toHaveLength(1);
      const topicResult = items[0];

      // Verify that both workouts are returned for admin
      expect(topicResult.userTopicWorkout).toBeDefined();
      expect(topicResult.userTopicWorkout).not.toBeNull();
      if (topicResult.userTopicWorkout) {
        expect(topicResult.userTopicWorkout.length).toBe(2);
        const userIds = topicResult.userTopicWorkout.map((w) => w.userId);
        expect(userIds).toContain(admin.id);
        expect(userIds).toContain(user.id);
      }
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter active workouts by current user for non-admins', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      // Create two users
      const user1 = await jestPrisma.user.create({
        data: { email: `user1-active-filter-${dateTag}@test.com`, role: 'USER' },
      });
      const user2 = await jestPrisma.user.create({
        data: { email: `user2-active-filter-${dateTag}@test.com`, role: 'USER' },
      });
      [user1, user2].forEach(({ id }) => createdIds.push({ type: 'user', id }));

      // Create two shared topics
      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic 1', isPublic: true, userId: user1.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic 2', isPublic: true, userId: user2.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      // Create active workout for user1 on topic1
      const w1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user1.id, topicId: topic1.id, started: true, finished: false },
      });
      // Create inactive workout for user2 on topic2
      const w2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user2.id, topicId: topic2.id, started: false, finished: false },
      });
      [w1, w2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      // Mock user1 and filter by active workouts
      mockedGetCurrentUser.mockResolvedValue(user1 as TUser);
      const { items: activeItems } = await getAvailableTopics({
        topicIds: [topic1.id, topic2.id],
        hasActiveWorkouts: true,
        noDebug: true,
      });

      // user1 should only see topics with their own active workouts
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].id).toBe(topic1.id); // Only topic1 has user1's active workout
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should allow admin to see all active workouts regardless of user', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      // Create admin and regular user
      const admin = await jestPrisma.user.create({
        data: { email: `admin-active-filter-${dateTag}@test.com`, role: 'ADMIN' },
      });
      const user = await jestPrisma.user.create({
        data: { email: `user-active-filter-${dateTag}@test.com`, role: 'USER' },
      });
      [admin, user].forEach(({ id }) => createdIds.push({ type: 'user', id }));

      // Create two shared topics
      const topic1 = await jestPrisma.topic.create({
        data: { name: 'Topic 1', isPublic: true, userId: user.id },
      });
      const topic2 = await jestPrisma.topic.create({
        data: { name: 'Topic 2', isPublic: true, userId: user.id },
      });
      [topic1, topic2].forEach(({ id }) => createdIds.push({ type: 'topic', id }));

      // Create active workout for user on topic1
      const w1 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic1.id, started: true, finished: false },
      });
      // Create inactive workout for user on topic2
      const w2 = await jestPrisma.userTopicWorkout.create({
        data: { userId: user.id, topicId: topic2.id, started: false, finished: false },
      });
      [w1, w2].forEach(({ userId, topicId }) =>
        createdIds.push({ type: 'workout', userId, topicId }),
      );

      // Mock admin and filter by active workouts
      mockedGetCurrentUser.mockResolvedValue(admin as TUser);
      const { items: activeItems } = await getAvailableTopics({
        topicIds: [topic1.id, topic2.id],
        hasActiveWorkouts: true,
        noDebug: true,
      });

      // Admin should see all topics with active workouts regardless of who owns them
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].id).toBe(topic1.id); // Only topic1 has active workouts
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
