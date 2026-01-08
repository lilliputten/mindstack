import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export const ContentSkeletonTable = GenericSkeleton;

export function ContentSkeleton({ className }: TPropsWithClassName) {
  return (
    <div
      className={cn(
        isDev && '__ManageCategoriesPage_ContentSkeleton', // DEBUG
        'flex size-full flex-col gap-6 py-6',
        'overflow-hidden',
        className,
      )}
    >
      {false && isDev && (
        <div className="text-sm opacity-50">__ManageCategoriesPage_ContentSkeleton</div>
      )}
      <Skeleton className="h-10 w-48 shrink-0 rounded-lg" />
      <Skeleton className="h-12 w-full shrink-0 rounded-lg" />
      <ContentSkeletonTable />
    </div>
  );
}
