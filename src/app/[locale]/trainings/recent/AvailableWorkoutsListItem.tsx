'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { formatSecondsDuration } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShowTimeSince } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import {
  allTopicsRoute,
  availableTopicsRoute,
  myTopicsRoute,
  recentTrainingsRoute,
  TRoutePath,
} from '@/config';
import { isDev } from '@/constants';
import { TUserTopicWorkout } from '@/features/workouts/types';
import { useGoToTheRoute, useSessionData } from '@/hooks';

interface TAvailableWorkoutsListItemProps {
  index: number;
  style?: React.CSSProperties;
  workout: TUserTopicWorkout;
}

const showDescription = false;

export function AvailableWorkoutsListItem(props: TAvailableWorkoutsListItemProps) {
  const { workout, style } = props;
  const t = useT();

  const { user } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';

  const {
    userId,
    topicId,
    topic,
    started,
    finished,
    startedAt,
    finishedAt,
    stats: workoutStats,
  } = workout;

  const isOwner = userId === user?.id;
  const isActive = started && !finished;
  const isCompleted = finished;

  const topicRoute = `${availableTopicsRoute}/${topicId}` as TRoutePath;
  const workoutRoute = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const startRoute = `${topicRoute}/workout/go` as TRoutePath;
  const manageTopicRoute = ((isAdmin ? allTopicsRoute : myTopicsRoute) +
    `/${topicId}/edit`) as TRoutePath;

  // Calculate workout stats from history
  const totalQuestions =
    workoutStats?.reduce(
      (acc: number, stat: { totalQuestions?: number | null }) => acc + (stat.totalQuestions || 0),
      0,
    ) || 0;
  const correctAnswers =
    workoutStats?.reduce(
      (acc: number, stat: { correctAnswers?: number | null }) => acc + (stat.correctAnswers || 0),
      0,
    ) || 0;
  const totalTime =
    workoutStats?.reduce(
      (acc: number, stat: { timeSeconds?: number | null }) => acc + (stat.timeSeconds || 0),
      0,
    ) || 0;
  const successRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Workout detail items
  const detailItems = [
    (topic?.langName || topic?.langCode) && (
      <span key="language" className="flex items-center gap-1">
        <Icons.Languages className="size-4 opacity-50" />
        <span className="truncate">{topic.langName || topic.langCode}</span>
      </span>
    ),
  ].filter(Boolean);

  return (
    <Card
      className={cn(
        isDev && '__AvailableWorkoutsListItem', // DEBUG
        'w-full shrink-0',
        style,
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <CardTitle className="text-base sm:text-lg">
              <Link href={topicRoute} className="hover:underline">
                {topic?.name || t('UnknownTopic')}
              </Link>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {t('Active')}
              </span>
            )}
            {isCompleted && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {t('Completed')}
              </span>
            )}
            {!started && !finished && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {t('NotStarted')}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-4 pt-2">
        {/* Brief topic info */}
        {showDescription && topic?.description && (
          <p className="line-clamp-2 text-sm opacity-50">{topic.description}</p>
        )}

        {/* Workout details */}
        {!!detailItems.length && (
          <div
            className={cn(
              isDev && '__AvailableWorkoutsListItem_Details', // DEBUG
              'flex flex-wrap gap-2 text-xs opacity-50',
            )}
          >
            {detailItems}
          </div>
        )}

        {/* Workout summary stats */}
        <div
          className={cn(
            isDev && '__AvailableWorkoutsListItem_Stats', // DEBUG
            'flex flex-wrap gap-4 gap-y-2 text-xs',
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            <span className="opacity-50">{t('Questions')}:</span>
            <span className="font-medium">{totalQuestions}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="opacity-50">{t('SuccessRate')}:</span>
            <span className="font-medium">{successRate}%</span>
          </div>
          {!!totalTime && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="opacity-50">{t('Duration')}:</span>
              <span className="font-medium">
                <ShowTimeSince date={(totalTime || 0) * 1000} timeout={0} />
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
              href={workoutRoute}
              className={cn(buttonVariants({ variant: 'theme' }), 'flex items-center gap-2')}
            >
              <Icons.Play className="size-4" />
              {t('ResumeTraining')}
            </Link>
          )}

          {isCompleted && (
            <Link
              href={workoutRoute}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}
            >
              <Icons.Eye className="size-4" />
              {t('ViewDetails')}
            </Link>
          )}

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
