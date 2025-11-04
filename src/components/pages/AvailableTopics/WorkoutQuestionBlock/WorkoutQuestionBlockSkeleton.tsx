import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  answersCount?: number;
}

export function WorkoutQuestionBlockSkeleton({ className, answersCount = 2 }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__WorkoutQuestionBlockSkeleton', // DEBUG
        'flex flex-col gap-4 py-2',
        className,
      )}
    >
      {isDev && <p className="text-sm opacity-50">__WorkoutQuestionBlockSkeleton</p>}
      <Skeleton className="h-10 w-full" />
      {/* Emulate answers */}
      <div className="grid gap-4 py-2 lg:grid-cols-2">
        {generateArray(answersCount).map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      {/* Emulate buttons */}
      <div className="flex justify-center gap-4">
        {generateArray(2).map((i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>
    </div>
  );
}
