import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { WorkoutQuestionBlockSkeleton } from '@/components/pages/AvailableTopics/WorkoutQuestionBlock/WorkoutQuestionBlockSkeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  omitHeader?: boolean;
  answersCount?: number;
}

export function InnerSkeleton({ className, answersCount = 3 }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__WorkoutTopicGo_InnerSkeleton', // DEBUG
        'flex flex-col gap-4 px-6',
        className,
      )}
    >
      <Skeleton className="h-4 w-4/5 rounded-lg" />

      <Skeleton className="h-4 w-1/3 rounded-lg" />
      <Skeleton className="h-2 w-full rounded-lg" />

      <WorkoutQuestionBlockSkeleton answersCount={answersCount} />
    </div>
  );
}

export function ContentSkeleton({ className, omitHeader, answersCount = 3 }: TProps) {
  return (
    <PageWrapper
      className={cn(
        isDev && '__WorkoutTopicGo_ContentSkeleton', // DEBUG
        // 'flex size-full flex-1 flex-col gap-4 px-6',
        className,
      )}
      innerClassName={cn(
        isDev && '__WorkoutTopicGo_ContentSkeleton_Inner', // DEBUG
        'w-full gap-4 py-6',
      )}
      limitWidth
    >
      {false && isDev && (
        <p className="px-6 text-sm opacity-50">__WorkoutTopicGo_ContentSkeleton</p>
      )}
      {!omitHeader && (
        <>
          <div className="flex flex-col gap-4 px-6">
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <Skeleton className="h-10 w-1/2 rounded-lg" />
          </div>
        </>
      )}
      <InnerSkeleton answersCount={answersCount} />
    </PageWrapper>
  );
}
