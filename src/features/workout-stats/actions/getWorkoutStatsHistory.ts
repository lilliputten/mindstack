'use server';

import { prisma } from '@/lib/db';
import { ServerAuthError } from '@/lib/errors';
import { getCurrentUser } from '@/lib/session';
import { WorkoutStats } from '@/generated/prisma';

export async function getWorkoutStatsHistory(topicId: string): Promise<WorkoutStats[]> {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new ServerAuthError('UNATHORIZED');
  }

  const workoutStats = await prisma.workoutStats.findMany({
    where: {
      userId: user.id,
      topicId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return workoutStats;
}
