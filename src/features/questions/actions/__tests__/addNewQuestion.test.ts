import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Types are now declared in src/@types/global.d.ts

import { jestPrisma } from '@/lib/db/jestPrisma';
import { getCurrentUser } from '@/lib/session';

import { addNewQuestion } from '../addNewQuestion';

jest.mock('@/lib/session');

// Get mocks after they're set up
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('addNewQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: null,
      image: null,
      role: 'ADMIN',
      grade: 'PREMIUM',
      subscriptionPeriod: null,
      subscriptionStartedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
  it('should add question ID to empty questionsOrder', async () => {
    const createdIds: string[] = [];

    try {
      // Create test user
      const user = await jestPrisma.user.create({
        data: {
          email: `test-${Date.now()}-${Math.random()}@example.com`,
          name: 'Test User',
        },
      });
      createdIds.push(`user:${user.id}`);

      // Create test topic
      const topic = await jestPrisma.topic.create({
        data: {
          name: `Test Topic ${Date.now()}`,
          userId: user.id,
        },
      });
      createdIds.push(`topic:${topic.id}`);

      // Create workout with empty questionsOrder
      await jestPrisma.userTopicWorkout.create({
        data: {
          userId: user.id,
          topicId: topic.id,
          questionsOrder: '',
        },
      });
      createdIds.push(`workout:${user.id}:${topic.id}`);

      const newQuestion = await addNewQuestion({
        text: 'Test Question',
        topicId: topic.id,
      });
      createdIds.push(`question:${newQuestion.id}`);

      const workout = await jestPrisma.userTopicWorkout.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      });

      expect(workout?.questionsOrder).toBe(newQuestion.id);
    } finally {
      // Cleanup
      for (const id of createdIds.reverse()) {
        const [type, ...parts] = id.split(':');
        if (type === 'workout') {
          await jestPrisma.userTopicWorkout.deleteMany({
            where: { userId: parts[0], topicId: parts[1] },
          });
        } else if (type === 'question') {
          await jestPrisma.question.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'topic') {
          await jestPrisma.topic.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'user') {
          await jestPrisma.user.deleteMany({ where: { id: parts[0] } });
        }
      }
    }
  });

  it('should append question ID to existing questionsOrder', async () => {
    const createdIds: string[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `test-${Date.now()}-${Math.random()}@example.com`,
          name: 'Test User',
        },
      });
      createdIds.push(`user:${user.id}`);

      const topic = await jestPrisma.topic.create({
        data: {
          name: `Test Topic ${Date.now()}`,
          userId: user.id,
        },
      });
      createdIds.push(`topic:${topic.id}`);

      const existingQuestion = await jestPrisma.question.create({
        data: {
          text: 'Existing Question',
          topicId: topic.id,
        },
      });
      createdIds.push(`question:${existingQuestion.id}`);

      await jestPrisma.userTopicWorkout.create({
        data: {
          userId: user.id,
          topicId: topic.id,
          questionsOrder: existingQuestion.id,
        },
      });
      createdIds.push(`workout:${user.id}:${topic.id}`);

      const newQuestion = await addNewQuestion({
        text: 'New Question',
        topicId: topic.id,
      });
      createdIds.push(`question:${newQuestion.id}`);

      const workout = await jestPrisma.userTopicWorkout.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      });

      expect(workout?.questionsOrder).toBe(`${existingQuestion.id} ${newQuestion.id}`);
    } finally {
      for (const id of createdIds.reverse()) {
        const [type, ...parts] = id.split(':');
        if (type === 'workout') {
          await jestPrisma.userTopicWorkout.deleteMany({
            where: { userId: parts[0], topicId: parts[1] },
          });
        } else if (type === 'question') {
          await jestPrisma.question.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'topic') {
          await jestPrisma.topic.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'user') {
          await jestPrisma.user.deleteMany({ where: { id: parts[0] } });
        }
      }
    }
  });

  it('should update multiple user workouts for the same topic', async () => {
    const createdIds: string[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `test-${Date.now()}-${Math.random()}@example.com`,
          name: 'Test User',
        },
      });
      createdIds.push(`user:${user.id}`);

      const user2 = await jestPrisma.user.create({
        data: {
          email: `test2-${Date.now()}-${Math.random()}@example.com`,
          name: 'Test User 2',
        },
      });
      createdIds.push(`user:${user2.id}`);

      const topic = await jestPrisma.topic.create({
        data: {
          name: `Test Topic ${Date.now()}`,
          userId: user.id,
        },
      });
      createdIds.push(`topic:${topic.id}`);

      await jestPrisma.userTopicWorkout.createMany({
        data: [
          { userId: user.id, topicId: topic.id, questionsOrder: '' },
          { userId: user2.id, topicId: topic.id, questionsOrder: '' },
        ],
      });
      createdIds.push(`workout:${user.id}:${topic.id}`);
      createdIds.push(`workout:${user2.id}:${topic.id}`);

      const newQuestion = await addNewQuestion({
        text: 'Test Question',
        topicId: topic.id,
      });
      createdIds.push(`question:${newQuestion.id}`);

      const workouts = await jestPrisma.userTopicWorkout.findMany({
        where: { topicId: topic.id },
      });

      expect(workouts).toHaveLength(2);
      for (const workout of workouts) {
        expect(workout.questionsOrder).toBe(newQuestion.id);
      }
    } finally {
      for (const id of createdIds.reverse()) {
        const [type, ...parts] = id.split(':');
        if (type === 'workout') {
          await jestPrisma.userTopicWorkout.deleteMany({
            where: { userId: parts[0], topicId: parts[1] },
          });
        } else if (type === 'question') {
          await jestPrisma.question.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'topic') {
          await jestPrisma.topic.deleteMany({ where: { id: parts[0] } });
        } else if (type === 'user') {
          await jestPrisma.user.deleteMany({ where: { id: parts[0] } });
        }
      }
    }
  });
});
