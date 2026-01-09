import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import {
  defaultCategoryStatus,
  TUpdateCategoriesParams,
  TUpdateCategoryParams,
  TUpdateCategoryTranslation,
} from '../../types/Categories';

// Setup the mock before any imports that might depend on deleteCategoryImage
// This ensures the mock is in place before updateCategories module is loaded in tests
// If this mock is not at the top, tests that verify deleteCategoryImage function calls will fail
const mockedDeleteCategoryImage = jest.fn();
jest.mock('../deleteCategoryImage', () => ({
  deleteCategoryImage: mockedDeleteCategoryImage,
}));

// We can't dynamically import updateCategories here because the module is already being tested
// with the mock in place, so we'll remove the import of updateCategories and only import it in tests
// where we need to make sure the mock is in place

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
    mockedDeleteCategoryImage.mockClear();
  });

  it('should update multiple categories when user is the owner', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-user-${testId}@test.com`, role: 'USER' },
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
                    name: `Category ${num} ${testId}`,
                    description: `Description ${num} ${testId}`,
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
            imageUrl: `https://example.com/cat1-updated-${testId}.jpg`,
          },
          {
            id: categories[1].id,
            status: 'SUGGESTED' as const,
            translations: [
              {
                locale: 'en',
                name: `Updated Category 2 ${testId}`,
                description: `Updated description 2 ${testId}`,
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
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-admin-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-admin-owner1-${testId}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-admin-owner2-${testId}@test.com`, role: 'USER' },
      });
      const admin = await jestPrisma.user.create({
        data: { email: `ucs-admin-${testId}@test.com`, role: 'ADMIN' },
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
                  name: `Admin Update Category 1 ${testId}`,
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
                  name: `Admin Update Category 2 ${testId}`,
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
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-unauthed-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-unauthed-owner-${testId}@test.com`, role: 'USER' },
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
                name: `Unauthenticated Batch Update Test ${testId}`,
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
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-auth-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-auth-owner1-${testId}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-auth-owner2-${testId}@test.com`, role: 'USER' },
      });
      const otherUser = await jestPrisma.user.create({
        data: { email: `ucs-other-${testId}@test.com`, role: 'USER' },
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
                  name: `Owner1 Category ${testId}`,
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
                  name: `Owner2 Category ${testId}`,
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
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-mixed-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const owner1 = await jestPrisma.user.create({
        data: { email: `ucs-mixed-owner1-${testId}@test.com`, role: 'USER' },
      });
      const owner2 = await jestPrisma.user.create({
        data: { email: `ucs-mixed-owner2-${testId}@test.com`, role: 'USER' },
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
                  name: `Owner1 Category ${testId}`,
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
                  name: `Owner2 Category ${testId}`,
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
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-upsert-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-upsert-user-${testId}@test.com`, role: 'USER' },
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
                    name: `Category ${num} Original ${testId}`,
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
                name: `Category 1 Updated ${testId}`,
                keywords: `updated1,${testId}`,
              },
              {
                locale: 'es',
                name: `Categoría 1 ${testId}`,
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
                name: `Category 2 Updated ${testId}`,
                description: `Updated description ${testId}`,
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
        `Categoría 1 ${testId}`,
      );
      expect(results[1].translations[0].description).toBe(`Updated description ${testId}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle partial updates for multiple categories', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-partial-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-partial-user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2, 3].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              imageUrl: `https://example.com/cat${num}-original-${testId}.jpg`,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Category ${num} Original ${testId}`,
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
                name: `Category 3 Updated ${testId}`,
                description: null,
                keywords: null,
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
      expect(results[2].translations[0].name).toBe(`Category 3 Updated ${testId}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle single category update in batch', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-single-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-single-user-${testId}@test.com`, role: 'USER' },
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
                name: `Single Batch Update Test ${testId}`,
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

  it('should delete old images when imageUrl is updated to new values in batch update', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-batch-update-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-batch-update-user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              imageUrl: `https://example.com/old-cat${num}-${testId}.jpg`,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Batch Update Category ${num} ${testId}`,
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
            imageUrl: `https://example.com/new-cat1-${testId}.jpg`,
          },
          {
            id: categories[1].id,
            imageUrl: `https://example.com/new-cat2-${testId}.jpg`,
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(2);
      expect(results[0].imageUrl).toBe(updateData.updates[0].imageUrl);
      expect(results[1].imageUrl).toBe(updateData.updates[1].imageUrl);

      // Verify that deleteCategoryImage was called for both old images
      expect(mockedDeleteCategoryImage).toHaveBeenCalledTimes(2);
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(categories[0].imageUrl);
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(categories[1].imageUrl);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not delete images when imageUrl is not changed in batch update', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-no-change-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-no-change-user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              imageUrl: `https://example.com/existing-cat${num}-${testId}.jpg`,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `No Change Category ${num} ${testId}`,
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
            status: 'HIDDEN' as const, // Only update status
          },
          {
            id: categories[1].id,
            translations: [
              {
                locale: 'en',
                name: `Updated Name ${testId}`,
                description: null,
                keywords: null,
              },
            ], // Only update translation
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('HIDDEN');
      expect(results[0].imageUrl).toBe(categories[0].imageUrl); // Should remain unchanged
      expect(results[1].translations[0].name).toContain('Updated Name');

      // Verify that deleteCategoryImage was not called since no image URLs were changed
      expect(mockedDeleteCategoryImage).not.toHaveBeenCalled();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle mixed updates (some with image changes, some without) in batch', async () => {
    // Dynamically import updateCategories to ensure mock is in place
    const { updateCategories } = await import('../updateCategories');

    // Create a more unique identifier for this specific test
    const timestamp = Date.now().toString();
    const testId = `ucs-mixed-${timestamp}`;
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `ucs-mixed-user-${testId}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const categories = await Promise.all(
        [1, 2, 3].map((num) =>
          jestPrisma.category.create({
            data: {
              status: defaultCategoryStatus,
              userId: user.id,
              imageUrl: `https://example.com/mixed-cat${num}-${testId}.jpg`,
              translations: {
                create: [
                  {
                    locale: 'en',
                    name: `Mixed Update Category ${num} ${testId}`,
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
            imageUrl: `https://example.com/updated-cat1-${testId}.jpg`, // Change image
          },
          {
            id: categories[1].id,
            status: 'HIDDEN' as const, // Don't change image
          },
          {
            id: categories[2].id,
            imageUrl: null, // Set to null (should delete old image)
          },
        ],
      };

      const results = await updateCategories({ ...updateData, noDebug: true });

      expect(results).toHaveLength(3);
      expect(results[0].imageUrl).toBe(updateData.updates[0].imageUrl);
      expect(results[1].status).toBe('HIDDEN');
      expect(results[1].imageUrl).toBe(categories[1].imageUrl); // Should remain unchanged
      expect(results[2].imageUrl).toBeNull();

      // Verify that deleteCategoryImage was called twice (for categories 0 and 2)
      expect(mockedDeleteCategoryImage).toHaveBeenCalledTimes(2);
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(categories[0].imageUrl);
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(categories[2].imageUrl);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
