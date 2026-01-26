import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function InnerSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__ViewAvailableTopic_InnerSkeleton', // DEBUG
        'flex flex-col gap-4',
        className,
      )}
    >
      {isDev && <p className="text-sm opacity-50">__ViewAvailableTopic_InnerSkeleton</p>}
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />

      {generateArray(3).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
      <div className="flex justify-center gap-2">
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
export function ContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__ViewAvailableTopic_ContentSkeleton', // DEBUG
        'flex size-full flex-1 flex-col gap-4 px-6',
        className,
      )}
    >
      {isDev && <p className="text-sm opacity-50">__ViewAvailableTopic_ContentSkeleton</p>}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-8 w-1/3 rounded-lg" />
      </div>
      <div className="h-4" />
      <InnerSkeleton />
    </div>
  );
}
