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
  } = workout;

  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug('[AvailableWorkoutsListItem]', {
      workout,
    });
  }

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
    isActive && startedAt && (
      <div className="flex items-center gap-1">
        <Icons.Clock className="size-4 opacity-50" />
        <span className="truncate">
          {t('AvailableWorkoutsListItem.TrainingDuration')}:{' '}
          <ShowTimeSince date={startedAt} timeout={0} />
        </span>
      </div>
    ),
    isActive && workout.stepIndex !== undefined && workout.questionsCount && (
      <div className="flex items-center gap-1">
        <Icons.Footprints className="size-4 opacity-50" />
        <span className="truncate">
          {t('AvailableWorkoutsListItem.ProgressInfo', {
            stepNo: (workout.stepIndex || 0) + 1,
            stepsCount: workout.questionsCount,
          })}
        </span>
      </div>
    ),
    /* // NOTE: It required to calculate a ratio from `questionResults`: currentTime and currentRatio update only on finishWorkout
    isActive && workout.currentRatio != undefined && (
      <div className="flex items-center gap-1">
        <Icons.ChartNoAxesGantt className="size-4 opacity-50" />
        <span className="truncate">
          {t('AvailableWorkoutsListItem.CurrentRatio')}: {workout.currentRatio}%
        </span>
      </div>
    ),
    */
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
        <div className="flex items-start justify-between gap-4 max-sm:flex-col-reverse">
          <div className="content-truncate flex flex-1 flex-col gap-2">
            <CardTitle className="content-truncate text-base sm:text-lg">
              <Link href={topicRoute} className="content-truncate hover:underline">
                {isTopicBusy ? (
                  <Skeleton className="h-7 w-1/2" />
                ) : (
                  topic?.name || t('UnknownTopic')
                )}
              </Link>
            </CardTitle>
          </div>
          <div className="content-truncate flex items-center gap-2 text-xs">
            {isActive && (
              <span className="animate-pulse truncate rounded-full border border-green-500/20 px-2 py-1 text-green-500">
                {t('AvailableWorkouts.Active')}
              </span>
            )}
            {isCompleted && (
              <span className="truncate rounded-full border border-green-500/20 px-2 py-1 text-green-500">
                {t('AvailableWorkouts.Completed')}
              </span>
            )}
            {!started && !finished && (
              <span className="truncate rounded-full border border-gray-500/20 px-2 py-1">
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
        </div>

        {/* Workout summary stats */}
        {hasWorkoutStats && (
          <div
            className={cn(
              isDev && '__AvailableWorkoutsListItem_Stats', // DEBUG
              'flex flex-wrap gap-2 gap-y-1 text-xs',
            )}
          >
            <div className="content-truncate flex flex-wrap items-center gap-1">
              <span className="truncate opacity-50">
                {t('AvailableWorkoutsListItem.WorkoutStatsCount')}:
              </span>
              <span className="truncate font-medium">{workoutStatsCount}</span>
            </div>
            <div className="content-truncate flex flex-wrap items-center gap-1">
              <span className="truncate opacity-50">{t('QuestionsCount')}:</span>
              <span className="truncate font-medium">{questionsCount}</span>
            </div>
            <div className="content-truncate flex flex-wrap items-center gap-1">
              <span className="truncate opacity-50">{t('AverageSuccessRate')}:</span>
              <span className="truncate font-medium">{Math.round(averageRatio)}%</span>
            </div>
            {!!totalTimeSeconds && (
              <div className="content-truncate flex flex-wrap items-center gap-1">
                <span className="truncate opacity-50">{t('TotalDuration')}:</span>
                <span className="truncate font-medium">
                  <ShowTimeSince date={totalTimeSeconds * 1000} timeout={0} />
                </span>
              </div>
            )}
            {(finishedAt || startedAt) && (
              <div className="content-truncate flex flex-wrap items-center gap-1">
                <span className="truncate opacity-50">{t('LastActivity')}:</span>
                <span className="truncate font-medium">
                  {t.rich('AvailableWorkoutsListItem.lastActivityTimeAgo', {
                    TimeAgo: () => <ShowTimeSince date={finishedAt || startedAt || undefined} />,
                  })}
                  {/* <ShowTimeSince date={finishedAt || startedAt || undefined} /> {t('ago')} */}
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
              className={cn(
                buttonVariants({ variant: 'theme' }),
                'content-truncate flex items-center gap-2',
              )}
            >
              <Icons.Rocket className="size-4 shrink-0" />
              <span className="truncate">{t('ToTraining')}</span>
            </Link>
          )}

          {isActive && (
            <Link
              href={workoutGoRoute}
              className={cn(
                buttonVariants({ variant: 'theme' }),
                'content-truncate flex items-center gap-2',
              )}
            >
              <Icons.Play className="size-4 shrink-0" />
              <span className="truncate">{t('ResumeTraining')}</span>
            </Link>
          )}

          {/* // NOTE: It's almost the same as 'ToTraining' above
          <Link
            href={workoutRoute}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Eye className="shrink-0 size-4" />
            <span className="truncate">{t('ViewTraining')}</span>
          </Link>
            */}

          <Link
            href={topicRoute}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Topics className="size-4 shrink-0" />
            <span className="truncate">{t('ViewTopic')}</span>
          </Link>

          {(isAdmin || isOwner) && (
            <Link
              href={manageTopicRoute}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'content-truncate flex items-center gap-2',
              )}
            >
              <Icons.Edit className="size-4 shrink-0" />
              <span className="truncate">{t('EditTopic')}</span>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
