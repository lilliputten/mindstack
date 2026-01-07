import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';

interface TProps {
  className?: string;
}

export function PricingChooseContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__PricingChooseContentSkeleton', // DEBUG
        'flex w-full max-w-6xl flex-col px-6 pb-6',
        className,
      )}
    >
      <div className="mb-12 flex flex-col items-center text-center">
        <Skeleton
          className={cn(
            isDev && '__PricingChoosePage_Title', // DEBUG
            'mb-6 mt-12 p-4',
            'h-10 w-2/3 max-w-full',
            'md:h-12',
          )}
        />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-4 text-lg">
          <div className="flex flex-wrap items-baseline gap-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-32 max-w-full rounded" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          isDev && '__PricingChoosePage_Cards', // DEBUG
          'grid gap-6',
          'md:grid-cols-2',
          '2xl:grid-cols-3',
        )}
      >
        {/* Russian and International Card Skeletons */}
        {generateArray(2).map((i) => (
          <div
            key={i}
            className="relative flex flex-col justify-between rounded-md bg-theme/10 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-6 w-40 rounded" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        ))}

        {/* Telegram Stars Skeleton */}
        <div className="relative flex flex-col justify-between rounded-md bg-theme/10 p-6 md:col-span-2 2xl:md:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-6 w-40 rounded" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center text-center">
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function PricingChooseSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__PricingPageSkeleton', // DEBUG
        'flex size-full flex-1 flex-col items-center justify-center',
        className,
      )}
    >
      <div className="flex w-full flex-col items-center overflow-hidden">
        <PricingChooseContentSkeleton />
      </div>
    </div>
  );
}
