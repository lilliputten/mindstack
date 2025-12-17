import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  rows?: number;
}

export function TextContentSkeleton({ className, rows = 40 }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__TextContentSkeleton', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      <Skeleton className="mb-4 mt-2 h-12 w-3/5" />
      <Skeleton className="mb-4 h-8 w-1/3" />
      {generateArray(rows).map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function TextPageSkeleton(props: TProps) {
  const { className, rows } = props;
  return (
    <div
      className={cn(
        isDev && '__TextPageSkeleton', // DEBUG
        'size-full',
        'flex flex-1 flex-col items-center gap-2',
        className,
      )}
    >
      <TextContentSkeleton rows={rows} className="max-w-6xl p-6" />
    </div>
  );
}
