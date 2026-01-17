'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

export interface TGetMostRecentSuggestedCategoryParams {
  /** Optional time period to check for suggested categories */
  minCreatedAt?: Date;
  maxCreatedAt?: Date;
}

export async function getMostRecentSuggestedCategory(
  params: TGetMostRecentSuggestedCategoryParams = {},
) {
  const { minCreatedAt, maxCreatedAt } = params;

  const user = await getCurrentUser();

  // Return empty data for unauthorized users
  if (!user?.id) {
    return null;
  }

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const where: Prisma.CategoryWhereInput = {
      createdBy: user.id,
      status: 'SUGGESTED',
    };

    // Add time period filtering if provided
    if (minCreatedAt || maxCreatedAt) {
      where.createdAt = {};
      if (minCreatedAt) where.createdAt.gte = minCreatedAt;
      if (maxCreatedAt) where.createdAt.lte = maxCreatedAt;
    }

    const category = await prisma.category.findFirst({
      where,
      include: {
        translations: true,
        _count: {
          select: { topics: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return category;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getMostRecentSuggestedCategory] catch', { error });
    throw error;
  }
}
