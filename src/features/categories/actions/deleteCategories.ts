'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TDeleteCategoriesParams } from '@/lib/zod-schemas';

export async function deleteCategories(params: TDeleteCategoriesParams) {
  const { ids } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (!userId) {
    throw new Error('User must be authenticated to delete categories');
  }

  if (ids.length === 0) {
    throw new Error('No category IDs provided');
  }

  try {
    // Check if user has permission to delete all the categories
    if (!isAdmin) {
      const userCategories = await prisma.category.findMany({
        where: {
          id: { in: ids },
          userId,
        },
        select: { id: true },
      });

      const userCategoryIds = userCategories.map((c) => c.id);
      const unauthorizedIds = ids.filter((id) => !userCategoryIds.includes(id));

      if (unauthorizedIds.length > 0) {
        throw new Error(
          `User is not authorized to delete categories: ${unauthorizedIds.join(', ')}`,
        );
      }
    }

    const deleteResult = await prisma.category.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return { count: deleteResult.count };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[deleteCategories] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
