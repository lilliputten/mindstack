import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  items?: number;
}

export function ContentListSkeleton({ className, items = 10 }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsPage_ContentListSkeleton', // DEBUG
        'size-full rounded-lg',
        'flex flex-col gap-4',
        'flex-1',
        'overflow-hidden',
        className,
      )}
    >
      {generateArray(items).map((i) => (
        <Skeleton key={i} className="h-40 w-full shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

export function ContentSkeleton(props: TProps) {
  const { className, items } = props;
  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsPage_ContentSkeleton', // DEBUG
        'size-full rounded-lg',
        'flex flex-1 flex-col gap-4',
        className,
      )}
    >
      {false && isDev && <p className="opacity-50">AvailableWorkoutsPage_ContentSkeleton</p>}
      <Skeleton className="h-8 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <ContentListSkeleton items={items} />
    </div>
  );
}
