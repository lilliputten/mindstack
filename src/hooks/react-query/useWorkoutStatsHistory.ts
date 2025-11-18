'use client';

import { useQuery } from '@tanstack/react-query';

import { ServerAuthError } from '@/lib/errors';
import { getErrorText, isErrorInstance } from '@/lib/helpers';
import { isDev } from '@/config';
import { dayMs, minuteMs } from '@/constants';
import { TTopicId } from '@/features/topics/types';
import { getWorkoutStatsHistory } from '@/features/workout-stats/actions/getWorkoutStatsHistory';
import { WorkoutStats } from '@/generated/prisma';

import { useSessionUser } from '../useSessionUser';

const recentWorkoutsCount = isDev ? 5 : 5;
const olderWorkoutsCount = recentWorkoutsCount * 2;

interface TWorkoutStatsHistoryData {
  totalWorkouts: number;
  averageAccuracy: number;
  bestAccuracy: number;
  worstAccuracy: number;
  averageTime: number;
  fastestTime: number;
  slowestTime: number;
  totalTimeSpent: number;
  streak: number;
  lastWorkout: Date | null;
  recentWorkouts: Array<{
    id: string;
    accuracy: number;
    timeSeconds: number;
    questionsCount: number;
    createdAt: Date;
  }>;
  accuracyTrend: 'improving' | 'declining' | 'stable';
  speedTrend: 'improving' | 'declining' | 'stable';
  consistencyScore: number;
}

export function useWorkoutStatsHistory(topicId?: TTopicId) {
  const user = useSessionUser();
  const userId = user?.id;
  const query = useQuery({
    // Use user id just as an anti-cache agent
    queryKey: ['workout-stats-history', topicId, userId],
    queryFn: async () => {
      if (!topicId || !userId) {
        return null;
      }
      let workoutStats: WorkoutStats[] | null = null;
      try {
        workoutStats = await getWorkoutStatsHistory(topicId);
      } catch (error) {
        const errMsg = getErrorText(error);
        const isServerAuthError = isErrorInstance(error, ServerAuthError);
        const isUnathorizedError =
          isServerAuthError && (error as ServerAuthError).message === 'UNATHORIZED';
        if (isUnathorizedError) {
          // eslint-disable-next-line no-console
          console.warn('[useWorkoutStatsHistory]', error);
          return null;
        }
        // eslint-disable-next-line no-console
        console.error('[useWorkoutStatsHistory]', {
          isServerAuthError,
          ServerAuthError,
          errMsg,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        throw error;
      }

      if (!workoutStats?.length) {
        return null;
      }

      // Calculate basic metrics
      const totalWorkouts = workoutStats.length;
      const accuracies = workoutStats.map((stat) => stat.ratio);
      const times = workoutStats.map((stat) => stat.timeSeconds);

      const averageAccuracy = Math.round(
        accuracies.reduce((sum, acc) => sum + acc, 0) / totalWorkouts,
      );
      const bestAccuracy = Math.max(...accuracies);
      const worstAccuracy = Math.min(...accuracies);

      const averageTime = Math.round(times.reduce((sum, time) => sum + time, 0) / totalWorkouts);
      const fastestTime = Math.min(...times);
      const slowestTime = Math.max(...times);
      const totalTimeSpent = times.reduce((sum, time) => sum + time, 0);

      // Calculate streak (consecutive days with workouts)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < workoutStats.length; i++) {
        const workoutDate = new Date(workoutStats[i].createdAt);
        workoutDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / dayMs);
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }

      // Get last workout date
      const lastWorkout = workoutStats[0]?.createdAt || null;

      const recentWorkoutStats = workoutStats.slice(0, recentWorkoutsCount);
      const olderWorkoutStats = workoutStats.slice(recentWorkoutsCount, olderWorkoutsCount);

      // Prepare recent workouts data
      const recentWorkouts = recentWorkoutStats.map((stat) => ({
        id: stat.id,
        accuracy: stat.ratio,
        timeSeconds: stat.timeSeconds,
        questionsCount: stat.totalQuestions,
        createdAt: stat.createdAt,
      }));

      // Calculate trends
      const recentAccuracies = recentWorkoutStats.map((stat) => stat.ratio);
      const olderAccuracies = olderWorkoutStats.map((stat) => stat.ratio);

      let accuracyTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAccuracies.length >= 3 && olderAccuracies.length >= 3) {
        const recentAvg =
          recentAccuracies.reduce((sum, acc) => sum + acc, 0) / recentAccuracies.length;
        const olderAvg =
          olderAccuracies.reduce((sum, acc) => sum + acc, 0) / olderAccuracies.length;
        if (recentAvg > olderAvg + 5) accuracyTrend = 'improving';
        else if (recentAvg < olderAvg - 5) accuracyTrend = 'declining';
      }

      const recentTimes = recentWorkoutStats.map((stat) => stat.timeSeconds);
      const olderTimes = olderWorkoutStats.map((stat) => stat.timeSeconds);

      let speedTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentTimes.length >= 3 && olderTimes.length >= 3) {
        const recentAvg = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
        const olderAvg = olderTimes.reduce((sum, time) => sum + time, 0) / olderTimes.length;

        if (recentAvg < olderAvg - 30)
          speedTrend = 'improving'; // Faster (lower time)
        else if (recentAvg > olderAvg + 30) speedTrend = 'declining'; // Slower (higher time)
      }

      // Calculate consistency score (lower standard deviation = higher consistency)
      const accuracyStdDev = Math.sqrt(
        accuracies.reduce((sum, acc) => sum + Math.pow(acc - averageAccuracy, 2), 0) /
          totalWorkouts,
      );
      const consistencyScore = Math.max(0, Math.round(100 - accuracyStdDev));

      return {
        totalWorkouts,
        averageAccuracy,
        bestAccuracy,
        worstAccuracy,
        averageTime,
        fastestTime,
        slowestTime,
        totalTimeSpent,
        streak,
        lastWorkout,
        recentWorkouts,
        accuracyTrend,
        speedTrend,
        consistencyScore,
      } as TWorkoutStatsHistoryData;
    },
    enabled: !!topicId,
    staleTime: 5 * minuteMs, // 5 minutes
  });

  return query;
}
