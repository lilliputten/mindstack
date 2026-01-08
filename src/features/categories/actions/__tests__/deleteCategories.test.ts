import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { defaultCategoryStatus } from '../../types/Categories';
import { deleteCategories } from '../deleteCategories';

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

describe('deleteCategories', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should delete multiple categories when user is the owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `dcs-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2, 3].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Test Category ${num} ${dateTag}`,
                    description: `Test description ${num} ${dateTag}`,
                  },
                ],
              },
            },
            include: {
              translations: true,
            },
          }),
        ),
      );

      categories.forEach((category) => {
        createdIds.push({ type: 'category', id: category.id });
        category.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: category.id,
            locale: translation.locale,
          });
        });
      });

      const categoryIds = categories.map((category) => category.id);

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteCategories({ ids: categoryIds, noDebug: true });

      expect(result.count).toBe(3);

      // Verify categories are deleted
      const remainingCategories = await jestPrisma.category.findMany({
        where: { id: { in: categoryIds } },
      });
      expect(remainingCategories).toHaveLength(0);

      // Verify translations are also deleted (cascade)
      const remainingTranslations = await jestPrisma.categoryTranslation.findMany({
        where: { categoryId: { in: categoryIds } },
      });
      expect(remainingTranslations).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete multiple categories when user is admin', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `dcs-admin-owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `dcs-admin-owner2-${dateTag}@test.com`, role: 'USER' },
      });
      const admin = await jestPrisma.user.create({
        data: { email: `dcs-admin-${dateTag}@test.com`, role: 'ADMIN' },
      });
      [owner1, owner2, admin].forEach((user) => {
        createdIds.push({ type: 'user', id: user.id });
      });

      const categories = await Promise.all([
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner1.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Admin Delete Test 1 ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner2.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Admin Delete Test 2 ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
      ]);

      categories.forEach((category) => {
        createdIds.push({ type: 'category', id: category.id });
        category.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: category.id,
            locale: translation.locale,
          });
        });
      });

      const categoryIds = categories.map((category) => category.id);

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const result = await deleteCategories({ ids: categoryIds, noDebug: true });

      expect(result.count).toBe(2);

      // Verify categories are deleted
      const remainingCategories = await jestPrisma.category.findMany({
        where: { id: { in: categoryIds } },
      });
      expect(remainingCategories).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Unauthorized Batch Delete Test ${dateTag}`,
              },
            ],
          },
        },
        include: {
          translations: true,
        },
      });
      createdIds.push({ type: 'category', id: category.id });
      category.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: category.id,
          locale: translation.locale,
        });
      });

      mockedGetCurrentUser.mockResolvedValue(undefined);

      await expect(deleteCategories({ ids: [category.id], noDebug: true })).rejects.toThrow(
        'User must be authenticated to delete categories',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when no category IDs are provided', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      await expect(deleteCategories({ ids: [], noDebug: true })).rejects.toThrow(
        'No category IDs provided',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to delete some categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `owner2-${dateTag}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `other-${dateTag}@test.com`, role: 'USER' },
      });
      [owner1, owner2, otherUser].forEach((user) => {
        createdIds.push({ type: 'user', id: user.id });
      });

      const categories = await Promise.all([
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner1.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Owner1 Category ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner2.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Owner2 Category ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
      ]);

      categories.forEach((category) => {
        createdIds.push({ type: 'category', id: category.id });
        category.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: category.id,
            locale: translation.locale,
          });
        });
      });

      const categoryIds = categories.map((category) => category.id);

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      await expect(deleteCategories({ ids: categoryIds, noDebug: true })).rejects.toThrow(
        'User is not authorized to delete categories:',
      );

      // Verify no categories were deleted
      const remainingCategories = await jestPrisma.category.findMany({
        where: { id: { in: categoryIds } },
      });
      expect(remainingCategories).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle partial authorization correctly', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `owner2-${dateTag}@test.com`, role: 'USER' },
      });
      [owner1, owner2].forEach((user) => {
        createdIds.push({ type: 'user', id: user.id });
      });

      const categories = await Promise.all([
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner1.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Owner1 Category ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
        jestPrisma.category.create({
          data: {
            status: defaultCategoryStatus,
            userId: owner2.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: `Owner2 Category ${dateTag}`,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        }),
      ]);

      categories.forEach((category) => {
        createdIds.push({ type: 'category', id: category.id });
        category.translations.forEach((translation) => {
          createdIds.push({
            type: 'categoryTranslation',
            categoryId: category.id,
            locale: translation.locale,
          });
        });
      });

      const categoryIds = categories.map((category) => category.id);

      mockedGetCurrentUser.mockResolvedValue(owner1 as TUser);

      // Owner1 should only be able to delete their own category
      await expect(deleteCategories({ ids: categoryIds, noDebug: true })).rejects.toThrow(
        'User is not authorized to delete categories:',
      );

      // Verify no categories were deleted due to partial authorization failure
      const remainingCategories = await jestPrisma.category.findMany({
        where: { id: { in: categoryIds } },
      });
      expect(remainingCategories).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle mixed scenarios with some non-existent categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Valid Category ${dateTag}`,
              },
            ],
          },
        },
        include: {
          translations: true,
        },
      });
      createdIds.push({ type: 'category', id: category.id });
      category.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: category.id,
          locale: translation.locale,
        });
      });

      const nonExistentId = `cat_${dateTag}_nonexistent`;
      const ids = [category.id, nonExistentId];

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await deleteCategories({ ids, noDebug: true });

      // Should only delete the existing category
      expect(result.count).toBe(1);

      // Verify the existing category is deleted
      const remainingCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(remainingCategory).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
