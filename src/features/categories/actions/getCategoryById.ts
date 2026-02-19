'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { defaultCategoryStatus, TGetCategoryByIdParams } from '../types';

interface TOptions {
  noDebug?: boolean;
}

export async function getCategoryById(params: TGetCategoryByIdParams & TOptions) {
  const { id, noDebug, includeTranslations = true, includeTopicsCount = true } = params;

  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const where: Prisma.CategoryWhereUniqueInput = { id };
    const include: Prisma.CategoryInclude = {};

    if (includeTranslations) {
      include.translations = true;
    }
    // Always include translations for the current locale and topics count
    if (includeTopicsCount) {
      include._count = { select: { topics: { where: { isPublic: true } } } };
    }

    const category = await prisma.category.findUnique({
      where,
      include,
    });

    if (!category) {
      throw new Error('No category found');
    }

    if (category.status !== defaultCategoryStatus && userId !== category.createdBy && !isAdmin) {
      throw new Error('Current user is not allowed to access the category');
    }

    return category;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[getCategoryById] catch', { error });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
