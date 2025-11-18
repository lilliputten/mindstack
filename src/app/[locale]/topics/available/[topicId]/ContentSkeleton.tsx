import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />

        {generateArray(2).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex flex-row gap-2">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}
