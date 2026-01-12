'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { TTopic, TTopicId } from '../types';

export async function getTopic(id: TTopicId) {
  // Check user rights to delete the question...?
  const user = await getCurrentUser();
  const userId = user?.id;
  // const isAdmin = user?.role === 'ADMIN';
  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const where: Prisma.TopicWhereUniqueInput = {
      id,
      /* // TODO: Restrict isPublic if it isn't an admin user?
       * isPublic: isAdmin ? null : false,
       */
    };
    const include: Prisma.TopicInclude = {
      _count: { select: { questions: true } },
    };
    const topic: TTopic | undefined =
      (await prisma.topic.findUnique({
        where,
        include,
      })) || undefined;
    if (!topic) {
      throw new Error('No topic found');
    }
    // Check if the current user is allowed to see the topic?
    if (!topic.isPublic && userId !== topic?.userId && user?.role !== 'ADMIN') {
      throw new Error('Current user is not allowed to access the topic');
    }
    return topic;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getTopic] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
