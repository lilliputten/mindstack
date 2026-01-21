import { afterEach, describe, expect, it, jest } from '@jest/globals';

// Types are now declared in src/@types/global.d.ts

import { jestPrisma } from '@/lib/db/jestPrisma';
import { getCurrentUser } from '@/lib/session';
import { TNewTopic } from '@/features/topics/types';

import { addNewTopic } from '../addNewTopic';

jest.mock('@/lib/session');

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'category'; id: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'category') {
      await jestPrisma.category.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('addNewTopic', () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: null,
      image: null,
      role: 'USER',
      grade: 'PREMIUM',
      subscriptionPeriod: null,
      subscriptionStartedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should create a topic with basic information', async () => {
    const timestamp = Date.now().toString();
    const testId = `ant-${timestamp}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue({
        ...user,
        role: 'ADMIN',
        grade: 'PREMIUM',
        emailVerified: null,
        image: null,
        subscriptionPeriod: null,
        subscriptionStartedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newTopic: TNewTopic = {
        name: `Test Topic ${testId}`,
        description: 'Test Description',
      };

      const result = await addNewTopic(newTopic);

      expect(result).toMatchObject({
        name: `Test Topic ${testId}`,
        description: 'Test Description',
      });

      createdIds.push({ type: 'topic', id: result.id });

      // Verify the topic exists in the database
      const dbTopic = await jestPrisma.topic.findUnique({
        where: { id: result.id },
      });
      expect(dbTopic).not.toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a topic with linked categories', async () => {
    const timestamp = Date.now().toString();
    const testId = `antc-${timestamp}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create test categories first (with translations for the name)
      const category1 = await jestPrisma.category.create({
        data: {
          translations: {
            create: {
              locale: 'en',
              name: 'Category 1',
            },
          },
        },
      });
      const category2 = await jestPrisma.category.create({
        data: {
          translations: {
            create: {
              locale: 'en',
              name: 'Category 2',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: category1.id });
      createdIds.push({ type: 'category', id: category2.id });

      mockedGetCurrentUser.mockResolvedValue({
        ...user,
        role: 'ADMIN',
        grade: 'PREMIUM',
        emailVerified: null,
        image: null,
        subscriptionPeriod: null,
        subscriptionStartedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newTopic: TNewTopic = {
        name: `Test Topic with Categories ${testId}`,
        categoryIds: [category1.id, category2.id],
      };

      const result = await addNewTopic(newTopic);

      // Verify the topic was created
      expect(result).toMatchObject({
        name: `Test Topic with Categories ${testId}`,
      });

      createdIds.push({ type: 'topic', id: result.id });

      // Verify the category links were created
      const updatedTopic = await jestPrisma.topic.findUnique({
        where: { id: result.id },
        include: { categories: true },
      });
      expect(updatedTopic?.categories).toHaveLength(2);
      expect(updatedTopic?.categories.map((cat) => cat.id)).toEqual(
        expect.arrayContaining([category1.id, category2.id]),
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a topic without categories when categoryIds is empty', async () => {
    const timestamp = Date.now().toString();
    const testId = `antce-${timestamp}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue({
        ...user,
        role: 'ADMIN',
        grade: 'PREMIUM',
        emailVerified: null,
        image: null,
        subscriptionPeriod: null,
        subscriptionStartedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newTopic: TNewTopic = {
        name: `Test Topic without Categories ${testId}`,
        categoryIds: [],
      };

      const result = await addNewTopic(newTopic);

      expect(result).toMatchObject({
        name: `Test Topic without Categories ${testId}`,
      });

      createdIds.push({ type: 'topic', id: result.id });

      // Verify no category links were created
      const updatedTopic = await jestPrisma.topic.findUnique({
        where: { id: result.id },
        include: { categories: true },
      });
      expect(updatedTopic?.categories).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a topic without categories when categoryIds is undefined', async () => {
    const timestamp = Date.now().toString();
    const testId = `antu-${timestamp}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue({
        ...user,
        role: 'ADMIN',
        grade: 'PREMIUM',
        emailVerified: null,
        image: null,
        subscriptionPeriod: null,
        subscriptionStartedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newTopic: TNewTopic = {
        name: `Test Topic without CategoryIds ${testId}`,
      };

      const result = await addNewTopic(newTopic);

      expect(result).toMatchObject({
        name: `Test Topic without CategoryIds ${testId}`,
      });

      createdIds.push({ type: 'topic', id: result.id });

      // Verify no category links were created
      const updatedTopic = await jestPrisma.topic.findUnique({
        where: { id: result.id },
        include: { categories: true },
      });
      expect(updatedTopic?.categories).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    const newTopic: TNewTopic = {
      name: 'Test Topic',
    };

    await expect(addNewTopic({ ...newTopic, noDebug: true })).rejects.toThrow(
      'User not authenticated',
    );
  });
});
