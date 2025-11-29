'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { isDev } from '@/constants';
import { TAvailableTopic, TTopic } from '@/features/topics/types';

export async function updateTopic(topic: TTopic) {
  const user = await getCurrentUser();
  const userId = user?.id;
  // Prepare data to save...
  const data = { ...topic } as Partial<TAvailableTopic>;
  delete data.userId;
  delete data.user;
  delete data.userTopicWorkout;
  delete data.questions;
  delete data._count;
  delete data.createdAt;
  delete data.updatedAt;
  try {
    if (isDev) {
      // DEBUG: Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!userId) {
      throw new Error('Got undefined user');
    }
    if (!topic.name) {
      throw new Error('Not specified topic name');
    }
    /* NOTE: Ensure if the user exists (should be checked on the page load)
     * const isUserExists = await checkIfUserExists(userId);
     * if (!isUserExists) {
     *   throw new Error('The specified user does not exist.');
     * }
     */
    const where: Prisma.TopicWhereUniqueInput = { id: topic.id };
    // Do allow to save only own data if it's no admin user
    if (user.role !== 'ADMIN') {
      where.userId = userId;
    }
    const updatedTopic = await prisma.topic.update({
      where,
      data: data as TTopic,
    });
    return updatedTopic as TTopic;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateTopic] catch', {
      error,
      data,
      topic,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
