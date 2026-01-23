'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShowTimeSince } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, availableTopicsRoute, myTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TUserTopicWorkout } from '@/features/workouts/types';
import { useAvailableTopicById, useSessionData } from '@/hooks';

interface TAvailableWorkoutsListItemProps {
  index: number;
  className?: string;
  workout: TUserTopicWorkout;
}

export function AvailableWorkoutsListItem(props: TAvailableWorkoutsListItemProps) {
  const { workout, className } = props;
  const t = useT();

  const { user } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';

  const {
    userId,
    topicId,
    // topic,
    started,
    finished,
    startedAt,
    finishedAt,
    workoutStats,
    questionsCount,
    // stats: workoutStats,
  } = workout;

  console.log('[AvailableWorkoutsListItem]', {
    workout,
  });

  const isOwner = userId === user?.id;
  const isActive = started && !finished;
  const isCompleted = finished;

  const topicRoute = `${availableTopicsRoute}/${topicId}` as TRoutePath;
  const workoutRoute = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const workoutGoRoute = `${workoutRoute}/go` as TRoutePath;
  const startRoute = `${topicRoute}/workout/go` as TRoutePath;
  const manageTopicRoute = ((isAdmin ? allTopicsRoute : myTopicsRoute) +
    `/${topicId}/edit`) as TRoutePath;

  const workoutStatsCount = workoutStats?.length || 0;
  const hasWorkoutStats = !!workoutStatsCount;

  const availableTopicQuery = useAvailableTopicById({ id: topicId });

  const { topic, isFetched: isTopicFetched, isLoading: isTopicLoading } = availableTopicQuery;
  const isTopicReady = isTopicFetched && !isTopicLoading;
  const isTopicBusy = !isTopicReady;

  // Calculate workout stats from history
  const totalTimeSeconds =
    workoutStats?.reduce((acc: number, stat) => acc + (stat.timeSeconds || 0), 0) || 0;
  const totalRatio = workoutStats?.reduce((acc: number, stat) => acc + (stat.ratio || 0), 0) || 0;
  const averageRatio = workoutStatsCount ? totalRatio / workoutStatsCount : 0;

  // Workout detail items
  const detailItems = [
    (isTopicBusy || topic?.langName || topic?.langCode) && (
      <span key="language" className="flex items-center gap-1">
        <Icons.Languages className="size-4 opacity-50" />
        <span className="truncate">
          {isTopicBusy ? <Skeleton className="h-4 w-12" /> : topic?.langName || topic?.langCode}
        </span>
      </span>
    ),
  ].filter(Boolean);

  return (
    <Card
      className={cn(
        isDev && '__AvailableWorkoutsListItem', // DEBUG
        'w-full shrink-0',
        className,
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <CardTitle className="text-base sm:text-lg">
              <Link href={topicRoute} className="hover:underline">
                {isTopicBusy ? (
                  <Skeleton className="h-7 w-1/2" />
                ) : (
                  topic?.name || t('UnknownTopic')
                )}
              </Link>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isActive && (
              <span className="animate-pulse rounded-full border border-green-500/20 px-2 py-1 text-green-500">
                {t('AvailableWorkouts.Active')}
              </span>
            )}
            {isCompleted && (
              <span className="rounded-full border border-green-500/20 px-2 py-1 text-green-500">
                {t('AvailableWorkouts.Completed')}
              </span>
            )}
            {!started && !finished && (
              <span className="rounded-full border border-gray-500/20 px-2 py-1">
                {t('AvailableWorkouts.NotStarted')}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-4 pt-2">
        {/* Workout details */}
        <div
          className={cn(
            isDev && '__AvailableWorkoutsListItem_Details', // DEBUG
            'flex flex-wrap gap-2 gap-y-1 text-xs',
          )}
        >
          {!!detailItems.length && detailItems}

          {isActive && startedAt && (
            <>
              <div className="flex items-center gap-1">
                <Icons.Clock className="size-4 opacity-50" />
                <span>
                  {t('WorkoutStats.TrainingDuration')}:{' '}
                  <ShowTimeSince date={startedAt} timeout={0} />
                </span>
              </div>

              {workout.stepIndex !== undefined && workout.questionsCount && (
                <div className="flex items-center gap-1">
                  <Icons.ListTodo className="size-4 opacity-50" />
                  <span>
                    {t('WorkoutStats.ProgressInfo', {
                      stepNo: (workout.stepIndex || 0) + 1,
                      stepsCount: workout.questionsCount,
                    })}
                  </span>
                </div>
              )}

              {workout.currentRatio && (
                <div className="flex items-center gap-1">
                  <Icons.BarChart2 className="size-4 opacity-50" />
                  <span>
                    {t('WorkoutStats.CurrentRatio')}: {workout.currentRatio}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Workout summary stats */}
        {hasWorkoutStats && (
          <div
            className={cn(
              isDev && '__AvailableWorkoutsListItem_Stats', // DEBUG
              'flex flex-wrap gap-2 gap-y-1 text-xs',
            )}
          >
            <div className="flex flex-wrap items-center gap-1">
              <span className="opacity-50">{t('QuestionsCount')}:</span>
              <span className="font-medium">{questionsCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="opacity-50">{t('AverageSuccessRate')}:</span>
              <span className="font-medium">{averageRatio}%</span>
            </div>
            {!!totalTimeSeconds && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="opacity-50">{t('TotalDuration')}:</span>
                <span className="font-medium">
                  <ShowTimeSince date={totalTimeSeconds * 1000} timeout={0} />
                </span>
              </div>
            )}
            {(finishedAt || startedAt) && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="opacity-50">{t('LastActivity')}:</span>
                <span className="font-medium">
                  <ShowTimeSince date={finishedAt || startedAt || undefined} /> ago
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div
          className={cn(
            isDev && '__AvailableWorkoutsListItem_Actions', // DEBUG
            'flex flex-wrap gap-2',
          )}
        >
          {!started && (
            <Link
              href={startRoute}
              className={cn(buttonVariants({ variant: 'theme' }), 'flex items-center gap-2')}
            >
              <Icons.Play className="size-4" />
              {t('StartTraining')}
            </Link>
          )}

          {isActive && (
            <Link
              href={workoutGoRoute}
              className={cn(buttonVariants({ variant: 'theme' }), 'flex items-center gap-2')}
            >
              <Icons.Play className="size-4" />
              {t('ResumeTraining')}
            </Link>
          )}

          <Link
            href={workoutRoute}
            className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}
          >
            <Icons.Eye className="size-4" />
            {t('ViewTraining')}
          </Link>

          <Link
            href={topicRoute}
            className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}
          >
            <Icons.Topics className="size-4" />
            {t('ViewTopic')}
          </Link>

          {(isAdmin || isOwner) && (
            <Link
              href={manageTopicRoute}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}
            >
              <Icons.Edit className="size-4" />
              {t('EditTopic')}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
