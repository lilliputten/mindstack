import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { jestPrisma } from '@/lib/db/jestPrisma';
import { formatDateTag } from '@/lib/helpers/dates';
import { getCurrentUser } from '@/lib/session';
import { TUser } from '@/features/users/types/TUser';

import { getMostRecentSuggestedCategory } from '../getMostRecentSuggestedCategory';

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

describe('getMostRecentSuggestedCategory', () => {
  afterEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('should return null for unauthorized user', async () => {
    mockedGetCurrentUser.mockResolvedValue(undefined);

    const result = await getMostRecentSuggestedCategory();

    expect(result).toBeNull();
  });

  it('should return null when user has no suggested categories', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `gmrsc-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await getMostRecentSuggestedCategory();

      expect(result).toBeNull();
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return the most recent suggested category', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `gmrsc-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create multiple suggested categories with different creation dates
      const category1 = await jestPrisma.category.create({
        data: {
          status: 'SUGGESTED',
          createdBy: user.id,
          createdAt: new Date(Date.now() - 10000), // Older category
        },
      });
      createdIds.push({ type: 'category', id: category1.id });

      const category2 = await jestPrisma.category.create({
        data: {
          status: 'SUGGESTED',
          createdBy: user.id,
          createdAt: new Date(), // Newer category (should be returned)
        },
      });
      createdIds.push({ type: 'category', id: category2.id });

      // Create a non-suggested category that should be ignored
      const nonSuggestedCategory = await jestPrisma.category.create({
        data: {
          status: 'PUBLIC',
          createdBy: user.id,
        },
      });
      createdIds.push({ type: 'category', id: nonSuggestedCategory.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      const result = await getMostRecentSuggestedCategory();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(category2.id); // Should return the most recent suggested category
      expect(result?.status).toBe('SUGGESTED');
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should filter by time period when provided', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `gmrsc-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create categories outside the time period
      const oldCategory = await jestPrisma.category.create({
        data: {
          status: 'SUGGESTED',
          createdBy: user.id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      });
      createdIds.push({ type: 'category', id: oldCategory.id });

      // Create category within the time period
      const recentCategory = await jestPrisma.category.create({
        data: {
          status: 'SUGGESTED',
          createdBy: user.id,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
      });
      createdIds.push({ type: 'category', id: recentCategory.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Test with time period filter (last 3 days)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = await getMostRecentSuggestedCategory({
        minCreatedAt: threeDaysAgo,
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(recentCategory.id); // Should return the category within the time period
    } finally {
      await cleanupDb(createdIds);
    }
  });

  it('should return null when no categories match time period filter', async () => {
    const dateTag = formatDateTag();
    const createdIds: CreatedId[] = [];

    try {
      const user = await jestPrisma.user.create({
        data: { email: `gmrsc-user-${dateTag}@test.com`, role: 'USER' },
      });
      createdIds.push({ type: 'user', id: user.id });

      // Create category outside the time period
      const oldCategory = await jestPrisma.category.create({
        data: {
          status: 'SUGGESTED',
          createdBy: user.id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      });
      createdIds.push({ type: 'category', id: oldCategory.id });

      mockedGetCurrentUser.mockResolvedValue(user as TUser);

      // Test with time period filter (last 3 days only)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = await getMostRecentSuggestedCategory({
        minCreatedAt: threeDaysAgo,
        maxCreatedAt: tomorrow,
      });

      expect(result).toBeNull(); // Should return null as no categories match the time period
    } finally {
      await cleanupDb(createdIds);
    }
  });
});
