import { afterEach, describe, expect, it } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';

import { getRecentTopics } from '../getRecentTopics';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'category'; id: string }
  | { type: 'question'; id: string; topicId: string }
  | { type: 'answer'; id: string; questionId: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'answer') {
      await jestPrisma.answer.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'category') {
      await jestPrisma.category.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      // Clean up questions and answers associated with the topic first
      const questions = await jestPrisma.question.findMany({
        where: { topicId: created.id },
      });

      for (const question of questions) {
        await jestPrisma.answer.deleteMany({
          where: { questionId: question.id },
        });
      }

      await jestPrisma.question.deleteMany({
        where: { topicId: created.id },
      });

      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getRecentTopics', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return public topics ordered by creation date', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-public-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create topics with different creation dates
      const newerTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Newer Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 3000),
        },
      });
      createdIds.push({ type: 'topic', id: newerTopic.id });

      const oldestTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Oldest Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 5000),
        },
      });
      createdIds.push({ type: 'topic', id: oldestTopic.id });

      // Test with default take (5)
      const result = await getRecentTopics({});

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      expect(filteredResults).toHaveLength(2);
      // Newer topic should come first (more recent)
      expect(filteredResults[0].id).toBe(newerTopic.id);
      expect(filteredResults[1].id).toBe(oldestTopic.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should respect the take parameter', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-take-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple topics
      const createdTopics = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          jestPrisma.topic.create({
            data: {
              isPublic: true,
              name: `${testPrefix} Topic ${i + 1}`,
              userId: user.id,
              langCode: 'en',
              createdAt: new Date(now - i * 1000),
            },
          }),
        ),
      );

      // Track all topics created
      createdTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id });
      });

      // Get only 2 most recent topics
      const result = await getRecentTopics({ take: 2 });

      expect(result).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not return private topics', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-private-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create public topic
      const publicTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Public Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 5000),
        },
      });
      createdIds.push({ type: 'topic', id: publicTopic.id });

      // Create private topic
      const privateTopic = await jestPrisma.topic.create({
        data: {
          isPublic: false,
          name: `${testPrefix} Private Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 3000),
        },
      });
      createdIds.push({ type: 'topic', id: privateTopic.id });

      const result = await getRecentTopics({});

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].id).toBe(publicTopic.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});

describe('getRecentTopics with locale', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return only topics with specified locale or empty langCode', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-locale-en-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create topics with different langCodes
      const englishTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} English Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 5000),
        },
      });
      createdIds.push({ type: 'topic', id: englishTopic.id });

      const spanishTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Spanish Topic`,
          userId: user.id,
          langCode: 'es',
          createdAt: new Date(now - 3000),
        },
      });
      createdIds.push({ type: 'topic', id: spanishTopic.id });

      const noLangTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} No Lang Topic`,
          userId: user.id,
          langCode: '',
          createdAt: new Date(now - 2000),
        },
      });
      createdIds.push({ type: 'topic', id: noLangTopic.id });

      const nullLangTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Null Lang Topic`,
          userId: user.id,
          langCode: null,
          createdAt: new Date(now - 1000),
        },
      });
      createdIds.push({ type: 'topic', id: nullLangTopic.id });

      // Test with English locale filter
      // Use a higher take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ locale: 'en', take: 10 });

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      // Should include English topic and topics with empty/null langCode
      expect(filteredResults).toHaveLength(3);
      expect(filteredResults.some((t) => t.id === englishTopic.id)).toBe(true);
      expect(filteredResults.some((t) => t.id === noLangTopic.id)).toBe(true);
      expect(filteredResults.some((t) => t.id === nullLangTopic.id)).toBe(true);
      // Should not include Spanish topic
      expect(filteredResults.some((t) => t.id === spanishTopic.id)).toBe(false);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should combine take and locale parameters correctly', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-take-locale-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple topics with English locale or empty langCode
      const createdTopics = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          jestPrisma.topic.create({
            data: {
              isPublic: true,
              name: `${testPrefix} Topic ${i + 1}`,
              userId: user.id,
              langCode: i % 2 === 0 ? 'en' : '',
              createdAt: new Date(now - i * 1000),
            },
          }),
        ),
      );

      // Track all topics created
      createdTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id });
      });

      // Get only 2 most recent topics with English locale or empty langCode
      const result = await getRecentTopics({ take: 2, locale: 'en' });

      expect(result).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
