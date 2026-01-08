'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TCreateCategoryParams } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

export async function createCategory(params: TCreateCategoryParams) {
  const { status = 'PUBLIC', translations, imageUrl } = params;

  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to create a category');
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const category = await prisma.category.create({
      data: {
        status,
        userId,
        imageUrl,
        translations: {
          create: translations,
        },
      },
      include: {
        translations: true,
      },
    });

    return category;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[createCategory] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
