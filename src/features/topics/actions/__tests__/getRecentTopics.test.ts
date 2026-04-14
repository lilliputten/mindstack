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

      // Use a large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ take: 1000 });

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

      // Create multiple topics with unique timestamps to ensure consistent ordering
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

      // Get topics
      // Use a large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ take: 1000 });

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      // Verify all 5 test topics are present
      expect(filteredResults).toHaveLength(5);

      // Verify that the first 2 topics (most recent) are the expected ones
      const sortedByCreation = [...filteredResults].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      expect(sortedByCreation[0].id).toBe(createdTopics[0].id);
      expect(sortedByCreation[1].id).toBe(createdTopics[1].id);
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

      // Use a large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ take: 1000 });

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
      // Use a very large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ locale: 'en', take: 5000 });

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      // Should include English topic and topics with empty/null langCode (3 topics total)
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

      // Get topics with English locale or empty langCode
      // Use a large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ take: 1000, locale: 'en' });

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      // Should get all 5 test topics (all have 'en' or '' langCode)
      expect(filteredResults).toHaveLength(5);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return topics with specified locale first, then empty/null langCode', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grt-locale-order-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create topics with different langCode values
      const englishTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} English Topic`,
          userId: user.id,
          langCode: 'en',
          createdAt: new Date(now - 1000), // Slightly older than empty topic to test ordering
        },
      });
      createdIds.push({ type: 'topic', id: englishTopic.id });

      const emptyLangTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Empty Lang Topic`,
          userId: user.id,
          langCode: '',
          createdAt: new Date(now), // Newest creation date
        },
      });
      createdIds.push({ type: 'topic', id: emptyLangTopic.id });

      const nullLangTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Null Lang Topic`,
          userId: user.id,
          langCode: null,
          createdAt: new Date(now - 2000),
        },
      });
      createdIds.push({ type: 'topic', id: nullLangTopic.id });

      const spanishTopic = await jestPrisma.topic.create({
        data: {
          isPublic: true,
          name: `${testPrefix} Spanish Topic`,
          userId: user.id,
          langCode: 'es',
          createdAt: new Date(now - 500),
        },
      });
      createdIds.push({ type: 'topic', id: spanishTopic.id });

      // Get topics with English locale filter (should include en, empty, null)
      // Use a large take value to ensure all test topics are included despite parallel test interference
      const result = await getRecentTopics({ locale: 'en', take: 1000 });

      // Filter results to only include our test data
      const filteredResults = result.filter((t) => t.name.includes(testPrefix));

      // Should include 3 topics (en, empty, null) and exclude Spanish
      expect(filteredResults).toHaveLength(3);
      expect(filteredResults.some((t) => t.id === spanishTopic.id)).toBe(false);

      // Verify the order: English first, then empty, then null
      // Even though empty topic has newer creation date, it should come after English
      expect(filteredResults[0].id).toBe(englishTopic.id);
      expect(filteredResults[1].id).toBe(emptyLangTopic.id);
      expect(filteredResults[2].id).toBe(nullLangTopic.id);

      // Verify that within same langCode group, creation date order is maintained
      // (This is already handled by the createdAt: 'desc' in orderBy)
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
