import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';
import { generateTestEmail } from '@/jest/test/testUtils';

import { defaultCategoryStatus } from '../../types/Categories';
import { deleteCategory } from '../deleteCategory';

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

describe('deleteCategory', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should delete a category when user is the owner', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('dc-user'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: user.id,
          imageUrl: `https://example.com/image-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Test Category ${dateTag}`,
                description: `Test description ${dateTag}`,
                keywords: `test,keyword,${dateTag}`,
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

      const result = await deleteCategory({ id: category.id, noDebug: true });

      expect(result.id).toBe(category.id);

      // Verify category is deleted
      const deletedCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();

      // Verify translations are also deleted (cascade)
      const remainingTranslations = await jestPrisma.categoryTranslation.findMany({
        where: { categoryId: category.id },
      });
      expect(remainingTranslations).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should delete a category when user is admin', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: generateTestEmail('dc-admin-owner'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const admin = await jestPrisma.user.create({
        data: { email: generateTestEmail('dc-admin'), role: 'ADMIN' },
      });
      createdIds.push({ type: 'user', id: admin.id });

      const category = await jestPrisma.category.create({
        data: {
          status: defaultCategoryStatus,
          createdBy: owner.id,
          imageUrl: `https://example.com/image-${dateTag}.jpg`,
          translations: {
            create: [
              {
                locale: 'en',
                name: `Admin Delete Test ${dateTag}`,
                description: `Category owned by different user ${dateTag}`,
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

      const result = await deleteCategory({ id: category.id, noDebug: true });

      expect(result.id).toBe(category.id);

      // Verify category is deleted
      const deletedCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authenticated', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('user'), role: 'USER' },
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
                name: `Unauthorized Delete Test ${dateTag}`,
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

      await expect(deleteCategory({ id: category.id, noDebug: true })).rejects.toThrow(
        'User must be authenticated to delete a category',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when category does not exist', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('user'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const nonExistentId = `cat_${dateTag}_nonexistent`;

      await expect(deleteCategory({ id: nonExistentId, noDebug: true })).rejects.toThrow(
        'Category not found',
      );
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should throw error when user is not authorized to delete category', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const owner = await jestPrisma.user.create({
        data: { email: generateTestEmail('owner'), role: 'USER' },
      });
      createdIds.push({ type: 'user', id: owner.id });

      const otherUser = await jestPrisma.user.create({
        data: { email: generateTestEmail('other'), role: 'USER' },
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
                name: `Unauthorized Access Test ${dateTag}`,
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

      await expect(deleteCategory({ id: category.id, noDebug: true })).rejects.toThrow(
        'User is not authorized to delete this category',
      );

      // Verify category still exists
      const existingCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(existingCategory).not.toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should handle categories with multiple translations', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];
    try {
      const user = await jestPrisma.user.create({
        data: { email: generateTestEmail('user'), role: 'USER' },
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
                name: `Multi-lang Category EN ${dateTag}`,
                description: `English description ${dateTag}`,
                keywords: `english,test,${dateTag}`,
              },
              {
                locale: 'es',
                name: `Multi-lang Category ES ${dateTag}`,
                description: `Spanish description ${dateTag}`,
                keywords: `spanish,test,${dateTag}`,
              },
              {
                locale: 'ru',
                name: `Multi-lang Category RU ${dateTag}`,
                description: `Russian description ${dateTag}`,
                keywords: `russian,test,${dateTag}`,
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

      const result = await deleteCategory({ id: category.id, noDebug: true });

      expect(result.id).toBe(category.id);

      // Verify category and all translations are deleted
      const deletedCategory = await jestPrisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();

      const remainingTranslations = await jestPrisma.categoryTranslation.findMany({
        where: { categoryId: category.id },
      });
      expect(remainingTranslations).toHaveLength(0);
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
