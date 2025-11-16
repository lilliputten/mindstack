'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { welcomeRoute } from '@/config/routesConfig';
import { getErrorText } from '@/lib/helpers';
import { formatSecondsDuration, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { useWorkoutStatsHistory } from '@/hooks/react-query/useWorkoutStatsHistory';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useSessionData } from '@/hooks';
import { Link } from '@/i18n/routing';

interface TWorkoutStatsProps {
  className?: string;
  full?: boolean;
  hideTimes?: boolean;
}

export function WorkoutStats(props: TWorkoutStatsProps) {
  const { className, full, hideTimes } = props;
  const format = useFormatter();

  const { user, loading: isUserLoading } = useSessionData();

  const workoutContext = useWorkoutContext();
  const { workout, questionIds, pending: isWorkoutPending, topicId } = workoutContext;

  // Fetch historical data
  const workoutStatsHistoryQuery = useWorkoutStatsHistory(topicId);
  const {
    data: historicalData,
    isLoading: isHistoricalLoading,
    // isFetched: isHistoricalFetched,
    error: historicalError,
  } = workoutStatsHistoryQuery;

  const historicalErrorText = historicalError && getErrorText(historicalError);

  const questionsCount = questionIds?.length || 0;
  const isWorkoutInProgress = workout?.started && !workout?.finished;
  const isWorkoutCompleted = workout?.finished;

  // Calculate current workout statistics
  const currentProgress = workout?.stepIndex ? (workout.stepIndex / questionsCount) * 100 : 0;
  const currentAccuracy =
    workout?.stepIndex && workout?.correctAnswers
      ? (workout.correctAnswers / (workout.stepIndex + 1)) * 100
      : 0;
  const timeElapsed = workout?.startedAt
    ? Math.round((new Date().getTime() - workout.startedAt.getTime()) / 1000)
    : 0;
  const averageTimePerQuestion =
    workout?.stepIndex && timeElapsed > 0 ? Math.round(timeElapsed / (workout.stepIndex + 1)) : 0;

  // TODO?
  const _estimatedTimeRemaining =
    averageTimePerQuestion > 0 && questionsCount > 0
      ? Math.round(averageTimePerQuestion * (questionsCount - (workout?.stepIndex || 0) - 1))
      : 0;

  // Use real historical data
  const historicalStats = historicalData || {
    totalWorkouts: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    worstAccuracy: 0,
    averageTime: 0,
    fastestTime: 0,
    slowestTime: 0,
    totalTimeSpent: 0,
    streak: 0,
    lastWorkout: null,
    recentWorkouts: [],
    accuracyTrend: 'stable' as const,
    speedTrend: 'stable' as const,
    consistencyScore: 0,
  };

  const totalWorkouts = historicalStats.totalWorkouts;
  const recentWorkouts = historicalStats.recentWorkouts;
  const hasMoreWorkouts = totalWorkouts !== recentWorkouts.length;

  if (isWorkoutPending || isHistoricalLoading) {
    return (
      <div
        className={cn(
          isDev && '__WorkoutStats_Skeleton', // DEBUG
          'space-y-4',
          className,
        )}
      >
        {isDev && (
          <p className="opacity-50">
            __WorkoutStats_Skeleton {isWorkoutPending && 'isWorkoutPending'}{' '}
            {isHistoricalLoading && 'isHistoricalLoading'}
          </p>
        )}
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!workout && !full) {
    return null;
  }

  if (historicalErrorText) {
    // TODO: Display statistics based on the recent local data?
    return (
      <div
        className={cn(
          isDev && '__WorkoutStats_Error', // DEBUG
          'space-y-4',
          className,
        )}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.Warning className="mx-auto mb-2 size-8 text-orange-500 opacity-50" />
              <p className="text-content text-sm text-muted-foreground">
                {historicalErrorText === 'Authentication required' ? (
                  <>
                    You have to <Link href={welcomeRoute}>sign in</Link> to view your statistics.
                  </>
                ) : (
                  <>
                    Failed to load historical data ({historicalErrorText}). Please try again later.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCurrentWorkoutStats = () => {
    if (!workout) {
      // Show historical summary when no current workout but there's history
      if (totalWorkouts > 0) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Activity className="size-4 text-theme" />
                Your Progress
              </CardTitle>
              <CardDescription>
                Summary of your {totalWorkouts} completed workout
                {totalWorkouts !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Best Accuracy</p>
                  <p className="text-2xl font-bold">{historicalStats.bestAccuracy}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Average Time</p>
                  <p className="text-2xl font-bold">
                    {formatSecondsDuration(historicalStats.averageTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CircleCheck className="size-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {historicalStats.streak > 0
                    ? `On a ${historicalStats.streak}-day streak`
                    : 'Ready for your next workout'}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      }
      return null;
    }

    return (
      <Card
        className={cn(
          isDev && '__WorkoutStats_Card', // DEBUG
          'space-y-4',
          className,
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Icons.Activity className="size-4 text-theme" />
            Recent Training
          </CardTitle>
          {/*
          <CardDescription>
            {isWorkoutInProgress
              ? 'Training in progress'
              : isWorkoutCompleted
                ? 'Training completed'
                : 'No active training'}
          </CardDescription>
          */}
        </CardHeader>
        <CardContent className="space-y-4">
          {isWorkoutInProgress && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {workout.stepIndex || 0} / {questionsCount}
                  </span>
                </div>
                <Progress
                  value={currentProgress}
                  className="h-2 bg-theme-500/20 transition"
                  indicatorClassName="bg-secondary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Current Accuracy</p>
                  <p className="text-2xl font-bold">{Math.round(currentAccuracy)}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Time Elapsed</p>
                  <p className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatSecondsDuration(timeElapsed)}</span>
                    {isWorkoutInProgress && <span className="opacity-50">(active)</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                  <p className="text-lg font-semibold">{workout.correctAnswers || 0}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Avg Time/Question</p>
                  <p className="text-lg font-semibold">
                    {formatSecondsDuration(averageTimePerQuestion)}
                  </p>
                </div>
              </div>
            </>
          )}

          {isWorkoutCompleted && (
            <div
              className={cn(
                isDev && '__WorkoutStats_CompletedInfo', // DEBUG
                'space-y-4',
              )}
            >
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Final Accuracy</p>
                  <p className="text-2xl font-bold">{workout.currentRatio || 0}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">
                    {formatSecondsDuration(workout.currentTime || 0)}
                  </p>
                </div>
              </div>
              {!hideTimes && (
                <div className="flex items-center gap-2">
                  <Icons.CircleCheck className="size-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    Completed {getFormattedRelativeDate(format, workout.finishedAt || new Date())}
                  </span>
                </div>
              )}
            </div>
          )}

          {isUserLoading || isWorkoutPending ? (
            <div
              className={cn(
                isDev && '__WorkoutStats_NotStarted_Skelton', // DEBUG
                'flex flex-col items-center gap-4 py-4',
              )}
            >
              <Skeleton className="size-8 !rounded-full" />
              <Skeleton className="h-6 w-1/3 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ) : !workout?.started ? (
            !totalWorkouts || totalWorkouts < 1 ? (
              <div className="py-4 text-center">
                <Icons.Activity className="mx-auto mb-2 size-8 text-theme" />
                <p className="mb-2 text-lg text-foreground">
                  {user
                    ? 'No training history has been collected yet'
                    : "Guest users can't see their training history"}
                </p>
                {!totalWorkouts ? (
                  <p className="text-sm text-muted-foreground">
                    {user
                      ? 'This will be your first workout for this topic!'
                      : 'Sign in to start collecting and monitoring your history tracks.'}
                  </p>
                ) : totalWorkouts === 1 ? (
                  <p className="text-sm text-muted-foreground">
                    There is only one history record now.
                  </p>
                ) : null}
              </div>
            ) : null
          ) : null}
        </CardContent>
      </Card>
    );
  };

  const renderHistoricalStats = () => {
    if (!full) return null;

    // Show empty state when no historical data
    if (totalWorkouts === 0) {
      return (
        <Card
          className={cn(
            isDev && '__WorkoutStats_HistoricalStats_NoTotal', // DEBUG
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.LineChart className="size-4 text-theme" />
              Historical Performance
            </CardTitle>
            <CardDescription>Your learning progress over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="__py-8 text-center">
              <Icons.Activity className="mx-auto mb-4 size-8 text-theme" />
              <h3 className="mb-2 text-lg font-semibold">No Training History Yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Complete your first workout to start tracking your progress and see detailed
                analytics.
              </p>
              <div className="rounded-lg bg-muted/50 py-4 text-center">
                <h4 className="mb-2 text-sm font-medium">
                  What you'll see after your first workout:
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>Performance trends and accuracy tracking</li>
                  <li>Study streaks and consistency metrics</li>
                  <li>Personalized learning insights</li>
                  <li>Achievement badges and progress milestones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          isDev && '__WorkoutStats__HistoricalStats_WithTotal', // DEBUG
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.LineChart className="size-4 text-theme" />
            Historical Performance
          </CardTitle>
          <CardDescription>Your learning progress over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div
            className={cn(
              isDev && '__WorkoutStats_KeyMetrics', // DEBUG
              'flex flex-col gap-4 sm:grid sm:grid-cols-2 md:grid-cols-4',
            )}
          >
            <div className="space-y-1 text-center">
              <p className="text-2xl font-bold">{totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total Trainings</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-bold">{historicalStats.averageAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-bold">
                {formatSecondsDuration(historicalStats.averageTime)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Time</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-bold">{historicalStats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>

          {/* Performance Badges */}
          <div
            className={cn(
              isDev && '__WorkoutStats_PerformanceBadges', // DEBUG
              'space-y-2',
            )}
          >
            <h4 className="font-semibold">Achievements</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" className="flex items-center gap-1">
                <Icons.CircleCheck className="size-3" />
                Speed Master
              </Badge>
              <Badge variant="success" className="flex items-center gap-1">
                <Icons.CircleCheck className="size-3" />
                Accuracy Expert
              </Badge>
              <Badge variant="default" className="flex items-center gap-1">
                <Icons.Activity className="size-3" />
                Consistency Champion
              </Badge>
            </div>
          </div>

          {/* Performance Table */}
          {!!totalWorkouts && (
            <div
              className={cn(
                isDev && '__WorkoutStats_PerformanceTable', // DEBUG
                'space-y-2',
              )}
            >
              <h4 className="font-semibold">Recent Performance</h4>
              {hasMoreWorkouts && (
                <p className="text-sm opacity-50">
                  Displaying {recentWorkouts.length} last results out of total {totalWorkouts}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead id="Date">Date</TableHead>
                    <TableHead id="Accuracy" className="truncate text-center">
                      Accuracy
                    </TableHead>
                    <TableHead id="Time" className="truncate text-right max-md:hidden">
                      Time
                    </TableHead>
                    {/* <TableHead>Questions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentWorkouts.length > 0 ? (
                    recentWorkouts.map((workout) => (
                      <TableRow key={workout.id}>
                        <TableCell id="Date">
                          {getFormattedRelativeDate(format, workout.createdAt)}
                        </TableCell>
                        <TableCell id="Accuracy" className="truncate text-center">
                          <Badge
                            variant={
                              workout.accuracy >= 70
                                ? 'success'
                                : workout.accuracy >= 30
                                  ? 'default'
                                  : 'destructive'
                            }
                          >
                            {workout.accuracy}%
                          </Badge>
                        </TableCell>
                        <TableCell id="Time" className="truncate text-right max-md:hidden">
                          {formatSecondsDuration(workout.timeSeconds)}
                        </TableCell>
                        {/* <TableCell>{workout.questionsCount}</TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No workout history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Learning Insights */}
          <div
            className={cn(
              isDev && '__WorkoutStats_LearningInsights', // DEBUG
              'space-y-4',
            )}
          >
            <h4 className="font-semibold">Learning Insights</h4>
            {/* // TODO: Determine the amount of the insight items and limit grid count to the maximum */}
            <div
              className={cn(
                isDev && '__WorkoutStats_LearningInsights_Blocks', // DEBUG
                'grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
              )}
            >
              {historicalStats.speedTrend === 'improving' && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icons.LineChart className="mt-0.5 size-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Improving Speed</p>
                    <p className="text-xs text-muted-foreground">
                      Your completion time is getting faster! Keep up the great work.
                    </p>
                  </div>
                </div>
              )}
              {historicalStats.speedTrend === 'improving' && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icons.CircleCheck className="mt-0.5 size-4 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Accuracy Trend</p>
                    <p className="text-xs text-muted-foreground">
                      Your accuracy is improving! You're getting better at this topic.
                    </p>
                  </div>
                </div>
              )}
              {historicalStats.streak > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icons.Activity className="mt-0.5 size-4 shrink-0 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Study Streak</p>
                    <p className="text-xs text-muted-foreground">
                      Keep it up! You're on a {historicalStats.streak}-day streak
                    </p>
                  </div>
                </div>
              )}
              {historicalStats.consistencyScore > 80 && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icons.CircleCheck className="mt-0.5 size-4 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Consistent Performance</p>
                    <p className="text-xs text-muted-foreground">
                      You're maintaining consistent performance across workouts
                    </p>
                  </div>
                </div>
              )}
              {totalWorkouts === 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icons.Activity className="mt-0.5 size-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Start Your Journey</p>
                    <p className="text-xs text-muted-foreground">
                      Complete your first workout to start tracking your progress!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuickStats = () => {
    if (full) return null;

    // Show empty state for quick stats when no workout data
    if (!workout && totalWorkouts === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="py-4 text-center">
              <Icons.Activity className="mx-auto mb-2 size-8 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Start your first workout to see statistics
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{questionsCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isWorkoutInProgress ? Math.round(currentAccuracy) : workout?.currentRatio || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isWorkoutInProgress
                  ? formatSecondsDuration(timeElapsed)
                  : formatSecondsDuration(workout?.currentTime || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className={cn(
        isDev && '__WorkoutStats', // DEBUG
        'space-y-4',
        className,
      )}
    >
      {renderCurrentWorkoutStats()}
      {renderQuickStats()}
      {renderHistoricalStats()}
    </div>
  );
}
