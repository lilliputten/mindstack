'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { defaultCategoryStatus, TCreateCategoryParams } from '../types/Categories';

interface TOptions {
  noDebug?: boolean;
}

type TArgType = Parameters<typeof prisma.category.create>[0];

export async function createCategory(params: TCreateCategoryParams & TOptions) {
  const { status = defaultCategoryStatus, translations, imageUrl, noDebug } = params;

  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to create a category');
  }

  let data: TArgType['data'] | undefined;
  let include: TArgType['include'] | undefined;
  try {
    if (isDev) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    data = {
      createdBy: userId,
      status,
      imageUrl,
      translations: {
        create: translations,
      },
    };
    include = {
      translations: true,
    } satisfies Prisma.CategoryCreateArgs['include'];

    const category = await prisma.category.create({
      data,
      include,
    } satisfies TArgType);

    return category;
  } catch (error) {
    if (!noDebug) {
      const details = getErrorText(error);
      // eslint-disable-next-line no-console
      console.error('[createCategory] catch', details, {
        error,
        data,
        include,
        status,
        translations,
        imageUrl,
        params,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
