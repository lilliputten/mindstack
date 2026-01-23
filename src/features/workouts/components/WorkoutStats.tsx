'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { getErrorText } from '@/lib/helpers';
import { formatSecondsDuration, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
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
import { PageEmpty } from '@/components/pages/shared';
import { PageError, ShowTimeSince } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useSessionData } from '@/hooks';

import { WorkoutStatsSkeleton } from './WorkoutStatsSkeleton';

interface TWorkoutStatsProps {
  className?: string;
  full?: boolean;
  hideTimes?: boolean;
}

export function WorkoutStats(props: TWorkoutStatsProps) {
  const { className, full, hideTimes } = props;
  const format = useFormatter();
  const t = useT();

  const { user, loading: isUserLoading } = useSessionData();
  const hasUser = !!user?.id;

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
  const errorText = historicalErrorText
    ? [
        t('WorkoutStats.FailedToLoadHistoricalData'),
        historicalErrorText && `(${historicalErrorText})`,
        t('WorkoutStats.PleaseTryAgainLater'),
      ]
        .filter(Boolean)
        .join(' ')
    : /*!workout
      ? t('WorkoutStats.NoWorkoutDataFound')
      : */ undefined;

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

  /* // TODO?
   * const _estimatedTimeRemaining =
   *   averageTimePerQuestion > 0 && questionsCount > 0
   *     ? Math.round(averageTimePerQuestion * (questionsCount - (workout?.stepIndex || 0) - 1))
   *     : 0;
   */

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

  const isBusy = isWorkoutPending || isHistoricalLoading;

  const renderCurrentWorkoutStats = React.useMemo(() => {
    if (!workout) {
      // Show historical summary when no current workout but there's history
      if (totalWorkouts > 0) {
        return (
          <Card key="renderCurrentWorkoutStats-NoWorkout" id="renderCurrentWorkoutStats-NoWorkout">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Activity className="size-4 text-theme" />
                {t('WorkoutStats.YourProgress')}
              </CardTitle>
              <CardDescription>
                {t('WorkoutStats.SummaryOfCompletedCountTemplate', { count: totalWorkouts })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.BestAccuracy')}</p>
                  <p className="text-2xl font-bold">{historicalStats.bestAccuracy}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.AvgTime')}</p>
                  <p className="text-2xl font-bold">
                    {formatSecondsDuration(historicalStats.averageTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icons.CircleCheck className="size-4 text-green-500" />
                <span className="text-sm">
                  {historicalStats.streak > 0
                    ? `${t('WorkoutStats.OnAStreak')} ${historicalStats.streak}-${t('WorkoutStats.DayStreak').toLowerCase()}`
                    : t('WorkoutStats.ReadyForNextWorkout')}
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
        key="renderCurrentWorkoutStats-NoWorkout-Full"
        id="renderCurrentWorkoutStats-NoWorkout-Full"
        className={cn(
          isDev && '__WorkoutStats_Card', // DEBUG
          'flex flex-col justify-center gap-6',
        )}
      >
        <CardContent className="flex flex-col justify-center gap-6 p-6">
          <CardTitle className="flex items-center justify-center gap-2 text-center">
            <Icons.Activity className="size-4 text-theme" />
            <span className="truncate">{t('WorkoutStats.RecentTraining')}</span>
          </CardTitle>
          {isWorkoutInProgress && (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span>{t('WorkoutStats.Progress')}</span>
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
                  <p className="text-sm">{t('WorkoutStats.CurrentAccuracy')}</p>
                  <p className="text-2xl font-bold">{Math.round(currentAccuracy)}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.TimeElapsed')}</p>
                  <p className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatSecondsDuration(timeElapsed)}</span>
                    {isWorkoutInProgress && (
                      <span className="opacity-50">{t('WorkoutStats.Active')}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.CorrectAnswers')}</p>
                  <p className="text-lg font-semibold">{workout.correctAnswers || 0}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.AvgTimePerQuestion')}</p>
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
                'flex flex-col gap-4',
              )}
            >
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.FinalAccuracy')}</p>
                  <p className="text-2xl font-bold">{workout.currentRatio || 0}%</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm">{t('WorkoutStats.TotalTime')}</p>
                  <p className="text-2xl font-bold">
                    <ShowTimeSince date={(workout.currentTime || 0) * 1000} timeout={0} />
                  </p>
                </div>
              </div>
              {!hideTimes && (
                <div className="flex items-center justify-center gap-2">
                  <Icons.CircleCheck className="size-4 text-green-500" />
                  <span className="text-sm">
                    {t.rich('WorkoutStats.CompletedDetails', {
                      FinishedTime: () => <ShowTimeSince date={workout.finishedAt || undefined} />,
                    })}
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
                    ? t('WorkoutStats.NoTrainingHistory')
                    : t('WorkoutStats.GuestUsersCannotSeeHistory')}
                </p>
                {!totalWorkouts ? (
                  <p className="text-sm">
                    {user
                      ? t('WorkoutStats.ThisWillBeYourFirst')
                      : t('WorkoutStats.SignInToStartCollecting')}
                  </p>
                ) : totalWorkouts === 1 ? (
                  <p className="text-sm">{t('WorkoutStats.ThereIsOnlyOneHistoryRecordNow')}</p>
                ) : null}
              </div>
            ) : null
          ) : null}
        </CardContent>
      </Card>
    );
  }, [
    averageTimePerQuestion,
    currentAccuracy,
    currentProgress,
    hideTimes,
    historicalStats.averageTime,
    historicalStats.bestAccuracy,
    historicalStats.streak,
    isUserLoading,
    isWorkoutCompleted,
    isWorkoutInProgress,
    isWorkoutPending,
    questionsCount,
    t,
    timeElapsed,
    totalWorkouts,
    user,
    workout,
  ]);

  const renderHistoricalStats = React.useMemo(() => {
    if (!full || !hasUser) return null;

    const insightItems = [
      historicalStats.speedTrend === 'improving' && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Icons.LineChart className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium">{t('WorkoutStats.ImprovingSpeed')}</p>
            <p className="text-xs">{t('WorkoutStats.CompletionTimeIsGettingFaster')}</p>
          </div>
        </div>
      ),
      historicalStats.speedTrend === 'improving' && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Icons.CircleCheck className="mt-0.5 size-4 shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-medium">{t('WorkoutStats.AccuracyTrend')}</p>
            <p className="text-xs">{t('WorkoutStats.AccuracyIsImproving')}</p>
          </div>
        </div>
      ),
      historicalStats.streak > 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Icons.Activity className="mt-0.5 size-4 shrink-0 text-orange-500" />
          <div>
            <p className="text-sm font-medium">{t('WorkoutStats.StudyStreak')}</p>
            <p className="text-xs">
              {t('WorkoutStats.KeepItUp')}{' '}
              {t('WorkoutStats.OnAStreakTemplate', { streak: historicalStats.streak })}
            </p>
          </div>
        </div>
      ),
      historicalStats.consistencyScore > 80 && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Icons.CircleCheck className="mt-0.5 size-4 shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-medium">{t('WorkoutStats.ConsistentPerformance')}</p>
            <p className="text-xs">{t('WorkoutStats.MaintainingConsistentPerformanceText')}</p>
          </div>
        </div>
      ),
      totalWorkouts === 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Icons.Activity className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium">{t('WorkoutStats.StartYourJourney')}</p>
            <p className="text-xs">Complete your first workout to start tracking your progress!</p>
          </div>
        </div>
      ),
    ].filter(Boolean);

    return (
      <Card
        key="renderHistoricalStats"
        id="renderHistoricalStats"
        className={cn(
          isDev && '__WorkoutStats_HistoricalStats', // DEBUG
        )}
      >
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center justify-center gap-2">
            <Icons.LineChart className="size-4 text-theme" />
            <span className="truncate">{t('WorkoutStats.HistoricalPerformance')}</span>
          </CardTitle>
          <CardDescription className="text-center">
            {t('WorkoutStats.YourLearningProgress')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!totalWorkouts ? (
            <div
              className={cn(
                isDev && '__WorkoutStats_HistoricalStats_NoStats', // DEBUG
                'text-center',
              )}
            >
              {/* Show empty state if no historical data */}
              <Icons.Activity className="mx-auto mb-4 size-8 text-theme" />
              <h3 className="mb-2 text-lg font-semibold">
                {t('WorkoutStats.NoTrainingHistoryYet')}
              </h3>
              <p className="mb-4 text-sm">
                {t('WorkoutStats.CompleteFirstWorkoutToStartTracking')}
              </p>
              <div className="rounded-lg bg-muted/50 py-4 text-center">
                <h4 className="mb-2 text-center text-sm font-medium">
                  {t('WorkoutStats.WhatYoullSeeAfter')}:
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>{t('WorkoutStats.PerformanceTrendsAndAccuracyTracking')}</li>
                  <li>{t('WorkoutStats.StudyStreaksAndConsistencyMetrics')}</li>
                  <li>{t('WorkoutStats.PersonalizedLearningInsights')}</li>
                  <li>{t('WorkoutStats.AchievementBadgesAndProgressMilestones')}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                isDev && '__WorkoutStats_HistoricalStats_KeyMetrics', // DEBUG
                'flex flex-col gap-4 sm:grid sm:grid-cols-2 md:grid-cols-4',
              )}
            >
              {/* Key Metrics */}
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold">{totalWorkouts}</p>
                <p className="text-sm">{t('WorkoutStats.TotalTrainings')}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold">{historicalStats.averageAccuracy}%</p>
                <p className="text-sm">{t('WorkoutStats.AvgAccuracy')}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold">
                  {formatSecondsDuration(historicalStats.averageTime)}
                </p>
                <p className="text-sm">{t('WorkoutStats.AvgTime')}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold">{historicalStats.streak}</p>
                <p className="text-sm">{t('WorkoutStats.DayStreak')}</p>
              </div>
            </div>
          )}

          {/* Performance Badges */}
          <div
            className={cn(
              isDev && '__WorkoutStats_PerformanceBadges', // DEBUG
              'flex flex-col gap-4',
            )}
          >
            <h4 className="text-center font-semibold">{t('WorkoutStats.Achievements')}</h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="success" className="flex items-center gap-1">
                <Icons.CircleCheck className="size-3" />
                {t('WorkoutStats.SpeedMaster')}
              </Badge>
              <Badge variant="success" className="flex items-center gap-1">
                <Icons.CircleCheck className="size-3" />
                {t('WorkoutStats.AccuracyExpert')}
              </Badge>
              <Badge variant="default" className="flex items-center gap-1">
                <Icons.Activity className="size-3" />
                {t('WorkoutStats.ConsistencyChampion')}
              </Badge>
            </div>
          </div>

          {/* Performance Table */}
          {!!totalWorkouts && (
            <div
              className={cn(
                isDev && '__WorkoutStats_PerformanceTable', // DEBUG
                'flex flex-col gap-4',
              )}
            >
              <h4 className="text-center font-semibold">{t('WorkoutStats.RecentPerformance')}</h4>
              {hasMoreWorkouts && (
                <p className="text-center text-sm opacity-50">
                  {t('WorkoutStats.Displaying')} {recentWorkouts.length}{' '}
                  {t('WorkoutStats.lastResults')} {totalWorkouts}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead id="Date">{t('WorkoutStats.Date')}</TableHead>
                    <TableHead id="Accuracy" className="truncate text-center">
                      {t('WorkoutStats.Accuracy')}
                    </TableHead>
                    <TableHead id="Time" className="truncate text-right max-md:hidden">
                      {t('WorkoutStats.Time')}
                    </TableHead>
                    {/* <TableHead>Questions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentWorkouts.length ? (
                    recentWorkouts.map((workout) => (
                      <TableRow key={workout.id}>
                        <TableCell id="Date">
                          {getFormattedRelativeDate(format, workout.createdAt)}
                        </TableCell>
                        <TableCell id="Accuracy" className="truncate text-center">
                          <Badge
                            className="w-full justify-center text-center"
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
                      <TableCell colSpan={4} className="text-center">
                        {t('WorkoutStats.NoWorkoutHistoryAvailable')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Learning Insights */}
          {!!insightItems.length && (
            <div
              className={cn(
                isDev && '__WorkoutStats_LearningInsights', // DEBUG
                'flex flex-col gap-4',
              )}
            >
              <h4 className="text-center font-semibold">{t('WorkoutStats.LearningInsights')}</h4>
              {/* // TODO: Determine the amount of the insight items and limit grid count to the maximum */}
              <div
                className={cn(
                  isDev && '__WorkoutStats_LearningInsights_Blocks', // DEBUG
                  'grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
                )}
              >
                {insightItems}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [
    format,
    full,
    hasMoreWorkouts,
    hasUser,
    historicalStats.averageAccuracy,
    historicalStats.averageTime,
    historicalStats.consistencyScore,
    historicalStats.speedTrend,
    historicalStats.streak,
    recentWorkouts,
    t,
    totalWorkouts,
  ]);

  const renderQuickStats = React.useMemo(() => {
    if (full) return null;

    // Show empty state for quick stats when no workout data
    if (!workout && totalWorkouts === 0) {
      return (
        <Card key="renderQuickStats-NoWorkout" id="renderQuickStats-NoWorkout">
          <CardContent className="pt-6">
            <div className="py-4 text-center">
              <Icons.Activity className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">{t('WorkoutStats.StartFirstWorkout')}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key="renderQuickStats-Full" id="renderQuickStats-Full">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{questionsCount}</p>
              <p className="text-xs">{t('WorkoutStats.Questions')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isWorkoutInProgress ? Math.round(currentAccuracy) : workout?.currentRatio || 0}%
              </p>
              <p className="text-xs">{t('WorkoutStats.Accuracy')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isWorkoutInProgress
                  ? formatSecondsDuration(timeElapsed)
                  : formatSecondsDuration(workout?.currentTime || 0)}
              </p>
              <p className="text-xs">{t('WorkoutStats.Time')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [
    currentAccuracy,
    full,
    isWorkoutInProgress,
    questionsCount,
    t,
    timeElapsed,
    totalWorkouts,
    workout,
  ]);

  if (isBusy) {
    return (
      <WorkoutStatsSkeleton
        className={cn(
          isDev && '__WorkoutStats_Skeleton', // DEBUG
          className,
        )}
      />
    );
  }

  if (!workout && !full) {
    return null;
  }

  if (!workout) {
    return (
      <PageEmpty
        // className="size-full flex-1"
        className={cn(
          isDev && '__WorkoutStats_NoWorkout', // DEBUG
          'size-full overflow-visible',
        )}
        icon={Icons.Rocket}
        title={t('WorkoutStats.TrainingNotStarted')}
        description={t('WorkoutStats.NoWorkoutDescription')}
      />
    );
  }

  if (errorText) {
    return (
      <PageError
        className={cn(
          isDev && '__WorkoutStats_HistoricalError', // DEBUG
          'overflow-visible',
        )}
        // error={error || 'Error loading available categories data'}
        explanationClassName="text-content text-truncate"
        error={errorText}
        // reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  const renderItems = [
    // Items to render
    renderCurrentWorkoutStats,
    renderQuickStats,
    renderHistoricalStats,
  ].filter(Boolean);

  if (!renderItems.length) {
    return <div>XXX</div>;
  }

  return (
    <div
      className={cn(
        isDev && '__WorkoutStats', // DEBUG
        'flex flex-1 flex-col justify-center gap-4',
        className,
      )}
    >
      {renderItems}
    </div>
  );
}
