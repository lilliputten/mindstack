import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import {
  defaultCategoryStatus,
  TUpdateCategoriesParams,
  TUpdateCategoryParams,
  TUpdateCategoryTranslation,
} from '../../types/Categories';
import { updateCategories } from '../updateCategories';

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

describe('updateCategories', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should update multiple categories when user is the owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Category ${num} ${dateTag}`,
                    description: `Description ${num} ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const updateData: TUpdateCategoriesParams = {
        updates: [
          {
            id: categories[0].id,
            status: 'HIDDEN' as const,
            imageUrl: `https://example.com/cat1-updated-${dateTag}.jpg`,
          },
          {
            id: categories[1].id,
            status: 'SUGGESTED' as const,
            translations: [
              {
                locale: 'en',
                name: `Updated Category 2 ${dateTag}`,
                description: `Updated description 2 ${dateTag}`,
                keywords: null,
              } satisfies TUpdateCategoryTranslation,
            ] satisfies TUpdateCategoryParams['translations'],
          },
        ] satisfies TUpdateCategoryParams[],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(2);

      expect(results[0].id).toBe(categories[0].id);
      expect(results[0].status).toBe('HIDDEN');
      expect(results[0].imageUrl).toBe(updateData.updates[0].imageUrl);

      expect(results[1].id).toBe(categories[1].id);
      expect(results[1].status).toBe('SUGGESTED');
      if (updateData.updates[1].translations && updateData.updates[1].translations.length > 0) {
        expect(results[1].translations[0].name).toBe(updateData.updates[1].translations[0].name);
      }

      // Verify database is updated
      const dbCategories = await jestPrisma.category.findMany({
        where: { id: { in: categories.map((c) => c.id) } },
      });
      expect(dbCategories[0].status).toBe('HIDDEN');
      expect(dbCategories[1].status).toBe('SUGGESTED');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should update multiple categories when user is admin', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-admin-owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-admin-owner2-${dateTag}@test.com`, role: 'USER' },
      });
      const admin = await jestPrisma.user.create({
        data: { email: `ucs-admin-${dateTag}@test.com`, role: 'ADMIN' },
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
                  name: `Admin Update Category 1 ${dateTag}`,
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
                  name: `Admin Update Category 2 ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const updateData = {
        updates: [
          {
            id: categories[0].id,
            status: 'HIDDEN' as const,
          },
          {
            id: categories[1].id,
            status: 'SUGGESTED' as const,
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('HIDDEN');
      expect(results[1].status).toBe('SUGGESTED');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-unauthed-owner-${dateTag}@test.com`, role: 'USER' },
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
                name: `Unauthenticated Batch Update Test ${dateTag}`,
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

      const updateData = {
        updates: [
          {
            id: category.id,
            status: 'HIDDEN' as const,
          },
        ],
      };

      await expect(updateCategories({ ...updateData, noDebug: true })).rejects.toThrow(
        'User must be authenticated to update categories',
      );

      // Verify category was not updated
      const dbCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(dbCategory?.status).toBe(defaultCategoryStatus);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to update some categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-auth-owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-auth-owner2-${dateTag}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `ucs-other-${dateTag}@test.com`, role: 'USER' },
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

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      const updateData = {
        updates: [
          {
            id: categories[0].id,
            status: 'HIDDEN' as const,
          },
          {
            id: categories[1].id,
            status: 'SUGGESTED' as const,
          },
        ],
      };

      await expect(updateCategories({ ...updateData, noDebug: true })).rejects.toThrow(
        'User is not authorized to update some categories',
      );

      // Verify no categories were updated
      const dbCategories = await jestPrisma.category.findMany({
        where: { id: { in: categories.map((c) => c.id) } },
      });
      expect(dbCategories[0].status).toBe(defaultCategoryStatus);
      expect(dbCategories[1].status).toBe(defaultCategoryStatus);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle mixed ownership correctly', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-mixed-owner1-${dateTag}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-mixed-owner2-${dateTag}@test.com`, role: 'USER' },
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

      mockedGetCurrentUser.mockResolvedValue(owner1 as TUser);

      // Owner1 should only be able to update their own category
      const updateData = {
        updates: [
          {
            id: categories[0].id,
            status: 'HIDDEN' as const,
          },
          {
            id: categories[1].id, // Owner2's category
            status: 'SUGGESTED' as const,
          },
        ],
      };

      await expect(updateCategories({ ...updateData, noDebug: true })).rejects.toThrow(
        'User is not authorized to update some categories',
      );

      // Verify no categories were updated due to partial authorization failure
      const dbCategories = await jestPrisma.category.findMany({
        where: { id: { in: categories.map((c) => c.id) } },
      });
      expect(dbCategories[0].status).toBe(defaultCategoryStatus);
      expect(dbCategories[1].status).toBe(defaultCategoryStatus);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should update translations using upsert for multiple categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-upsert-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Category ${num} Original ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const updateData: TUpdateCategoriesParams = {
        updates: [
          {
            id: categories[0].id,
            translations: [
              {
                locale: 'en',
                name: `Category 1 Updated ${dateTag}`,
                keywords: `updated1,${dateTag}`,
              },
              {
                locale: 'es',
                name: `Categoría 1 ${dateTag}`,
                description: null,
                keywords: null,
              },
            ],
          },
          {
            id: categories[1].id,
            translations: [
              {
                locale: 'en',
                name: `Category 2 Updated ${dateTag}`,
                description: `Updated description ${dateTag}`,
                keywords: null,
              },
            ],
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(2);
      expect(results[0].translations).toHaveLength(2);
      expect(results[1].translations).toHaveLength(1);

      expect(results[0].translations.find((t) => t.locale === 'es')?.name).toBe(
        `Categoría 1 ${dateTag}`,
      );
      expect(results[1].translations[0].description).toBe(`Updated description ${dateTag}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle partial updates for multiple categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-partial-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2, 3].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              imageUrl: `https://example.com/cat${num}-original-${dateTag}.jpg`,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Category ${num} Original ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const updateData = {
        updates: [
          {
            id: categories[0].id,
            status: 'HIDDEN' as const,
            // No imageUrl or translations
          },
          {
            id: categories[1].id,
            imageUrl: null,
            // No status or translations
          },
          {
            id: categories[2].id,
            translations: [
              {
                locale: 'en',
                name: `Category 3 Updated ${dateTag}`,
                description: null,
                keywords: null,
                categoryId: categories[2].id,
              },
            ],
            // No status or imageUrl
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results[0].status).toBe('HIDDEN');
      expect(results[0].imageUrl).toBe(categories[0].imageUrl); // Unchanged

      expect(results[1].status).toBe(defaultCategoryStatus); // Unchanged
      expect(results[1].imageUrl).toBeNull();

      expect(results[2].status).toBe(defaultCategoryStatus); // Unchanged
      expect(results[2].translations[0].name).toBe(`Category 3 Updated ${dateTag}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle single category update in batch', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-single-user-${dateTag}@test.com`, role: 'USER' },
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
                name: `Single Batch Update Test ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const updateData = {
        updates: [
          {
            id: category.id,
            status: 'SUGGESTED' as const,
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('SUGGESTED');
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
