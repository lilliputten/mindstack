'use client';

import React from 'react';

import { availableTopicsRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { useGoToTheRoute } from '@/hooks';

import { WorkoutStateDetails } from './WorkoutStateDetails';

interface TWorkoutControlProps {
  className?: string;
  omitNoWorkoutMessage?: boolean;
}

export function WorkoutControl(props: TWorkoutControlProps) {
  const { className, omitNoWorkoutMessage } = props;

  const workoutContext = useWorkoutContext();
  const { topicId, workout, pending, startWorkout, questionIds } = workoutContext;
  const isWorkoutInProgress = workout?.started && !workout?.finished;
  const questionsCount = questionIds?.length || 0;
  const allowedTraining = !!questionsCount;

  const goToTheRoute = useGoToTheRoute();

  const handleResumeWorkout = () => {
    // console.log('[WorkoutControl:handleResumeWorkout]');
    goToTheRoute(`${availableTopicsRoute}/${topicId}/workout/go`);
  };

  const handleStartWorkout = () => {
    // console.log('[WorkoutControl:handleStartWorkout]');
    startWorkout();
    setTimeout(handleResumeWorkout, 10);
  };

  if (pending) {
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
        <Button onClick={handleStartWorkout} disabled={pending} className="flex w-fit gap-2">
          <Icons.Activity className="size-4 opacity-50" />
          <span>Start New Training</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(isDev && '__WorkoutControl', 'flex flex-col gap-4', className)}>
      <p className="text-sm text-muted-foreground">
        <WorkoutStateDetails workout={workout} />
      </p>
      <div className="flex gap-2">
        <Button
          onClick={isWorkoutInProgress ? handleResumeWorkout : handleStartWorkout}
          variant="default"
          className="flex gap-2"
          disabled={pending}
        >
          <Icons.Activity className="size-4 opacity-50" />
          <span>
            {workout.finished
              ? 'Restart Training'
              : workout.started
                ? 'Resume Training'
                : 'Start Training'}
          </span>
        </Button>
      </div>
    </div>
  );
}
