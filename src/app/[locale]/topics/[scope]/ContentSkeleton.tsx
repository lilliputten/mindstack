import React from 'react';

import { TPropsWithClassName } from '@/lib/types/react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

export function ContentSkeletonTable({
  className,
  rows = 20,
}: TPropsWithClassName & { rows?: number }) {
  return (
    <div
      className={cn(
        isDev && '__ManageTopicsPage_ContentSkeletonTable', // DEBUG
        'flex size-full flex-col gap-1',
        className,
      )}
    >
      <Skeleton className="h-12 w-full shrink-0 rounded-lg" />
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full shrink-0 rounded-lg" />
      ))}
    </div>
  );
}
export function ContentSkeleton({ className }: TPropsWithClassName) {
  return (
    <div
      className={cn(
        isDev && '__ManageTopicsPage_ContentSkeleton', // DEBUG
        'flex size-full flex-col gap-6 py-6',
        'overflow-hidden',
        className,
      )}
    >
      {false && isDev && (
        <div className="text-sm opacity-50">__ManageTopicsPage_ContentSkeleton</div>
      )}
      <Skeleton className="h-10 w-48 shrink-0 rounded-lg" />
      <Skeleton className="h-12 w-full shrink-0 rounded-lg" />
      <ContentSkeletonTable />
    </div>
  );
}
