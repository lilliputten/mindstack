import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';

const __showDebugInfo = false;

interface TProps {
  className?: string;
  items?: number;
}

export function ContentSkeletonTable({ className, items = 10 }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__AvailableCategoriesPage_ContentListSkeleton', // DEBUG
        'size-full rounded-lg',
        'flex flex-col gap-4',
        'flex-1',
        'overflow-hidden',
        className,
      )}
    >
      {generateArray(items).map((i) => (
        <Skeleton key={i} className="h-14 w-full shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

export function ContentSkeleton(props: TProps) {
  const { className, items } = props;
  return (
    <PageWrapper
      className={cn(
        isDev && '__ManageCategoriesPage_ContentSkeleton', // DEBUG
        className,
      )}
      innerClassName={cn(
        isDev && '__ManageCategoriesPage_ContentSkeleton_Inner', // DEBUG class for inner container
        'w-full rounded-lg gap-6',
      )}
      limitWidth
    >
      {__showDebugInfo && isDev ? (
        <DashboardHeader
          heading="__ManageCategoriesPage_ContentSkeleton_DashboardHeader"
          className={cn(
            isDev && '__ManageCategoriesPage_ContentSkeleton_DashboardHeader', // DEBUG
          )}
        />
      ) : (
        <Skeleton className="h-10 w-2/5 shrink-0 rounded-lg" />
      )}
      <Skeleton className="h-12 w-full shrink-0 rounded-lg" />
      <ContentSkeletonTable items={items} />
    </PageWrapper>
  );
}
