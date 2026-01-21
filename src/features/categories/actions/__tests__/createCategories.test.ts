import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { defaultCategoryStatus, TCreateCategoriesParams } from '../../types/Categories';
import { createCategories } from '../createCategories';

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

type CreatedId =
  | { type: 'user'; id: string }
  | { type: 'category'; id: string }
  | { type: 'categoryTranslation'; categoryId: string; locale: string };

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
    }
  }
};

describe('createCategories', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should create multiple categories with translations', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ccs-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoriesData: TCreateCategoriesParams = {
        categories: [
          {
            status: defaultCategoryStatus,
            imageUrl: `https://example.com/cat1-${dateTag}.jpg`,
            translations: [
              {
                locale: 'en',
                name: `Category 1 ${dateTag}`,
                description: `Description 1 ${dateTag}`,
                keywords: `cat1,test,${dateTag}`,
              },
            ],
          },
          {
            status: 'HIDDEN' as const,
            translations: [
              {
                locale: 'en',
                name: `Category 2 ${dateTag}`,
                description: `Description 2 ${dateTag}`,
                keywords: `cat2,test,${dateTag}`,
              },
              {
                locale: 'es',
                name: `Categoría 2 ${dateTag}`,
                description: `Descripción 2 ${dateTag}`,
                keywords: null,
              },
            ],
          },
          {
            status: 'SUGGESTED' as const,
            imageUrl: null,
            translations: [
              {
                locale: 'en',
                name: `Category 3 ${dateTag}`,
                description: null,
                keywords: null,
              },
            ],
          },
        ],
      };

      const results = await createCategories({ ...categoriesData, noDebug: true });

      results.forEach((result) => {
        createdIds.push({ type: 'category', id: result.id });
        result.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: result.id,
            locale: translation.locale,
          });
        });
      });

      expect(results).toHaveLength(3);

      // Verify each category
      expect(results[0].status).toBe(defaultCategoryStatus);
      expect(results[0].createdBy).toBe(user.id);
      expect(results[0].translations).toHaveLength(1);

      expect(results[1].status).toBe('HIDDEN');
      expect(results[1].translations).toHaveLength(2);

      expect(results[2].status).toBe('SUGGESTED');
      expect(results[2].imageUrl).toBeNull();
      expect(results[2].translations[0].description).toBeNull();

      // Verify all are persisted
      const dbCategories = await jestPrisma.category.findMany({
        where: { id: { in: results.map((r) => r.id) } },
        include: { translations: true },
      });
      expect(dbCategories).toHaveLength(3);
      expect(dbCategories.flatMap((c) => c.translations)).toHaveLength(4);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      const categoriesData: TCreateCategoriesParams = {
        categories: [
          {
            translations: [
              {
                locale: 'en',
                name: `Unauthenticated Batch Category ${dateTag}`,
                description: null,
                keywords: null,
              },
            ],
          },
        ],
      };

      await expect(createCategories({ ...categoriesData, noDebug: true })).rejects.toThrow(
        'User must be authenticated to create categories',
      );

      // Verify no categories were created
      const categories = await jestPrisma.category.findMany({
        where: {
          translations: {
            some: { name: `Unauthenticated Batch Category ${dateTag}` },
          },
        },
      });
      expect(categories).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle single category creation', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ccs-single-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoriesData: TCreateCategoriesParams = {
        categories: [
          {
            translations: [
              {
                locale: 'en',
                name: `Single Category ${dateTag}`,
                description: `Single category test ${dateTag}`,
                keywords: null,
              },
            ],
          },
        ],
      };

      const results = await createCategories({ ...categoriesData, noDebug: true });

      results.forEach((result) => {
        createdIds.push({ type: 'category', id: result.id });
        result.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: result.id,
            locale: translation.locale,
          });
        });
      });

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe(defaultCategoryStatus);
      expect(results[0].createdBy).toBe(user.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create categories with mixed translation configurations', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ccs-mixed-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoriesData: TCreateCategoriesParams = {
        categories: [
          {
            translations: [
              {
                locale: 'en',
                name: `Multi-lang Category ${dateTag}`,
                description: `English only ${dateTag}`,
                keywords: null,
              },
            ],
          },
          {
            translations: [
              {
                locale: 'en',
                name: `EN Category ${dateTag}`,
                description: null,
                keywords: null,
              },
              {
                locale: 'es',
                name: `ES Category ${dateTag}`,
                description: null,
                keywords: `español,${dateTag}`,
              },
              {
                locale: 'ru',
                name: `RU Category ${dateTag}`,
                description: `Русское описание ${dateTag}`,
                keywords: null,
              },
            ],
          },
        ],
      };

      const results = await createCategories({ ...categoriesData, noDebug: true });

      results.forEach((result) => {
        createdIds.push({ type: 'category', id: result.id });
        result.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: result.id,
            locale: translation.locale,
          });
        });
      });

      expect(results).toHaveLength(2);
      expect(results[0].translations).toHaveLength(1);
      expect(results[1].translations).toHaveLength(3);

      const ruTranslation = results[1].translations.find((t) => t.locale === 'ru');
      expect(ruTranslation?.description).toContain('Русское описание');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle categories without optional imageUrl', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ccs-noimage-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoriesData: TCreateCategoriesParams = {
        categories: [
          {
            translations: [
              {
                locale: 'en',
                name: `No Image Category ${dateTag}`,
                description: null,
                keywords: null,
              },
            ],
          },
          {
            imageUrl: null,
            translations: [
              {
                locale: 'en',
                name: `Explicit Null Image Category ${dateTag}`,
                description: null,
                keywords: null,
              },
            ],
          },
        ],
      };

      const results = await createCategories({ ...categoriesData, noDebug: true });

      results.forEach((result) => {
        createdIds.push({ type: 'category', id: result.id });
        result.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: result.id,
            locale: translation.locale,
          });
        });
      });

      expect(results).toHaveLength(2);
      expect(results[0].imageUrl).toBeNull(); // Prisma may return null instead of undefined
      expect(results[1].imageUrl).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
