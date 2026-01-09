import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { GenericContentSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export const ContentSkeletonTable = GenericContentSkeleton;

const __showDebugInfo = true;

export function ContentSkeleton({ className }: TPropsWithClassName) {
  return (
    <PageWrapper
      className={cn(
        isDev && '__ManageCategoriesPage_ContentSkeleton', // DEBUG
        className,
      )}
      innerClassName={cn(
        isDev && '__ManageCategoriesPage_ContentSkeleton_Inner', // DEBUG class for inner container
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
    >
      {__showDebugInfo && isDev ? (
        <DashboardHeader
          heading="__ManageCategoriesPage_ContentSkeleton_DashboardHeader"
          className={cn(
            isDev && '__ManageCategoriesPage_ContentSkeleton_DashboardHeader', // DEBUG
            'mx-6',
          )}
          // breadcrumbs={breadcrumbs}
          // actions={actions}
        />
      ) : (
        <Skeleton className="mx-6 h-10 w-48 shrink-0 rounded-lg" />
      )}
      <Skeleton className="mx-6 h-12 w-full shrink-0 rounded-lg" />
      <ContentSkeletonTable className="mx-6" />
    </PageWrapper>
  );
}
