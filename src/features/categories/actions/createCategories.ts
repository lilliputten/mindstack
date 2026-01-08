'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TCreateCategoriesParams } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

export async function createCategories(params: TCreateCategoriesParams) {
  const { categories } = params;

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
          status: categoryData.status || 'PUBLIC',
          userId,
          imageUrl: categoryData.imageUrl,
          translations: {
            create: categoryData.translations,
          },
        },
        include: {
          translations: true,
        },
      });
      createdCategoriesWithTranslations.push(createdCategory);
    }

    return createdCategoriesWithTranslations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[createCategories] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
