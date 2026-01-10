import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { defaultCategoryStatus, TCreateCategoryParams } from '../../types/Categories';
import { createCategory } from '../createCategory';

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

describe('createCategory', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should create a category with translations', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `cc-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoryData: TCreateCategoryParams = {
        status: defaultCategoryStatus,
        imageUrl: `https://example.com/image-${dateTag}.jpg`,
        translations: [
          {
            locale: 'en',
            name: `Test Category ${dateTag}`,
            description: `Test description ${dateTag}`,
            keywords: `test,keyword,${dateTag}`,
          },
          {
            locale: 'es',
            name: `Categoría de prueba ${dateTag}`,
            description: `Descripción de prueba ${dateTag}`,
            keywords: `prueba,palabra clave,${dateTag}`,
          },
        ],
      };

      const result = await createCategory({ ...categoryData, noDebug: true });

      createdIds.push({ type: 'category', id: result.id });
      result.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: result.id,
          locale: translation.locale,
        });
      });

      expect(result.status).toBe(defaultCategoryStatus);
      expect(result.createdBy).toBe(user.id);
      expect(result.imageUrl).toBe(categoryData.imageUrl);
      expect(result.translations).toHaveLength(2);
      expect(result.translations[0].name).toBe(categoryData.translations?.[0].name);
      expect(result.translations[1].name).toBe(categoryData.translations?.[1].name);

      // Verify category is persisted in database
      const dbCategory = await jestPrisma.category.findUnique({
        where: { id: result.id },
        include: { translations: true },
      });
      expect(dbCategory).not.toBeNull();
      expect(dbCategory?.translations).toHaveLength(2);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a category with default status', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `cc-default-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoryData: TCreateCategoryParams = {
        translations: [
          {
            locale: 'en',
            name: `Default Status Category ${dateTag}`,
            description: `Testing default status ${dateTag}`,
            keywords: null,
          },
        ],
        imageUrl: null,
      };

      const result = await createCategory({ ...categoryData, noDebug: true });

      createdIds.push({ type: 'category', id: result.id });
      result.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: result.id,
          locale: translation.locale,
        });
      });

      expect(result.status).toBe(defaultCategoryStatus); // Default status
      expect(result.createdBy).toBe(user.id);
      expect(result.imageUrl).toBeNull();
      expect(result.translations).toHaveLength(1);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      mockedGetCurrentUser.mockResolvedValue(undefined);

      const categoryData: TCreateCategoryParams = {
        status: defaultCategoryStatus,
        translations: [
          {
            locale: 'en',
            name: `Unauthenticated Category ${dateTag}`,
            description: `Should fail ${dateTag}`,
            // keywords: null,
            // keywords: undefined,
          },
        ],
      };

      await expect(createCategory({ ...categoryData, noDebug: true })).rejects.toThrow(
        'User must be authenticated to create a category',
      );

      // Verify no category was created
      const categories = await jestPrisma.category.findMany({
        where: {
          translations: {
            some: { name: `Unauthenticated Category ${dateTag}` },
          },
        },
      });
      expect(categories).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a category with HIDDEN status', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `cc-hidden-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoryData: TCreateCategoryParams = {
        status: 'HIDDEN' as const,
        translations: [
          {
            locale: 'en',
            name: `Hidden Category ${dateTag}`,
            description: `Testing hidden status ${dateTag}`,
            keywords: null,
          },
        ],
      };

      const result = await createCategory({ ...categoryData, noDebug: true });

      createdIds.push({ type: 'category', id: result.id });
      result.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: result.id,
          locale: translation.locale,
        });
      });

      expect(result.status).toBe('HIDDEN');
      expect(result.createdBy).toBe(user.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a category with SUGGESTED status', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `cc-suggested-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoryData: TCreateCategoryParams = {
        status: 'SUGGESTED' as const,
        translations: [
          {
            locale: 'en',
            name: `Suggested Category ${dateTag}`,
            description: `Testing suggested status ${dateTag}`,
            keywords: null,
          },
        ],
      };

      const result = await createCategory({ ...categoryData, noDebug: true });

      createdIds.push({ type: 'category', id: result.id });
      result.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: result.id,
          locale: translation.locale,
        });
      });

      expect(result.status).toBe('SUGGESTED');
      expect(result.createdBy).toBe(user.id);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should create a category without optional fields', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: `cc-minimal-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const categoryData: TCreateCategoryParams = {
        translations: [
          {
            locale: 'en',
            name: `Minimal Category ${dateTag}`,
            description: null,
            keywords: null,
          },
        ],
      };

      const result = await createCategory({ ...categoryData, noDebug: true });

      createdIds.push({ type: 'category', id: result.id });
      result.translations.forEach((translation) => {
        createdIds.push({
          type: 'categoryTranslation',
          categoryId: result.id,
          locale: translation.locale,
        });
      });

      expect(result.status).toBe(defaultCategoryStatus); // Default
      expect(result.imageUrl).toBeNull(); // Prisma may return null instead of undefined
      expect(result.translations[0].description).toBeNull();
      expect(result.translations[0].keywords).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
