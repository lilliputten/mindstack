'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { formatSecondsDuration, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { TWorkoutData } from '@/features/workouts/types';
import { useT } from '@/i18n';

export function WorkoutStateDetails({ workout }: { workout?: TWorkoutData }) {
  const format = useFormatter();
  const t = useT();

  if (!workout) {
    return <>{t('WorkoutStats.NoWorkoutCreated')}</>;
  }
  if (!workout.started || !workout.startedAt) {
    if (workout.finished && workout.finishedAt) {
      return (
        <>
          {t('WorkoutStats.TrainingIsCompleted')}{' '}
          {getFormattedRelativeDate(format, workout.finishedAt)} in{' '}
          {formatSecondsDuration(workout.currentTime || 0)} with a ratio of{' '}
          {workout.currentRatio || 0}%{' '}
          <span className="opacity-50">
            ({workout.correctAnswers || 0} correct of {workout.questionsCount || 0} total answers)
          </span>
          .
        </>
      );
    }
    return <>{t('WorkoutStats.TrainingHasntStarted')}</>;
  }
  if (workout.stepIndex) {
    return (
      <>
        {t('WorkoutStats.TrainingInProgress')} ({workout.stepIndex + 1} of{' '}
        {workout.questionsCount || 0} questions, started{' '}
        {getFormattedRelativeDate(format, workout.startedAt)})
      </>
    );
  }
  return (
    <>
      {t('WorkoutStats.TrainingReadyToStart')} {getFormattedRelativeDate(format, workout.startedAt)}{' '}
      and now is ready to start
    </>
  );
}
