'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { ContentLimitError } from '@/lib/errors/ContentLimitError';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { TAvailableTopic, TNewTopic } from '@/features/topics/types';
import {
  checkTopicsLimit,
  TContentLimitStatus,
} from '@/features/users/services/checkContentLimits';

interface TOptions {
  noDebug?: boolean;
}

// TODO: Reuse the params from `getAvailableTopics` (`TGetAvailableTopicsParams`)

export async function addNewTopic(params: TNewTopic & TOptions) {
  const { noDebug, ...newTopic } = params;
  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = user?.role === 'ADMIN';
  let topicsLimit: TContentLimitStatus | undefined;
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
    topicsLimit = await checkTopicsLimit();
    if (!topicsLimit.canCreate && !isAdmin) {
      throw new ContentLimitError('TOPICS_LIMIT_REACHED', topicsLimit.reasonCode, user?.grade);
    }

    /* NOTE: Ensure if the user exists (should be checked on the page load)
     * const isUserExists = await checkIfUserExists(userId);
     * if (!isUserExists) {
     *   throw new Error('The specified user does not exist.');
     * }
     */
    const data: Prisma.TopicCreateArgs['data'] = { ...topicData, userId };

    const include: Prisma.TopicInclude = {
      _count: { select: { questions: true } },
    };

    // Link categories if provided using Prisma's nested write
    if (categoryIds?.length) {
      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      };
      include.categories = true;
    }

    const addedTopic = await prisma.topic.create({
      data,
      include,
    });

    const topic = addedTopic as TAvailableTopic;

    if (topic.categories) {
      topic.categoryIds = topic.categories.map(({ id }) => id);
    }

    return topic;
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.error('[addNewTopic] catch', {
        error,
        topicsLimit,
        user,
        params,
      });
      debugger; // eslint-disable-line no-debugger
    }
    throw error;
  }
}
