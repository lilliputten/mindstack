'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TGetCategoryByIdParams } from '@/lib/zod-schemas';
import { isDev } from '@/constants';

import { IncludedUserSelect } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getCategoryById(params: TGetCategoryByIdParams & TOptions) {
  const { id, includeUser = false } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const where: Prisma.CategoryWhereUniqueInput = { id };
    const include: Prisma.CategoryInclude = {};

    if (includeUser) {
      include.user = { select: IncludedUserSelect };
    }

    const category = await prisma.category.findUnique({
      where,
      include,
    });

    if (!category) {
      throw new Error('No category found');
    }

    if (category.status !== 'PUBLIC' && userId !== category.userId && !isAdmin) {
      throw new Error('Current user is not allowed to access the category');
    }

    return category;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getCategoryById] catch', { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
