'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
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
    finishWorkout,
    questionIds,
  } = workoutContext;
  const isWorkoutFinished = workout?.finished;
  const isWorkoutStarted = workout?.started;
  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;

  const goToTheRoute = useGoToTheRoute();
  const pathname = usePathname();
  const workoutRoute = `${availableTopicsRoute}/${topicId}/workout` as TRoutePath;
  const isOnWorkoutRoute = comparePathsWithoutLocalePrefix(workoutRoute, pathname);
  const workoutGoRoute = `${availableTopicsRoute}/${topicId}/workout/go` as TRoutePath;

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
          <span className="truncate">{t('AvailableTopics.StartNewTraining')}</span>
        </Button>
      </div>
    );
  }

  const isWorkoutActive = isWorkoutStarted && !isWorkoutFinished;

  return (
    <div
      className={cn(
        isDev && '__WorkoutControl', // DEBUG
        'content-truncate flex flex-col gap-4',
        className,
      )}
    >
      <p
        className={cn(
          isDev && '__WorkoutControl_Info', // DEBUG
          'content-truncate text-center text-sm',
        )}
      >
        <WorkoutStateDetails workout={workout} />
      </p>
      <div
        className={cn(
          isDev && '__WorkoutControl_Actions', // DEBUG
          'content-truncate flex flex-wrap justify-center gap-2',
        )}
      >
        <Button
          onClick={handleGoWorkout}
          variant={!isOnWorkoutRoute && isWorkoutFinished ? 'outline' : 'theme'}
          className="content-truncate flex items-center gap-2"
        >
          <Icons.Rocket className="size-4 opacity-50" />
          <span className="truncate">
            {isWorkoutFinished
              ? t('AvailableTopics.RestartTraining')
              : isWorkoutStarted
                ? t('AvailableTopics.ResumeTraining')
                : t('AvailableTopics.StartTraining')}
          </span>
        </Button>
        {!isOnWorkoutRoute && (
          <Link
            href={workoutRoute}
            className={cn(
              buttonVariants({ variant: 'theme' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Info className="size-4 opacity-50" />
            <span className="truncate">{t('AvailableTopics.TrainingInfo')}</span>
          </Link>
        )}
        {isWorkoutActive && (
          <Button
            onClick={finishWorkout}
            variant="theme"
            className="content-truncate flex items-center gap-2"
          >
            <Icons.Flag className="size-4 opacity-50" />
            <span className="truncate">{t('AvailableTopics.FinishTraining')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
