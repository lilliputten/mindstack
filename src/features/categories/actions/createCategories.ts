'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { defaultCategoryStatus, TCreateCategoriesParams } from '../types/Categories';

interface TOptions {
  noDebug?: boolean;
}

export async function createCategories(params: TCreateCategoriesParams & TOptions) {
  const { categories, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to create categories');
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const createdCategoriesWithTranslations = [];
    for (const categoryData of categories) {
      const createdCategory = await prisma.category.create({
        data: {
          createdBy: userId,
          status: categoryData.status || defaultCategoryStatus,
          imageUrl: categoryData.imageUrl,
          translations: {
            create: categoryData.translations,
          },
        } satisfies Prisma.CategoryCreateArgs['data'],
        include: {
          translations: true,
        } satisfies Prisma.CategoryCreateArgs['include'],
      } satisfies Prisma.CategoryCreateArgs);
      createdCategoriesWithTranslations.push(createdCategory);
    }

    return createdCategoriesWithTranslations;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[createCategories] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
