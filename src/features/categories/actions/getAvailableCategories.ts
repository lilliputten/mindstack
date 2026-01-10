'use server';

import { ExtendedUser } from '@/@types/next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import {
  defaultCategoryStatus,
  TGetAvailableCategoriesParams,
  TGetAvailableCategoriesResults,
} from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getAvailableCategories(
  params: TGetAvailableCategoriesParams & TOptions = {},
): Promise<TGetAvailableCategoriesResults> {
  const {
    categoryIds,
    skip,
    take,
    orderBy = { updatedAt: 'desc' },
    includeTranslations = true,
    searchText,
    status,
    minCreatedAt,
    maxCreatedAt,
    minUpdatedAt,
    maxUpdatedAt,
    noDebug,
  } = params;

  if (isDev) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const user: ExtendedUser | undefined = await getCurrentUser();
  const userId = user?.id;

  // TODO: Throw an error if the user is not admin and status is not default (not public)

  const include: Prisma.CategoryInclude = {};
  const where: Prisma.CategoryWhereInput = {};
  const findManyArgs: Prisma.CategoryFindManyArgs = {
    skip,
    take,
    orderBy: orderBy as Prisma.CategoryOrderByWithRelationInput,
    where,
    include,
  };

  try {
    // Always include translations for the current locale and topics count
    if (includeTranslations) {
      include.translations = true;
    }
    include._count = { select: { topics: true } };

    /* // ???
     * if (!userId) {
     *   where.status = defaultCategoryStatus;
     * } else {
     *   where.OR = [{ createdBy: userId }, { status }];
     * }
     */

    if (categoryIds) {
      where.id = { in: categoryIds };
    }

    if (searchText) {
      const searchConditions: Prisma.CategoryWhereInput[] = [
        { translations: { some: { name: { contains: searchText, mode: 'insensitive' } } } },
        { translations: { some: { description: { contains: searchText, mode: 'insensitive' } } } },
        { translations: { some: { keywords: { contains: searchText, mode: 'insensitive' } } } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    where.status = userId && status ? status : defaultCategoryStatus;

    if (minCreatedAt !== undefined || maxCreatedAt !== undefined) {
      where.createdAt = {};
      if (minCreatedAt) where.createdAt.gte = minCreatedAt;
      if (maxCreatedAt) where.createdAt.lte = maxCreatedAt;
    }

    if (minUpdatedAt !== undefined || maxUpdatedAt !== undefined) {
      where.updatedAt = {};
      if (minUpdatedAt) where.updatedAt.gte = minUpdatedAt;
      if (maxUpdatedAt) where.updatedAt.lte = maxUpdatedAt;
    }
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableCategories] Error preparing data', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }

  try {
    const [items, totalCount] = await prisma.$transaction([
      prisma.category.findMany(findManyArgs),
      prisma.category.count({ where }),
    ]);
    return { items, totalCount } as TGetAvailableCategoriesResults;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getAvailableCategories] Error retrieving data', {
        error,
        findManyArgs,
        where,
        include,
        orderBy,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
