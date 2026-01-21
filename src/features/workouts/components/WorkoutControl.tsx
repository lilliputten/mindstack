'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useGoToTheRoute } from '@/hooks';

import { WorkoutStateDetails } from './WorkoutStateDetails';

interface TWorkoutControlProps {
  className?: string;
  omitNoWorkoutMessage?: boolean;
  handleStart?: () => void;
}

export function WorkoutControl(props: TWorkoutControlProps) {
  const { className, omitNoWorkoutMessage, handleStart } = props;
  const t = useT();

  const workoutContext = useWorkoutContext();
  const {
    topicId,
    workout,
    pending: isWorkoutPending,
    // startWorkout,
    finishWorkout,
    questionIds,
  } = workoutContext;
  const isWorkoutFinished = workout?.finished;
  const isWorkoutStarted = workout?.started;
  // const isWorkoutInProgress = workout?.started && !workout?.finished;
  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;

  const goToTheRoute = useGoToTheRoute();
  const pathname = usePathname();
  const workoutRoute = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const isOnWorkoutRoute = comparePathsWithoutLocalePrefix(workoutRoute, pathname);
  const workoutGoRoute = `${availableTopicsRoute}/${topicId}/workout/go` as TRoutePath;
  // const isOnWorkoutGoRoute = comparePathsWithoutLocalePrefix(workoutGoRoute, pathname);

  const handleGoWorkout = React.useCallback(() => {
    if (handleStart) {
      handleStart();
    } else {
      goToTheRoute(workoutGoRoute);
    }
  }, [goToTheRoute, handleStart, workoutGoRoute]);

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
          <p className="text-sm text-muted-foreground">
            {t('AvailableTopics.NoActiveTrainingFound')}
          </p>
        )}
        <Button onClick={handleGoWorkout} disabled={isWorkoutPending} className="flex w-fit gap-2">
          <Icons.Activity className="size-4 opacity-50" />
          <span>{t('AvailableTopics.StartNewTraining')}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(isDev && '__WorkoutControl', 'flex flex-col gap-4', className)}>
      <p className="text-sm text-muted-foreground">
        <WorkoutStateDetails workout={workout} />
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleGoWorkout} variant="theme" className={cn('flex gap-2')}>
          <Icons.Rocket className="size-4 opacity-50" />
          <span>
            {isWorkoutFinished
              ? t('AvailableTopics.RestartTraining')
              : isWorkoutStarted
                ? t('AvailableTopics.ResumeTraining')
                : t('AvailableTopics.StartTraining')}
          </span>
        </Button>
        {/*!isOnWorkoutGoRoute && (
          <Button variant="theme">
            <Link href={workoutGoRoute} className="flex items-center gap-2">
              <Icons.LineChart className="size-4 opacity-50" />
              <span>{t('AvailableTopics.TrainingDetails')}</span>
            </Link>
          </Button>
        )*/}
        {!isOnWorkoutRoute && (
          <Button variant="theme">
            <Link
              href={workoutRoute}
              className={cn('flex items-center gap-2', isWorkoutFinished && 'animate-pulse')}
            >
              <Icons.Info className="size-4 opacity-50" />
              <span>{t('AvailableTopics.TrainingInfo')}</span>
            </Link>
          </Button>
        )}
        {/*!isOnWorkoutRoute &&
          ((hasHistoricalData && !isHistoricalPending) || isWorkoutStarted ? (
            <Button variant="theme">
              <Link href={workoutRoute} className="flex items-center gap-2">
                <Icons.Info className="size-4 opacity-50" />
                <span>{t('AvailableTopics.TrainingInfo')}</span>
              </Link>
            </Button>
          ) : isHistoricalPending ? (
            <Skeleton className="h-10 w-40" />
            ) : null)*/}
        {isWorkoutStarted && !isWorkoutFinished && (
          <Button onClick={finishWorkout} variant="theme" className="flex gap-2">
            <Icons.Flag className="size-4 opacity-50" />
            <span>{t('AvailableTopics.FinishTraining')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
