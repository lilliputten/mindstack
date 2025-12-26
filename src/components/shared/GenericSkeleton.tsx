import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function GenericContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__TextContentSkeleton', // DEBUG
        'flex h-full w-full flex-1 flex-col gap-4',
        className,
      )}
    >
      <Skeleton className="h-full w-full flex-1" />
    </div>
  );
}

export function GenericSkeleton(props: TProps) {
  const { className } = props;
  return (
    <div
      className={cn(
        isDev && '__GenericSkeleton', // DEBUG
        'size-full',
        'flex flex-1 flex-col items-center gap-2',
        className,
      )}
    >
      <GenericContentSkeleton className="max-w-6xl p-6" />
    </div>
  );
}
