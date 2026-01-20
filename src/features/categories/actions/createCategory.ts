'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { debugObj } from '@/lib/debug';
import { getErrorText, translatedPeriod } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { appId, versionInfo } from '@/config';
import { isDev } from '@/constants';
import { sendLoggingMessage } from '@/features/bot/actions/sendLoggingMessage';
import { allowSuggestCategoriesIn } from '@/features/categories/constants';
import { getUserById } from '@/features/users/actions';

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

  // Check rate limiting for suggested categories
  if (status === 'SUGGESTED') {
    const recentSuggestedCategory = await prisma.category.findFirst({
      where: {
        createdBy: userId,
        status: 'SUGGESTED',
        createdAt: {
          gte: new Date(Date.now() - allowSuggestCategoriesIn),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentSuggestedCategory) {
      throw new Error(
        `You can only suggest one category every ${translatedPeriod(allowSuggestCategoriesIn)}. Please wait before suggesting another category.`,
      );
    }
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

    // Send logging message
    const creator = category.createdBy && (await getUserById(category.createdBy));
    const debugStr = debugObj({
      category,
      creator,
      versionInfo,
    });
    await sendLoggingMessage(`[${appId}:createCategory]\n${debugStr}`);

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
