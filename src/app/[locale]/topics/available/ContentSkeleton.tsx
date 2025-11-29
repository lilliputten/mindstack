import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function ContentListSkeleton({ className, items = 10 }: TProps & { items?: number }) {
  return (
    <div
      className={cn(
        isDev && '__AvailableTopicsPage_ContentListSkeleton', // DEBUG
        'size-full rounded-lg',
        'flex flex-col gap-4',
        'flex-1',
        'overflow-hidden',
        className,
      )}
    >
      {generateArray(items).map((i) => (
        <Skeleton key={i} className="h-32 w-full shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

export function ContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__AvailableTopicsPage_ContentSkeleton', // DEBUG
        'size-full rounded-lg',
        'flex flex-1 flex-col gap-4',
        className,
      )}
    >
      {false && isDev && <p className="opacity-50">AvailableTopicsPage_ContentSkeleton</p>}
      <Skeleton className="h-8 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <ContentListSkeleton />
    </div>
  );
}
