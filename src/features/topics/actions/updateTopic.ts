'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { IncludedCategorySelect, TAvailableTopic } from '@/features/topics/types';

import { TUpdateTopicParams } from '../types/TUpdateTopicData';

export async function updateTopic(topic: TUpdateTopicParams) {
  const { categoryIds, ...data } = topic;

  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error('Unauthorized user');
  }
  if (!topic?.id) {
    throw new Error('Not specified topic ID');
  }
  // We expect semi-filled data, not only update
  if (!topic.name) {
    throw new Error('Not specified topic name');
  }

  const include: Prisma.TopicInclude = {
    // TODO: See example of constructing `include` data in the `src/features/topics/actions/getAvailableTopicById.ts`
    categories: { select: IncludedCategorySelect },
  };

  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const where: Prisma.TopicWhereUniqueInput = { id: topic.id };
    // Do allow to save only own data if it's no admin user
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    }
    // Handle categories relationship update if categoryIds are provided
    if (categoryIds && !data.categories) {
      data.categories = {
        set: categoryIds.map((id) => ({ id })),
      };
    }

    const result = await prisma.topic.update({
      where,
      data,
      include,
    });

    const updatedTopic = result as TAvailableTopic;

    if (updatedTopic?.categories?.length) {
      updatedTopic.categoryIds = updatedTopic.categories.map(({ id }) => id);
    }

    return updatedTopic as TAvailableTopic; // TTopic
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateTopic] catch', {
      error,
      data,
      categoryIds,
      topic,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
