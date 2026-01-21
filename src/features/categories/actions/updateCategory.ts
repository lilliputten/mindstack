'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { TUpdateCategoryParams } from '../types';
import { deleteCategoryImage } from './deleteCategoryImage';

interface TOptions {
  noDebug?: boolean;
}

export async function updateCategory(params: TUpdateCategoryParams & TOptions) {
  const { id, status, translations, imageUrl, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to update a category');
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { createdBy: true, imageUrl: true },
    } satisfies Prisma.CategoryFindUniqueArgs);

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (existingCategory.createdBy !== userId && !isAdmin) {
      throw new Error('User is not authorized to update this category');
    }

    const updateData: Prisma.CategoryUpdateArgs['data'] = {};
    if (status !== undefined) updateData.status = status;

    // Check if imageUrl is being updated to a new value
    if (imageUrl !== undefined && imageUrl !== existingCategory.imageUrl) {
      // If the existing imageUrl is not empty, delete the old image
      if (existingCategory.imageUrl) {
        await deleteCategoryImage(existingCategory.imageUrl);
      }
      updateData.imageUrl = imageUrl;
    }

    // Set updatedBy field with current userId
    updateData.updatedBy = userId;

    if (translations) {
      updateData.translations = {
        upsert: translations.map((translation) => ({
          where: {
            categoryId_locale: { categoryId: id, locale: translation.locale },
          }, // satisfies Prisma.CategoryTranslationWhereUniqueInput, // CategoryTranslationUpdateManyWithoutCategoryNestedInput['where'],
          update: {
            name: translation.name,
            description: translation.description ?? null,
            keywords: translation.keywords ?? null,
          }, // satisfies Prisma.CategoryTranslationUpdateWithoutCategoryInput, // Prisma.CategoryTranslationUpdateManyWithoutCategoryNestedInput['update'],
          create: {
            locale: translation.locale,
            name: translation.name ?? '',
            description: translation.description ?? null,
            keywords: translation.keywords ?? null,
          }, // satisfies Prisma.CategoryTranslationUpdateManyWithoutCategoryNestedInput['create'],
        })), // satisfies Prisma.TopicUpsertWithWhereUniqueWithoutCategoryInput)),
      } satisfies Prisma.CategoryTranslationUpdateManyWithoutCategoryNestedInput;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData satisfies Prisma.CategoryUpdateArgs['data'],
      include: {
        translations: true,
      } satisfies Prisma.CategoryUpdateArgs['include'],
    } satisfies Prisma.CategoryUpdateArgs);

    return category;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[updateCategory] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
