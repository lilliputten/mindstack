import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { defaultCategoryStatus, TUpdateCategoryParams } from '../../types/Categories';
import { updateCategory } from '../updateCategory';

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
  });

  it('should update a category when user is the owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-user-${dateTag}@test.com`, role: 'USER' },
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `uc-admin-owner-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const admin = await jestPrisma.user.create({
        data: { email: `uc-admin-${dateTag}@test.com`, role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: admin.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: owner.id,
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-unauthed-owner-${dateTag}@test.com`, role: 'USER' },
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-nonexist-user-${dateTag}@test.com`, role: 'USER' },
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: `uc-owner-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const otherUser = await jestPrisma.user.create({
        data: { email: `uc-other-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: otherUser.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: owner.id,
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-partial-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: user.id,
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-upsert-user-${dateTag}@test.com`, role: 'USER' },
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
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `uc-null-image-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          userId: user.id,
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
});
