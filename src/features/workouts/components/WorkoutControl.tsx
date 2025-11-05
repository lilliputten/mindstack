'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { availableTopicsRoute, TRoutePath } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { useWorkoutStatsHistory } from '@/hooks/react-query/useWorkoutStatsHistory';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useGoToTheRoute } from '@/hooks';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link } from '@/i18n/routing';

import { WorkoutStateDetails } from './WorkoutStateDetails';

interface TWorkoutControlProps {
  className?: string;
  omitNoWorkoutMessage?: boolean;
}

export function WorkoutControl(props: TWorkoutControlProps) {
  const { className, omitNoWorkoutMessage } = props;

  const workoutContext = useWorkoutContext();
  const {
    topicId,
    workout,
    pending: isWorkoutPending,
    // startWorkout,
    finishWorkout,
    questionIds,
  } = workoutContext;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;
  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;

  const goToTheRoute = useGoToTheRoute();
  const pathname = usePathname();
  const workoutRoute = `${availableTopicsRoute}/${topicId}/workout`;
  const isOnWorkoutRoute = comparePathsWithoutLocalePrefix(workoutRoute, pathname);

  const workoutStatsHistoryQuery = useWorkoutStatsHistory(topicId);
  const {
    data: historicalData,
    isLoading: isHistoricalLoading,
    isFetched: isHistoricalFetched,
    // error: historicalError,
  } = workoutStatsHistoryQuery;
  const isHistoricalPending = isHistoricalLoading || !isHistoricalFetched;
  const hasHistoricalData = !!historicalData;

  const handleGoWorkout = () => {
    // console.log('[WorkoutControl:handleResumeWorkout]');
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  };

  /* const handleStartWorkout = () => {
   *   // console.log('[WorkoutControl:handleStartWorkout]');
   *   startWorkout();
   *   setTimeout(handleGoWorkout, 10);
   * };
   */

  if (isWorkoutPending) {
    return (
      <div className={cn(isDev && '__WorkoutControl_Skeleton', 'flex flex-col gap-4', className)}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!allowedTraining) {
    return null;
  }

  if (!workout) {
    return (
      <div className={cn(isDev && '__WorkoutControl_NoWorkout', 'flex flex-col gap-4', className)}>
        {!omitNoWorkoutMessage && (
          <p className="text-sm text-muted-foreground">No active training found.</p>
        )}
        <Button onClick={handleGoWorkout} disabled={isWorkoutPending} className="flex w-fit gap-2">
          <Icons.Activity className="size-4 opacity-50" />
          <span>Start New Training</span>
        </Button>
      </div>
    );
  }

  console.log('[]', {
    isOnWorkoutRoute,
    isHistoricalPending,
    hasHistoricalData,
  });

  return (
    <div className={cn(isDev && '__WorkoutControl', 'flex flex-col gap-4', className)}>
      <p className="text-sm text-muted-foreground">
        <WorkoutStateDetails workout={workout} />
      </p>
      <div className="flex gap-2">
        <Button onClick={handleGoWorkout} variant="default" className="flex gap-2">
          <Icons.Activity className="size-4 opacity-50" />
          <span>
            {workout.finished
              ? 'Restart Training'
              : workout.started
                ? 'Resume Training'
                : 'Start Training'}
          </span>
        </Button>
        {!isOnWorkoutRoute &&
          ((hasHistoricalData && !isHistoricalPending) || workout.started ? (
            <Button variant="theme">
              <Link href={workoutRoute as TRoutePath} className="flex items-center gap-2">
                <Icons.ExternalLink className="size-4 opacity-50" />
                <span>Review Training</span>
              </Link>
            </Button>
          ) : isHistoricalPending ? (
            <Skeleton className="h-10 w-40" />
          ) : null)}
        {workout.started && (
          <Button onClick={finishWorkout} variant="default" className="flex gap-2">
            <Icons.Flag className="size-4 opacity-50" />
            <span>Finish Training</span>
          </Button>
        )}
      </div>
    </div>
  );
}
