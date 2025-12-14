import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function TextContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__ContentSkeleton', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      <Skeleton className="mb-4 h-12 w-2/5" />
      {generateArray(10).map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function TextPageSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__PageSkeleton', // DEBUG
        'size-full',
        'flex flex-1 flex-col items-center justify-center gap-2',
        className,
      )}
    >
      <TextContentSkeleton className="max-w-6xl p-6" />
    </div>
  );
}
