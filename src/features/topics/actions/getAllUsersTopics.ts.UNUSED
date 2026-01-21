'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';

import { TTopic } from '../types';

export async function getAllUsersTopics() {
  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const user = await getCurrentUser();
    const isAdmin = user?.role === 'ADMIN';
    if (!isAdmin) {
      throw new Error('Current user is not allowed to retrieve others topics.');
    }
    const include: Prisma.TopicInclude = {
      _count: { select: { questions: true } },
    };
    const topics: TTopic[] = await prisma.topic.findMany({
      // where: { userId },
      include,
    });
    return topics;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAllUsersTopics] catch', {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
