'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TUpdateCategoryParams } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

export async function updateCategory(params: TUpdateCategoryParams) {
  const { id, status, translations, imageUrl } = params;

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
      select: { userId: true },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (existingCategory.userId !== userId && !isAdmin) {
      throw new Error('User is not authorized to update this category');
    }

    const updateData: {
      status?: 'PUBLIC' | 'SUGGESTED' | 'HIDDEN';
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
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (translations) {
      updateData.translations = {
        upsert: translations.map((translation) => ({
          where: { categoryId_locale: { categoryId: id, locale: translation.locale } },
          update: {
            name: translation.name,
            description: translation.description,
            keywords: translation.keywords,
          },
          create: {
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
            keywords: translation.keywords,
          },
        })),
      };
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
      },
    });

    return category;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateCategory] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
