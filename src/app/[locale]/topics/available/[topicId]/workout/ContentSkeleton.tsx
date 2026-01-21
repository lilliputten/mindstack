import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/constants';
import { WorkoutStatsSkeleton } from '@/features/workouts/components/WorkoutStatsSkeleton';

interface TProps {
  className?: string;
}

export function ContentSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 px-6">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
      </div>
      <WorkoutStatsSkeleton
        className={cn(
          isDev && '__WorkoutTopic_ContentSkeleton', // DEBUG
          'px-6',
        )}
      />
      <div className="flex flex-col gap-4 px-6">
        <Skeleton className="h-4 w-1/4 rounded-lg" />
        <Skeleton className="h-10 w-1/3 rounded-lg" />
      </div>
    </>
  );
}

export function PageSkeleton({ className }: TProps) {
  return (
    <PageWrapper
      className={cn(
        isDev && '__WorkoutTopic_PageSkeleton', // DEBUG
        className,
      )}
      innerClassName={cn('w-full rounded-lg gap-4 py-6')}
      limitWidth
    >
      {false && isDev && <p className="px-6 text-xs opacity-50">__WorkoutTopic_PageSkeleton</p>}
      <ContentSkeleton />
    </PageWrapper>
  );
}
