import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function PricingContentSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__PricingContentSkeleton', // DEBUG
        'flex w-full max-w-6xl flex-col px-6 pb-6',
        className,
      )}
    >
      {/* Hero Section Skeleton */}
      <section
        className={cn(
          isDev && '__PricingHeroSectionSkeleton', // DEBUG
          'flex flex-col items-center gap-2 py-6 text-center',
        )}
      >
        <Skeleton className="mt-6 h-12 w-3/4 max-w-2xl rounded text-5xl font-semibold" />
        <Skeleton className="mt-4 h-6 w-1/2 rounded text-lg" />
        <Skeleton className="mt-6 h-11 w-64 rounded" />
      </section>

      {/* Plans Section Skeleton */}
      <section
        className={cn(
          isDev && '__PricingPlansSectionSkeleton', // DEBUG
          'py-6',
        )}
      >
        <div className="grid gap-8 md:grid-cols-3">
          {/* Pro Plan Skeleton (popular) */}
          <div className="relative flex flex-col justify-between rounded-xl border bg-theme/10 p-6">
            <div className="mb-6">
              <Skeleton className="h-6 w-32 rounded text-xl font-bold text-theme" />
              <Skeleton className="mt-2 h-4 w-48 rounded text-sm" />
              <div className="mt-4">
                <div className="flex flex-wrap items-baseline gap-1">
                  <Skeleton className="h-9 w-40 rounded text-3xl font-bold" />
                </div>
              </div>
            </div>
            <hr className="my-4 bg-theme-800/5" />
            <ul className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full text-theme" />
                  <Skeleton className="h-4 flex-1 rounded" />
                </li>
              ))}
            </ul>
            <Skeleton className="mt-8 h-12 w-full rounded" />
          </div>

          {/* Basic and Premium Plan Skeletons */}
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border bg-theme/10 p-6"
            >
              <div className="mb-6">
                <Skeleton className="h-6 w-32 rounded text-xl font-bold text-theme" />
                <Skeleton className="mt-2 h-4 w-48 rounded text-sm" />
                <div className="mt-4">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <Skeleton className="h-9 w-40 rounded text-3xl font-bold" />
                  </div>
                </div>
              </div>
              <hr className="my-4 bg-theme-800/5" />
              <ul className="space-y-3">
                {[...Array(5)].map((j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full text-theme" />
                    <Skeleton className="h-4 flex-1 rounded" />
                  </li>
                ))}
              </ul>
              <Skeleton className="mt-8 h-12 w-full rounded" />
            </div>
          ))}
        </div>

        {/* Unlimited Plan Skeleton */}
        <div className="mt-8 flex flex-col items-start gap-6 rounded-xl border bg-theme/10 p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40 rounded text-xl font-bold text-theme" />
            <Skeleton className="h-4 w-64 rounded text-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded" />
        </div>
      </section>

      {/* Comparison Table Skeleton */}
      <section
        className={cn(
          isDev && '__PricingComparisonTableSkeleton', // DEBUG
          'mb-6 mt-2',
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full rounded-md">
            <thead className="sticky top-0 z-10 bg-theme-500 text-white">
              <tr>
                <th className="p-3 text-left"></th>
                <th className="p-3 text-center">
                  <Skeleton className="mx-auto h-6 w-24 rounded text-center" />
                </th>
                <th className="p-3 text-center">
                  <Skeleton className="mx-auto h-6 w-24 rounded text-center" />
                </th>
                <th className="p-3 text-center">
                  <Skeleton className="mx-auto h-6 w-24 rounded text-center" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                  <td className="p-3 font-medium">
                    <Skeleton className="h-4 w-48 rounded" />
                  </td>
                  <td className="p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-8 rounded" />
                  </td>
                  <td className="p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-8 rounded" />
                  </td>
                  <td className="p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-8 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
      </section>
    </div>
  );
}

export function PricingSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__PricingPageSkeleton', // DEBUG
        'size-full',
        'flex flex-1 flex-col items-center gap-2',
        className,
      )}
    >
      <PricingContentSkeleton />
    </div>
  );
}
