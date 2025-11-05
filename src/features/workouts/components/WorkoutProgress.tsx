import React from 'react';

import { generateArray } from '@/lib/helpers';
import { TReactPrimitive } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

export function WorkoutProgress() {
  const workoutContext = useWorkoutContext();
  const { workout, pending, questionIds } = workoutContext;
  const totalSteps = questionIds?.length || 0;
  const stepIndex = workout?.stepIndex || 0;
  const currentStep = stepIndex + 1;
  const selectedAnswerId = workout?.selectedAnswerId;
  const progressStep = selectedAnswerId ? currentStep : currentStep - 1;
  const stepProgressSize = totalSteps ? 100 / totalSteps : 0;
  const progress = progressStep * stepProgressSize;
  const questionResults = workout?.questionResults;
  const resultsUpacked = React.useMemo<TReactPrimitive[]>(
    () => (questionResults && JSON.parse(questionResults)) || [],
    [questionResults],
  );
  const values = React.useMemo(() => {
    return generateArray(currentStep).map(() => stepProgressSize);
  }, [currentStep, stepProgressSize]);
  const indicatorClassNames = React.useMemo(() => {
    return generateArray(currentStep).map((idx) => {
      let className =
        !selectedAnswerId && idx === currentStep - 1
          ? 'bg-theme-500/30 animate-pulse'
          : resultsUpacked[idx]
            ? 'bg-green-500/50'
            : 'bg-red-500/50';
      if (idx) {
        className += ' border-l border-background';
      }
      return className;
    });
  }, [currentStep, resultsUpacked, selectedAnswerId]);

  if (pending) {
    return (
      <div
        className={cn(
          isDev && '__WorkoutProgress_Skeleton', // DEBUG
          'flex flex-col gap-2 py-2',
        )}
      >
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  return (
    <div data-testid="__WorkoutProgress" className="space-y-2">
      <div
        className={cn(
          isDev && '__WorkoutProgress', // DEBUG
          'flex justify-between text-sm text-muted-foreground',
        )}
      >
        <span>
          Question {currentStep || 0} of {totalSteps || 0}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress
        value={progress}
        values={values}
        indicatorClassNames={indicatorClassNames}
        // indicatorClassName="bg-secondary-500"
        className={cn(
          isDev && '__WorkoutProgress_Progress', // DEBUG
          'h-2 bg-theme-500/10 transition',
        )}
      />
    </div>
  );
}
