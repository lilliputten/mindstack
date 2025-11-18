'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { formatSecondsDuration, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { TWorkoutData } from '@/features/workouts/types';

export function WorkoutStateDetails({ workout }: { workout?: TWorkoutData }) {
  const format = useFormatter();
  if (!workout) {
    return <>No workout created</>;
  }
  if (!workout.started || !workout.startedAt) {
    if (workout.finished && workout.finishedAt) {
      return (
        <>
          The workout is completed {getFormattedRelativeDate(format, workout.finishedAt)} in{' '}
          {formatSecondsDuration(workout.currentTime || 0)} with a ratio of{' '}
          {workout.currentRatio || 0}%{' '}
          <span className="opacity-50">
            ({workout.correctAnswers || 0} correct of {workout.questionsCount || 0} total answers)
          </span>
          .
        </>
      );
    }
    return <>Training hasn't been started yet</>;
  }
  if (workout.stepIndex) {
    return (
      <>
        Your workout is in progress ({workout.stepIndex + 1} of {workout.questionsCount || 0}{' '}
        questions, started {getFormattedRelativeDate(format, workout.startedAt)})
      </>
    );
  }
  return (
    <>
      The workout has been created {getFormattedRelativeDate(format, workout.startedAt)} and now is
      ready to start
    </>
  );
}
