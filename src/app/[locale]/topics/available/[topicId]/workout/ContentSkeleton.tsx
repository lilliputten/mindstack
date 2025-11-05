import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  omitHeader?: boolean;
}

export function ContentSkeleton({ className, omitHeader }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__WorkoutTopic_ContentSkeleton', // DEBUG
        'flex size-full flex-1 flex-col gap-4 px-6',
        className,
      )}
    >
      {isDev && <p className="text-sm opacity-50">__WorkoutTopic_ContentSkeleton</p>}
      {!omitHeader && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <Skeleton className="h-8 w-1/3 rounded-lg" />
        </div>
      )}
      <div className="h-4" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-lg" />

        <div className="h-2" />

        <Skeleton className="h-4 w-2/3 rounded-lg" />

        <div className="h-2" />

        <Skeleton className="h-10 w-1/5 rounded-lg" />
      </div>
    </div>
  );
}
