import React from 'react';

import { TPropsWithClassName } from '@/lib/types/react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { FormColumns, FormSection } from '@/components/shared';
import { isDev } from '@/constants';

export function InnerContentSkeleton({
  className,
  rows = 4,
  cols = 2,
}: TPropsWithClassName & { rows?: number; cols?: number }) {
  return (
    <div
      className={cn(
        isDev && '__GenerateQuestionsModal_InnerContentSkeleton', // DEBUG
        'flex size-full flex-col gap-4',
        className,
      )}
    >
      <Skeleton className="h-8 w-full shrink-0 rounded-lg" />
      <FormColumns>
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="flex w-full flex-col gap-6 md:flex-row">
            <FormSection>
              {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex w-full flex-col gap-2">
                  <Skeleton className="h-4 w-1/2 shrink-0 rounded-lg" />
                  <Skeleton className="h-10 w-full shrink-0 rounded-lg" />
                </div>
              ))}
            </FormSection>
          </div>
        ))}
      </FormColumns>
      <div className="flex w-full flex-wrap gap-2">
        <Skeleton className="h-10 w-32 max-w-full shrink-0 rounded-lg" />
        <Skeleton className="h-10 w-32 max-w-full shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

export function ContentSkeleton({ className }: TPropsWithClassName) {
  return (
    <div
      className={cn(
        isDev && '__GenerateQuestionsModal_ContentSkeleton', // DEBUG
        'flex w-full flex-col gap-6 px-6',
        'overflow-hidden',
        className,
      )}
    >
      {false && isDev && (
        <div className="text-sm opacity-50">__GenerateQuestionsModal_ContentSkeleton</div>
      )}
      <div className={cn('flex size-full flex-col gap-2')}>
        <Skeleton className="h-5 w-1/3 shrink-0 rounded-lg" />
        <Skeleton className="h-8 w-48 max-w-full shrink-0 rounded-lg" />
      </div>
      <InnerContentSkeleton />
    </div>
  );
}
