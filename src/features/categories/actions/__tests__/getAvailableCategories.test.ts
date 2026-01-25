import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { getAvailableCategories } from '../getAvailableCategories';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'category'; id: string }
  | { type: 'categoryTranslation'; categoryId: string; locale: string }
  | { type: 'topic'; id: string; categoryId: string };

const cleanupDb = async (ids: CreatedId[]) => {
  for (const created of ids.reverse()) {
    if (created.type === 'categoryTranslation') {
      await jestPrisma.categoryTranslation.deleteMany({
        where: { categoryId: created.categoryId, locale: created.locale },
      });
    } else if (created.type === 'category') {
      await jestPrisma.category.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'user') {
      await jestPrisma.user.deleteMany({ where: { id: created.id } });
    } else if (created.type === 'topic') {
      await jestPrisma.topic.deleteMany({ where: { id: created.id } });
    }
  }
};

describe('getAvailableCategories', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });
  it('should return categories ordered by most recent update', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-recent-update-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create test data with unique prefix in translations to isolate from existing data
      const newerCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          updatedAt: new Date(now - 1000), // Updated more recently
          translations: {
            create: {
              name: `${testPrefix} Newer Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: newerCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: newerCategory.id, locale: 'en' });

      const olderCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 10000),
          updatedAt: new Date(now - 6000), // Updated earlier
          translations: {
            create: {
              name: `${testPrefix} Older Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: olderCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: olderCategory.id, locale: 'en' });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await getAvailableCategories({
        orderBy: { updatedAt: 'desc' },
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe(newerCategory.id);
      expect(result.items[1].id).toBe(olderCategory.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return categories ordered by creation date (newest first)', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-creation-date-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const newerCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 3000),
          updatedAt: new Date(now - 1000),
          translations: {
            create: {
              name: `${testPrefix} Newer Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: newerCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: newerCategory.id, locale: 'en' });

      const olderCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 8000),
          updatedAt: new Date(now - 6000),
          translations: {
            create: {
              name: `${testPrefix} Older Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: olderCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: olderCategory.id, locale: 'en' });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await getAvailableCategories({
        orderBy: { createdAt: 'desc' },
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe(newerCategory.id);
      expect(result.items[1].id).toBe(olderCategory.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should include topics count for each category', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-topics-count-${dateTag}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categoryWithManyTopics = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          translations: {
            create: {
              name: `${testPrefix} Many Topics Category`,
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
      createdIds.push({ type: 'category', id: categoryWithManyTopics.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithManyTopics.id,
        locale: 'en',
      });

      const topics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: categoryWithManyTopics.id } } },
      });
      topics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: categoryWithManyTopics.id });
      });

      const categoryWithFewTopics = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          translations: {
            create: {
              name: `${testPrefix} Few Topics Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic A`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithFewTopics.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithFewTopics.id,
        locale: 'en',
      });

      const singleTopic = await jestPrisma.topic.findFirst({
        where: { categories: { some: { id: categoryWithFewTopics.id } } },
      });
      if (singleTopic) {
        createdIds.push({
          type: 'topic',
          id: singleTopic.id,
          categoryId: categoryWithFewTopics.id,
        });
      }

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await getAvailableCategories({
        hasTopics: true,
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(2);

      const manyTopicsCategory = result.items.find((c) => c.id === categoryWithManyTopics.id);
      const fewTopicsCategory = result.items.find((c) => c.id === categoryWithFewTopics.id);

      expect(manyTopicsCategory).toBeDefined();
      expect(manyTopicsCategory?._count?.topics).toBe(3);
      expect(fewTopicsCategory).toBeDefined();
      expect(fewTopicsCategory?._count?.topics).toBe(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter categories by minimum update date', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-min-update-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const recentCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          updatedAt: new Date(now - 24 * 60 * 60 * 1000),
          translations: {
            create: {
              name: `${testPrefix} Recent Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: recentCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: recentCategory.id, locale: 'en' });

      const oldCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
          translations: {
            create: {
              name: `${testPrefix} Old Category`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: oldCategory.id });
      createdIds.push({ type: 'categoryTranslation', categoryId: oldCategory.id, locale: 'en' });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Filter for categories updated in the last 3 days
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
      const result = await getAvailableCategories({
        minUpdatedAt: threeDaysAgo,
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(recentCategory.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return empty result for unauthorized user with non-public categories', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-unauth-${dateTag}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const privateCategory = await jestPrisma.category.create({
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
      createdIds.push({ type: 'category', id: privateCategory.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: privateCategory.id,
        locale: 'en',
      });

      mockedGetCurrentUser.mockResolvedValue(undefined);

      const result = await getAvailableCategories({
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle pagination correctly', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-pagination-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple categories with unique names for isolation
      const categories = await Promise.all(
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
            },
          }),
        ),
      );

      categories.forEach((category) => {
        createdIds.push({ type: 'category', id: category.id });
        createdIds.push({ type: 'categoryTranslation', categoryId: category.id, locale: 'en' });
      });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const firstPage = await getAvailableCategories({
        skip: 0,
        take: 2,
        orderBy: { createdAt: 'desc' },
        searchText: testPrefix,
      });

      const secondPage = await getAvailableCategories({
        skip: 2,
        take: 2,
        orderBy: { createdAt: 'desc' },
        searchText: testPrefix,
      });

      expect(firstPage.items).toHaveLength(2);
      expect(secondPage.items).toHaveLength(2);
      expect(firstPage.totalCount).toBe(5);
      expect(secondPage.totalCount).toBe(5);

      const firstPageIds = firstPage.items.map((c) => c.id);
      const secondPageIds = secondPage.items.map((c) => c.id);
      expect(firstPageIds).not.toEqual(secondPageIds);
    } finally {
      await cleanupDb(createdIds);
    }
  });
  it('should return categories ordered by popularity (topics count) with fallback to creation date', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-popularity-${dateTag}`;
    const createdIds: CreatedId[] = [];
    const now = Date.now();

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create categories with different number of topics
      const categoryWithFewTopics = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 10000),
          translations: {
            create: {
              name: `${testPrefix} Few Topics Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [{ name: `${testPrefix} Topic A`, userId: user.id }],
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithFewTopics.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithFewTopics.id,
        locale: 'en',
      });

      const fewTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: categoryWithFewTopics.id } } },
      });
      fewTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: categoryWithFewTopics.id });
      });

      const categoryWithMostTopics = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 5000),
          translations: {
            create: {
              name: `${testPrefix} Most Topics Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [
              { name: `${testPrefix} Topic 1`, userId: user.id },
              { name: `${testPrefix} Topic 2`, userId: user.id },
              { name: `${testPrefix} Topic 3`, userId: user.id },
              { name: `${testPrefix} Topic 4`, userId: user.id },
            ],
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithMostTopics.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithMostTopics.id,
        locale: 'en',
      });

      const mostTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: categoryWithMostTopics.id } } },
      });
      mostTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: categoryWithMostTopics.id });
      });

      const categoryWithMediumTopics = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          createdAt: new Date(now - 8000),
          translations: {
            create: {
              name: `${testPrefix} Medium Topics Category`,
              locale: 'en',
            },
          },
          topics: {
            create: [
              { name: `${testPrefix} Topic X`, userId: user.id },
              { name: `${testPrefix} Topic Y`, userId: user.id },
            ],
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithMediumTopics.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithMediumTopics.id,
        locale: 'en',
      });

      const mediumTopics = await jestPrisma.topic.findMany({
        where: { categories: { some: { id: categoryWithMediumTopics.id } } },
      });
      mediumTopics.forEach((topic) => {
        createdIds.push({ type: 'topic', id: topic.id, categoryId: categoryWithMediumTopics.id });
      });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Order by topics count descending, then by creation date descending as fallback
      const result = await getAvailableCategories({
        orderBy: [{ topics: { _count: 'desc' } }, { createdAt: 'desc' }],
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(3);
      // Most topics should be first
      expect(result.items[0].id).toBe(categoryWithMostTopics.id);
      expect(result.items[0]._count?.topics).toBe(4);
      // Medium topics should be second
      expect(result.items[1].id).toBe(categoryWithMediumTopics.id);
      expect(result.items[1]._count?.topics).toBe(2);
      // Few topics should be third
      expect(result.items[2].id).toBe(categoryWithFewTopics.id);
      expect(result.items[2]._count?.topics).toBe(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return only categories with images when hasImage is true', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-has-image-${dateTag}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categoryWithImage = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          imageUrl: 'https://example.com/image1.jpg',
          translations: {
            create: {
              name: `${testPrefix} Category With Image`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithImage.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithImage.id,
        locale: 'en',
      });

      const categoryWithoutImage = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          imageUrl: null,
          translations: {
            create: {
              name: `${testPrefix} Category Without Image`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithoutImage.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithoutImage.id,
        locale: 'en',
      });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Filter for categories with images only
      const result = await getAvailableCategories({
        hasImage: true,
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(categoryWithImage.id);
      expect(result.items[0].imageUrl).toBe('https://example.com/image1.jpg');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return only categories without images when hasImage is false', async () => {
    const dateTag = formatDateTag();
    const testPrefix = `gac-no-image-${dateTag}`;
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `${testPrefix}-user@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categoryWithImage = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          imageUrl: 'https://example.com/image1.jpg',
          translations: {
            create: {
              name: `${testPrefix} Category With Image`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithImage.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithImage.id,
        locale: 'en',
      });

      const categoryWithoutImage = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
          imageUrl: null,
          translations: {
            create: {
              name: `${testPrefix} Category Without Image`,
              locale: 'en',
            },
          },
        },
      });
      createdIds.push({ type: 'category', id: categoryWithoutImage.id });
      createdIds.push({
        type: 'categoryTranslation',
        categoryId: categoryWithoutImage.id,
        locale: 'en',
      });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Filter for categories without images
      const result = await getAvailableCategories({
        hasImage: false,
        searchText: testPrefix,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(categoryWithoutImage.id);
      expect(result.items[0].imageUrl).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
