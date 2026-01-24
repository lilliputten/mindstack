'use server';

import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

import { TDeleteCategoryParams } from '../types/Categories';

interface TOptions {
  noDebug?: boolean;
}

export async function deleteCategory(params: TDeleteCategoryParams & TOptions) {
  const { id, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to delete a category');
  }

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { createdBy: true },
    } satisfies Prisma.CategoryFindUniqueArgs);

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (existingCategory.createdBy !== userId && !isAdmin) {
      throw new Error('User is not authorized to delete this category');
    }

    const category = await prisma.category.delete({
      where: { id },
    } satisfies Prisma.CategoryDeleteArgs);

    // Clear recent categories cache
    try {
      revalidateTag('recent-categories-all');
    } catch (cacheError) {
      if (!noDebug) {
        // eslint-disable-next-line no-console
        console.warn('[deleteCategory] Failed to clear cache', { cacheError });
      }
    }

    return category;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[deleteCategory] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
