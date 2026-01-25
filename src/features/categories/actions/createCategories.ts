'use server';

import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { translatedPeriod } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { allowSuggestCategoriesIn } from '@/features/categories/constants';

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

  // Check if any category is suggested and apply rate limiting
  const hasSuggestedCategory = categories.some((category) => category.status === 'SUGGESTED');
  if (hasSuggestedCategory) {
    const recentSuggestedCategory = await prisma.category.findFirst({
      where: {
        createdBy: userId,
        status: 'SUGGESTED',
        createdAt: {
          gte: new Date(Date.now() - allowSuggestCategoriesIn),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentSuggestedCategory) {
      throw new Error(
        `You can only suggest one category every ${translatedPeriod(allowSuggestCategoriesIn)}. Please wait before suggesting another category.`,
      );
    }
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

    // Clear recent categories cache
    try {
      revalidateTag('recent-categories-all');
    } catch (cacheError) {
      if (!noDebug) {
        // eslint-disable-next-line no-console
        console.warn('[createCategories] Failed to clear cache', { cacheError });
      }
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
