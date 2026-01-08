'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TDeleteCategoryParams } from '@/lib/zod-schemas';

export async function deleteCategory(params: TDeleteCategoryParams) {
  const { id } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to delete a category');
  }

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (existingCategory.userId !== userId && !isAdmin) {
      throw new Error('User is not authorized to delete this category');
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    return category;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[deleteCategory] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
