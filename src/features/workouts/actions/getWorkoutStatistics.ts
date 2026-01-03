'use server';

import { WorkoutStats } from '@/generated/prisma';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function getWorkoutStatistics(topicId: string) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Authentication required');
  }

  const stats = await prisma.workoutStats.findMany({
    where: {
      userId: user.id,
      topicId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!stats.length) {
    return {
      totalRounds: 0,
      averageRatio: 0,
      averageTime: 0,
      bestRatio: 0,
      fastestTime: 0,
      recentStats: [] as WorkoutStats[],
    };
  }

  const totalRounds = stats.length;
  const averageRatio = Math.round(stats.reduce((sum, s) => sum + s.ratio, 0) / totalRounds);
  const averageTime = Math.round(stats.reduce((sum, s) => sum + s.timeSeconds, 0) / totalRounds);
  const bestRatio = Math.max(...stats.map((s) => s.ratio));
  const fastestTime = Math.min(...stats.map((s) => s.timeSeconds));

  return {
    totalRounds,
    averageRatio,
    averageTime,
    bestRatio,
    fastestTime,
    recentStats: stats.slice(0, 10) as WorkoutStats[], // Last 10 rounds
  };
}

export async function getAllWorkoutStatistics(userId?: string) {
  const user = await getCurrentUser();
  const targetUserId = userId || user?.id;

  if (!targetUserId) {
    throw new Error('Authentication required');
  }

  const stats = await prisma.workoutStats.findMany({
    where: {
      userId: targetUserId,
    },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return stats;
}
