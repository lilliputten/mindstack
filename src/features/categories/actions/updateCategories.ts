'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { TUpdateCategoriesParams } from '../types';
import { deleteCategoryImage } from './deleteCategoryImage';

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
      select: { id: true, createdBy: true, imageUrl: true },
    } satisfies Prisma.CategoryFindManyArgs);

    const ownedCategoryIds = existingCategories
      .filter((cat) => cat.createdBy === userId || isAdmin)
      .map((cat) => cat.id);

    if (ownedCategoryIds.length !== categoryIds.length) {
      throw new Error('User is not authorized to update some categories');
    }

    // Create a map of existing category image URLs for quick lookup
    const existingCategoryMap = new Map(existingCategories.map((cat) => [cat.id, cat.imageUrl]));

    const updatePromises = updates.map(async (update) => {
      const { id, status, translations, imageUrl } = update;

      const updateData: Prisma.CategoryUpdateArgs['data'] = {};
      if (status !== undefined) {
        updateData.status = status;
      }

      // Check if imageUrl is being updated to a new value
      if (imageUrl !== undefined) {
        const existingImageUrl = existingCategoryMap.get(id);
        if (imageUrl !== existingImageUrl) {
          // If the existing imageUrl is not empty, delete the old image
          if (existingImageUrl) {
            await deleteCategoryImage(existingImageUrl);
          }
          updateData.imageUrl = imageUrl;
        }
      }

      // Set updatedBy field with current userId
      updateData.updatedBy = userId;

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
