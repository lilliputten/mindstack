import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';

import { getRecentCategories } from '../getRecentCategories';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'category'; id: string }
  | { type: 'categoryTranslation'; categoryId: string; locale: string }
  | { type: 'topic'; id: string; categoryId: string }
  | { type: 'question'; id: string; topicId: string }
  | { type: 'answer'; id: string; questionId: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'answer') {
      await jestPrisma.answer.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'question') {
      await jestPrisma.question.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'categoryTranslation') {
      await jestPrisma.categoryTranslation.deleteMany({
        where: { categoryId: created.categoryId, locale: created.locale },
      });
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

describe('getRecentCategories', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return most popular categories ordered by topics count and creation date', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-popular-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create categories with different number of topics
      const popularCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          translations: {
            create: {
              name: `${testPrefix} Popular Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [
              { name: `${testPrefix} Topic 1`, userId: user.id },
              { name: `${testPrefix} Topic 2`, userId: user.id },
              { name: `${testPrefix} Topic 3`, userId: user.id },
            ],
          },
        },
      });
      createdIds.push({ type: 'category', id: popularCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: popularCategory.id,
        locale: 'en',
      });

      // Find and track all topics created with this category
      const popularCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: popularCategory.id } } },
      });
      popularCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: popularCategory.id });
      });

      const lessPopularCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 3000),
          translations: {
            create: {
              name: `${testPrefix} Less Popular Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic A`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: lessPopularCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: lessPopularCategory.id,
        locale: 'en',
      });

      // Find and track all topics created with this category
      const lessPopularCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: lessPopularCategory.id } } },
      });
      lessPopularCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: lessPopularCategory.id });
      });

      // Test with default take (5)
      const result = await getRecentCategories();

      // Filter results to only include our test data
      const filteredResults = result.filter((c) =>
        c.translations?.some((t) => t.name.includes(testPrefix)),
      );

      expect(filteredResults).toHaveLength(2);
      // Most popular category should come first
      expect(filteredResults[0].id).toBe(popularCategory.id);
      expect(filteredResults[0]._count?.topics).toBe(3);
      // Less popular category should come second
      expect(filteredResults[1].id).toBe(lessPopularCategory.id);
      expect(filteredResults[1]._count?.topics).toBe(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should respect the take parameter', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-take-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple categories
      const createdCategories = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          jestPrisma.category.create({
            data: {
              status: 'PUBLIC',
              createdBy: user.id,
              createdAt: new Date(now - i * 1000),
              translations: {
                create: {
                  name: `${testPrefix} Category ${i + 1}`,
                  locale: 'en',
                },
              },
              topics: {
                create: [{ name: `${testPrefix} Topic ${i + 1}`, userId: user.id }],
              },
            },
          }),
        ),
      );

      // Track all categories and their associated topics
      for (const category of createdCategories) {
        createdIds.push({ type: 'category', id: category.id });
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: category.id,
          locale: 'en',
        });

        // Find and track all topics created with this category
        const categoryTopics = await jestPrisma.topic.findMany({
          where: { categories: { some: { id: category.id } } },
        });
        categoryTopics.forEach((topic) => {
          createdIds.push({ type: 'topic', id: topic.id, categoryId: category.id });
        });
      }

      // Get only 2 categories
      const result = await getRecentCategories(2);

      expect(result).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should only return public categories', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-public-${dateTag}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create public category
      const publicCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          translations: {
            create: {
              name: `${testPrefix} Public Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: publicCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: publicCategory.id, locale: 'en' });

      // Find and track all topics created with this category (though none should exist in this test)
      const publicCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: publicCategory.id } } },
      });
      publicCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: publicCategory.id });
      });

      // Create hidden category
      const hiddenCategory = await jestPrisma.category.create({
        data: {
          status: 'HIDDEN',
          createdBy: user.id,
          translations: {
            create: {
              name: `${testPrefix} Hidden Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: hiddenCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: hiddenCategory.id, locale: 'en' });

      // Find and track all topics created with this category (though none should exist in this test)
      const hiddenCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: hiddenCategory.id } } },
      });
      hiddenCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: hiddenCategory.id });
      });

      const result = await getRecentCategories();

      // Filter results to only include our test data
      const filteredResults = result.filter((c) =>
        c.translations?.some((t) => t.name.includes(testPrefix)),
      );

      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].id).toBe(publicCategory.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
