'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { TUpdateCategoriesParams } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function updateCategories(params: TUpdateCategoriesParams & TOptions) {
  const { updates, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to update categories');
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const categoryIds = updates.map((update) => update.id);

    // Check ownership for all categories
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, userId: true },
    } satisfies Prisma.CategoryFindManyArgs);

    const ownedCategoryIds = existingCategories
      .filter((cat) => cat.userId === userId || isAdmin)
      .map((cat) => cat.id);

    if (ownedCategoryIds.length !== categoryIds.length) {
      throw new Error('User is not authorized to update some categories');
    }

    const updatePromises = updates.map(async (update) => {
      const { id, status, translations, imageUrl } = update;

      const updateData: Prisma.CategoryUpdateArgs['data'] = {};
      /*
      const updateData: {
        status?: CategoryStatusType;
        imageUrl?: string | null;
        translations?: {
          upsert: Array<{
            where: { categoryId_locale: { categoryId: string; locale: string } };
            update: { name: string; description?: string | null; keywords?: string | null };
            create: {
              locale: string;
              name: string;
              description?: string | null;
              keywords?: string | null;
            };
          }>;
        };
      } = {};
       */
      if (status !== undefined) updateData.status = status;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      if (translations) {
        updateData.translations = {
          upsert: translations.map((translation) => ({
            where: { categoryId_locale: { categoryId: id, locale: translation.locale } },
            update: {
              name: translation.name,
              description: translation.description ?? null,
              keywords: translation.keywords ?? null,
            },
            create: {
              locale: translation.locale,
              name: translation.name ?? '',
              description: translation.description ?? null,
              keywords: translation.keywords ?? null,
            },
          })),
        };
      }

      return prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          translations: true,
        },
      } satisfies Prisma.CategoryUpdateArgs);
    });

    const updatedCategories = await Promise.all(updatePromises);

    return updatedCategories;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[updateCategories] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
