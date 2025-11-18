'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TWorkoutData } from '@/features/workouts/types';

interface TWorkoutInfoProps {
  workout: TWorkoutData | null;
  className?: string;
  omitNoWorkoutMessage?: boolean;
  hideTimes?: boolean;
}

export function WorkoutInfo(props: TWorkoutInfoProps) {
  const { workout, className, omitNoWorkoutMessage, hideTimes } = props;
  const format = useFormatter();

  if (!workout) {
    if (omitNoWorkoutMessage) {
      return null;
    }
    return (
      <div
        className={cn(
          isDev && '__WorkoutInfo_NoWorkout', // DEBUG
          'flex flex-col items-center gap-2 text-muted-foreground',
          'py-4 text-center',
          className,
        )}
      >
        {/*
        <Icons.Activity className="size-4 opacity-50" />
        <span>No training started yet</span>
        */}
        <Icons.Activity className="mx-auto mb-2 size-8 text-theme" />
        <p className="mb-2 text-lg text-foreground">
          Training progress data has not yet been collected
        </p>
        {/*historicalStats.totalWorkouts === 0 && (
          <p className="text-sm text-muted-foreground">
            {user
              ? 'This will be your first workout for this topic!'
              : 'Sign in to start collecting and monitoring your history tracks.'}
          </p>
          )*/}
      </div>
    );
  }

  const { started, finished, startedAt, finishedAt, questionsCount, stepIndex, currentRatio } =
    workout;

  const isInProgress = started && !finished;
  const completionPercentage =
    questionsCount && stepIndex !== null && stepIndex !== undefined
      ? Math.round(((stepIndex + 1) / questionsCount) * 100)
      : 0;

  return (
    <div
      className={cn(
        isDev && '__WorkoutInfo', // DEBUG
        'flex flex-wrap items-center gap-4',
        className,
      )}
    >
      {/* Training Status */}
      <span className="flex items-center gap-1" title="Training status">
        <Icons.Activity className="mr-1 size-4 opacity-50" />
        {isInProgress && <span className="text-blue-600">In Progress</span>}
        {finished ? (
          <span className="text-green-600">Completed</span>
        ) : !started ? (
          <span className="text-gray-500">Not Started</span>
        ) : null}
      </span>

      {/* Progress for active training */}
      {isInProgress && questionsCount && stepIndex !== null && stepIndex !== undefined && (
        <span className="flex items-center gap-1" title="Current progress">
          <Icons.ChartNoAxesGantt className="mr-1 size-4 opacity-50" />
          {stepIndex + 1}/{questionsCount} ({completionPercentage}%)
        </span>
      )}

      {/* Current session stats */}
      {isInProgress && currentRatio !== null && (
        <span className="flex items-center gap-1" title="Current session ratio">
          <Icons.LineChart className="mr-1 size-4 opacity-50" />
          {currentRatio}%
        </span>
      )}

      {/* Started date */}
      {!hideTimes && isInProgress && startedAt && (
        <span className="flex items-center gap-1" title="Started at">
          <Icons.Clock className="mr-1 size-4 opacity-50" />
          Started {getFormattedRelativeDate(format, startedAt)}
        </span>
      )}

      {/* Finished date */}
      {!hideTimes && !isInProgress && finishedAt && (
        <span className="flex items-center gap-1" title="Finished at">
          <Icons.Clock className="mr-1 size-4 opacity-50" />
          Finished {getFormattedRelativeDate(format, finishedAt)}
        </span>
      )}
    </div>
  );
}
