'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { TNewTopic, TTopic } from '@/features/topics/types';
import { checkTopicsLimit } from '@/features/users/services/checkContentLimits';

interface TOptions {
  noDebug?: boolean;
}

export async function addNewTopic(params: TNewTopic & TOptions) {
  const { noDebug, ...newTopic } = params;
  const user = await getCurrentUser();
  const userId = user?.id;
  try {
    const { categoryIds, ...topicData } = newTopic;
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!userId) {
      throw new ContentLimitError('UNAUTHORIZED', 'User not authenticated');
    }
    if (!newTopic.name) {
      throw new Error('Not specified topic name');
    }

    // Check topics limit before creating
    const topicsLimit = await checkTopicsLimit();
    if (!topicsLimit.canCreate) {
      throw new ContentLimitError('TOPICS_LIMIT_REACHED', topicsLimit.reasonCode, user?.grade);
    }

    /* NOTE: Ensure if the user exists (should be checked on the page load)
     * const isUserExists = await checkIfUserExists(userId);
     * if (!isUserExists) {
     *   throw new Error('The specified user does not exist.');
     * }
     */
    const data: Prisma.TopicCreateArgs['data'] = { ...topicData, userId };

    // Link categories if provided using Prisma's nested write
    if (categoryIds?.length) {
      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      };
    }

    const addedTopic = await prisma.topic.create({
      data,
    });

    return addedTopic as TTopic;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[addNewTopic] catch', {
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
