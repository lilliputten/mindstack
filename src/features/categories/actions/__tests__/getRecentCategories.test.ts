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
      const result = await getRecentCategories({});

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

      // Get only 2 categories without locale filter
      const result = await getRecentCategories({ take: 2 });

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

      const result = await getRecentCategories({});

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

describe('getRecentCategories with locale', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return only categories with translations for specified locale', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-locale-en-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create category with English translation only
      const englishCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          translations: {
            create: {
              name: `${testPrefix} English Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic 1`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: englishCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: englishCategory.id,
        locale: 'en',
      });

      // Find and track all topics created with this category
      const englishCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: englishCategory.id } } },
      });
      englishCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: englishCategory.id });
      });

      // Create category with Spanish translation only
      const spanishCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 3000),
          translations: {
            create: {
              name: `${testPrefix} Spanish Category`,
              locale: 'es',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic A`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: spanishCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: spanishCategory.id,
        locale: 'es',
      });

      // Find and track all topics created with this category
      const spanishCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: spanishCategory.id } } },
      });
      spanishCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: spanishCategory.id });
      });

      // Test with English locale filter
      const resultEn = await getRecentCategories({ locale: 'en' });

      // Filter results to only include our test data
      const filteredResultsEn = resultEn.filter((c) =>
        c.translations?.some((t) => t.name.includes(testPrefix)),
      );

      expect(filteredResultsEn).toHaveLength(1);
      expect(filteredResultsEn[0].id).toBe(englishCategory.id);
      expect(filteredResultsEn[0].translations?.some((t) => t.locale === 'en')).toBe(true);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return categories with multi-language translations when locale matches', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-locale-multi-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create category with translations in multiple languages
      const multiLangCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          translations: {
            create: [
              {
                name: `${testPrefix} Multi Category EN`,
                locale: 'en',
              },
              {
                name: `${testPrefix} Multi Category ES`,
                locale: 'es',
              },
              {
                name: `${testPrefix} Multi Category RU`,
                locale: 'ru',
              },
            ],
          },
          topics: {
            create: [
              { name: `${testPrefix} Topic 1`, userId: user.id },
              { name: `${testPrefix} Topic 2`, userId: user.id },
            ],
          },
        },
      });
      createdIds.push({ type: 'category', id: multiLangCategory.id });
      ['en', 'es', 'ru'].forEach((locale) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: multiLangCategory.id,
          locale,
        });
      });

      // Find and track all topics created with this category
      const multiLangCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: multiLangCategory.id } } },
      });
      multiLangCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: multiLangCategory.id });
      });

      // Create category with only Spanish translation
      const spanishOnlyCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 3000),
          translations: {
            create: {
              name: `${testPrefix} Spanish Only Category`,
              locale: 'es',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic A`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: spanishOnlyCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: spanishOnlyCategory.id,
        locale: 'es',
      });

      // Find and track all topics created with this category
      const spanishOnlyCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: spanishOnlyCategory.id } } },
      });
      spanishOnlyCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: spanishOnlyCategory.id });
      });

      // Test with Spanish locale filter - should return both categories
      const resultEs = await getRecentCategories({ locale: 'es' });

      // Filter results to only include our test data
      const filteredResultsEs = resultEs.filter((c) =>
        c.translations?.some((t) => t.name.includes(testPrefix)),
      );

      expect(filteredResultsEs).toHaveLength(2);
      const multiLangFound = filteredResultsEs.find((c) => c.id === multiLangCategory.id);
      const spanishOnlyFound = filteredResultsEs.find((c) => c.id === spanishOnlyCategory.id);
      expect(multiLangFound).toBeDefined();
      expect(spanishOnlyFound).toBeDefined();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return empty array when no categories have the specified locale translation', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-locale-empty-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create category with only English translation
      const englishCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          translations: {
            create: {
              name: `${testPrefix} English Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic 1`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: englishCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: englishCategory.id,
        locale: 'en',
      });

      // Find and track all topics created with this category
      const englishCategoryTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: englishCategory.id } } },
      });
      englishCategoryTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: englishCategory.id });
      });

      // Test with Russian locale filter - should return empty
      const resultRu = await getRecentCategories({ locale: 'ru' });

      // Filter results to only include our test data
      const filteredResultsRu = resultRu.filter((c) =>
        c.translations?.some((t) => t.name.includes(testPrefix)),
      );

      expect(filteredResultsRu).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should combine take and locale parameters correctly', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `grc-take-locale-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple categories with English translations
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

      // Get only 2 categories with English locale
      const result = await getRecentCategories({ take: 2, locale: 'en' });

      expect(result).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
