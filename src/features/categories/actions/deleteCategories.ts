'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

import { TDeleteCategoriesParams } from '../types/Categories';
import { deleteCategoryImage } from './deleteCategoryImage';

interface TOptions {
  noDebug?: boolean;
}

export async function deleteCategories(params: TDeleteCategoriesParams & TOptions) {
  const { ids, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to delete categories');
  }

  if (ids.length === 0) {
    throw new Error('No category IDs provided');
  }

  try {
    // Check if user has permission to delete all the categories
    if (!isAdmin) {
      const userCategories = await prisma.category.findMany({
        where: {
          id: { in: ids },
          createdBy: userId,
        },
        select: { id: true },
      } satisfies Prisma.CategoryFindManyArgs);

      const userCategoryIds = userCategories.map((c) => c.id);

      // Find IDs that exist but user doesn't own (unlike non-existent IDs which will be ignored)
      const unauthorizedIds = [];
      for (const id of ids) {
        // Check if ID exists in database
        const categoryExists = await prisma.category.findUnique({
          where: { id },
          select: { id: true },
        } satisfies Prisma.CategoryFindUniqueArgs);

        // If category exists but user doesn't own it, add to unauthorized list
        if (categoryExists && !userCategoryIds.includes(id)) {
          unauthorizedIds.push(id);
        }
      }

      if (unauthorizedIds.length > 0) {
        throw new Error(
          `User is not authorized to delete categories: ${unauthorizedIds.join(', ')}`,
        );
      }
    }

    // Fetch categories with their images before deletion
    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, imageUrl: true },
    } satisfies Prisma.CategoryFindManyArgs);

    // Delete categories (translations will be deleted via cascade)
    const deleteResult = await prisma.category.deleteMany({
      where: {
        id: { in: ids },
      },
    } satisfies Prisma.CategoryDeleteManyArgs);

    // Delete associated images from blob storage
    for (const category of categories) {
      if (category.imageUrl) {
        await deleteCategoryImage(category.imageUrl);
      }
    }

    return { count: deleteResult.count };
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[deleteCategories] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
