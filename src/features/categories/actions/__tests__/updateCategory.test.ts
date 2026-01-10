import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getRandomHashString } from '@/lib/helpers/strings';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { defaultCategoryStatus, TUpdateCategoryParams } from '../../types/Categories';

// Setup the mock before any imports that might depend on deleteCategoryImage
// This ensures the mock is in place before updateCategory module is loaded in tests
// If this mock is not at the top, tests that verify deleteCategoryImage function calls will fail
const mockedDeleteCategoryImage = jest.fn();
jest.mock('../deleteCategoryImage', () => ({
  deleteCategoryImage: mockedDeleteCategoryImage,
}));

// updateCategory will be dynamically imported in each test

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

describe('updateCategory', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedDeleteCategoryImage.mockClear();
  });

  it('should update a category when user is the owner', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-user-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Original Category ${dateTag}`,
                description: `Original description ${dateTag}`,
                keywords: `original,${dateTag}`,
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

      const updateData: TUpdateCategoryParams = {
        id: category.id,
        status: 'HIDDEN' as const,
        imageUrl: `https://example.com/updated-${dateTag}.jpg`,
        translations: [
          {
            locale: 'en',
            name: `Updated Category ${dateTag}`,
            description: `Updated description ${dateTag}`,
            keywords: `updated,${dateTag}`,
          },
          {
            locale: 'es',
            name: `Categoría Actualizada ${dateTag}`,
            description: `Descripción actualizada ${dateTag}`,
            keywords: null,
          },
        ],
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.id).toBe(category.id);
      expect(result.status).toBe('HIDDEN');
      expect(result.imageUrl).toBe(updateData.imageUrl);
      expect(result.translations).toHaveLength(2);

      const enTranslation = result.translations.find((t) => t.locale === 'en');
      const esTranslation = result.translations.find((t) => t.locale === 'es');

      expect(enTranslation?.name).toBe(updateData.translations?.[0].name);
      expect(esTranslation?.name).toBe(updateData.translations?.[1].name);

      // Verify database is updated
      const dbCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
        include: { translations: true },
      });
      expect(dbCategory?.status).toBe('HIDDEN');
      expect(dbCategory?.translations).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should update a category when user is admin', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: {
          email: `uc-admin-owner-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const admin = await jestPrisma.user.create({
        data: { email: `uc-admin-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: admin.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: owner.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Admin Update Test ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(admin as TUser);

      const updateData: TUpdateCategoryParams = {
        id: category.id,
        status: 'SUGGESTED' as const,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.id).toBe(category.id);
      expect(result.status).toBe('SUGGESTED');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-unauthed-owner-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Unauthenticated Update Test ${dateTag}`,
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
        id: category.id,
        status: 'HIDDEN' as const,
      };

      await expect(updateCategory({ ...updateData, noDebug: true })).rejects.toThrow(
        'User must be authenticated to update a category',
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

  it('should throw error when category does not exist', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-nonexist-user-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const nonExistentId = `cat_${dateTag}_nonexistent`;

      const updateData = {
        id: nonExistentId,
        status: 'HIDDEN' as const,
      };

      await expect(updateCategory({ ...updateData, noDebug: true })).rejects.toThrow(
        'Category not found',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to update category', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `uc-owner-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const otherUser = await jestPrisma.user.create({
        data: { email: `uc-other-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: otherUser.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: owner.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Unauthorized Update Test ${dateTag}`,
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

      mockedGetCurrentUser.mockResolvedValue(otherUser as TUser);

      const updateData = {
        id: category.id,
        status: 'HIDDEN' as const,
      };

      await expect(updateCategory({ ...updateData, noDebug: true })).rejects.toThrow(
        'User is not authorized to update this category',
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

  it('should update only specified fields (partial update)', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-partial-user-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/original-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Original Name ${dateTag}`,
                description: `Original description ${dateTag}`,
                keywords: `original,${dateTag}`,
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

      // Only update status, leave other fields unchanged
      const updateData = {
        id: category.id,
        status: 'HIDDEN' as const,
        // No imageUrl or translations provided
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.id).toBe(category.id);
      expect(result.status).toBe('HIDDEN');
      expect(result.imageUrl).toBe(category.imageUrl); // Should remain unchanged
      expect(result.translations).toHaveLength(1);
      expect(result.translations[0].name).toBe(`Original Name ${dateTag}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should update translations using upsert (create new and update existing)', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-upsert-user-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Original EN ${dateTag}`,
                description: `Original EN description ${dateTag}`,
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

      const updateData: TUpdateCategoryParams = {
        id: category.id,
        translations: [
          {
            locale: 'en', // Update existing
            name: `Updated EN ${dateTag}`,
            description: `Updated EN description ${dateTag}`,
            keywords: `updated,en,${dateTag}`,
          },
          {
            locale: 'es', // Create new
            name: `New ES ${dateTag}`,
            description: `New ES description ${dateTag}`,
            keywords: null,
          },
        ],
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.translations).toHaveLength(2);

      const enTranslation = result.translations.find((t) => t.locale === 'en');
      const esTranslation = result.translations.find((t) => t.locale === 'es');

      expect(enTranslation?.name).toBe(`Updated EN ${dateTag}`);
      expect(enTranslation?.keywords).toBe(`updated,en,${dateTag}`);
      expect(esTranslation?.name).toBe(`New ES ${dateTag}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should set imageUrl to null explicitly', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-null-image-user-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/to-be-null-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Null Image Test ${dateTag}`,
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
        id: category.id,
        imageUrl: null,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.imageUrl).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not delete old image when updating with the same imageUrl value', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-same-url-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const imageUrl = `https://example.com/same-url-${dateTag}.jpg`;
      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: imageUrl,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Same URL Test ${dateTag}`,
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

      // Update with the same imageUrl value
      const updateData = {
        id: category.id,
        imageUrl: imageUrl, // Same URL as before
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.imageUrl).toBe(imageUrl);
      expect(mockedDeleteCategoryImage).not.toHaveBeenCalled(); // Should not delete when same URL
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete old image when imageUrl is updated to a new value', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-delete-old-image-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/old-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Old Image Test ${dateTag}`,
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
        id: category.id,
        imageUrl: `https://example.com/new-${dateTag}.jpg`,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.imageUrl).toBe(updateData.imageUrl);
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(category.imageUrl);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not delete old image when imageUrl is not changed', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-no-change-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/same-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Same Image Test ${dateTag}`,
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
        id: category.id,
        status: 'HIDDEN' as const, // Only update status, not imageUrl
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.status).toBe('HIDDEN');
      expect(result.imageUrl).toBe(category.imageUrl);
      expect(mockedDeleteCategoryImage).not.toHaveBeenCalled();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should not delete old image when old imageUrl is null', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-null-old-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: null, // No initial image
          translations: {
            create: [
              {
                locale: 'en',
                name: `Null Old Image Test ${dateTag}`,
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
        id: category.id,
        imageUrl: `https://example.com/new-from-null-${dateTag}.jpg`,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.imageUrl).toBe(updateData.imageUrl);
      expect(mockedDeleteCategoryImage).not.toHaveBeenCalled(); // Should not be called when old imageUrl is null
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete old image when imageUrl is updated to null', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-to-null-${dateTag}-${getRandomHashString(6)}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/to-be-deleted-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `To Null Image Test ${dateTag}`,
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
        id: category.id,
        imageUrl: null,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.imageUrl).toBeNull();
      expect(mockedDeleteCategoryImage).toHaveBeenCalledWith(category.imageUrl);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should validate locale values against allowed locales', async () => {
    const { updateCategory } = await import('../updateCategory');

    // Import the schema we created
    const { LocaleSchema } = await import('@/i18n/types');

    // Test valid locales
    expect(LocaleSchema.safeParse('en').success).toBe(true);
    expect(LocaleSchema.safeParse('es').success).toBe(true);
    expect(LocaleSchema.safeParse('ru').success).toBe(true);

    // Test invalid locale
    expect(LocaleSchema.safeParse('fr').success).toBe(false);

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-locale-validation-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Locale Validation Test ${dateTag}`,
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

      // Update with a new translation, keeping the original
      const updateData = {
        id: category.id,
        translations: [
          {
            locale: 'en', // Existing locale - update it
            name: `Updated EN with valid locale ${dateTag}`,
          },
          {
            locale: 'es', // New locale
            name: `Updated with valid locale ${dateTag}`,
          },
        ],
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.translations).toHaveLength(2); // Now expect 2 translations
      const enTranslation = result.translations.find((t) => t.locale === 'en');
      const esTranslation = result.translations.find((t) => t.locale === 'es');

      expect(enTranslation?.name).toBe(`Updated EN with valid locale ${dateTag}`);
      expect(esTranslation?.name).toBe(`Updated with valid locale ${dateTag}`);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should set updatedBy field with current userId when updating category', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-updatedby-user-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          translations: {
            create: [
              {
                locale: 'en',
                name: `UpdatedBy Test ${dateTag}`,
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
        id: category.id,
        status: 'HIDDEN' as const,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.id).toBe(category.id);
      expect(result.updatedBy).toBe(user.id);
      expect(result.updatedBy).not.toBeNull();

      // Also verify in database that updatedBy was set
      const dbCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(dbCategory?.updatedBy).toBe(user.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should update updatedBy field with current userId on subsequent updates', async () => {
    const { updateCategory } = await import('../updateCategory');

    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: {
          email: `uc-updatedby-update-${dateTag}-${getRandomHashString(6)}@test.com`,
          role: 'USER',
        },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          updatedBy: user.id, // Initially set to user id
          translations: {
            create: [
              {
                locale: 'en',
                name: `UpdatedBy Subsequent Update Test ${dateTag}`,
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

      // Perform another update
      const updateData = {
        id: category.id,
        status: 'SUGGESTED' as const,
      };

      const result = await updateCategory({ ...updateData, noDebug: true });

      expect(result.id).toBe(category.id);
      expect(result.updatedBy).toBe(user.id); // Should be updated with current user id

      // Verify in database that updatedBy was updated
      const dbCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(dbCategory?.updatedBy).toBe(user.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
