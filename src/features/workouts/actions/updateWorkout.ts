'use server';

import { z } from 'zod';

import { UserTopicWorkoutSchema } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const updateWorkoutSchema = UserTopicWorkoutSchema.omit({
  userId: true,
  topicId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

type UpdateWorkoutData = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkout(topicId: string, data: UpdateWorkoutData) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('Authentication required');
    }

    const updateData = updateWorkoutSchema.parse(data);

    const workout = await prisma.userTopicWorkout.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        topicId,
        ...updateData,
      },
    });

    return workout;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateWorkout] catch', {
      error,
      topicId,
      data,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
