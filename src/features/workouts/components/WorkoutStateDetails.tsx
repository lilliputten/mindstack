'use client';

import React from 'react';

import { useT } from '@/i18n';
import { ShowTimeSince } from '@/components/shared';
import { TWorkoutData } from '@/features/workouts/types';

export function WorkoutStateDetails({ workout }: { workout?: TWorkoutData }) {
  const t = useT();

  if (!workout) {
    return <>{t('WorkoutStats.NoWorkoutCreated')}</>;
  }

  if (!workout.started || !workout.startedAt) {
    if (workout.finished && workout.finishedAt) {
      return (
        <>
          {t.rich('WorkoutStats.TrainingCompletedDetails', {
            FinishedTime: () => <ShowTimeSince date={workout.finishedAt || undefined} />,
            DurationTime: () => (
              <ShowTimeSince date={(workout.currentTime || 0) * 1000} timeout={0} />
            ),
            ratioPercent: workout.currentRatio || 0,
          })}{' '}
          <span className="opacity-50">
            (
            {t('WorkoutStats.ratioDetails', {
              correctAnswers: workout.correctAnswers || 0,
              totalAnswers: workout.questionsCount || 0,
            })}
            )
          </span>
        </>
      );
    }
    return <>{t('WorkoutStats.TrainingHasntStarted')}</>;
  }

  if (workout.stepIndex) {
    return (
      <>
        {t.rich('WorkoutStats.ProgressInfo', {
          stepNo: workout.stepIndex + 1,
          stepsCount: workout.questionsCount || 0,
          StartedAt: () => <ShowTimeSince date={workout.startedAt || undefined} />,
        })}
      </>
    );
  }

  return (
    <>
      {t.rich('WorkoutStats.TrainingCreatedAndReadyToStart', {
        CreatedAt: () => <ShowTimeSince date={workout.startedAt || undefined} />,
      })}
    </>
  );
}
