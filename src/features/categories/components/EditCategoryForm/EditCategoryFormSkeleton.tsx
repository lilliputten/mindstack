import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';

export function EditCategoryFormSkeleton({ className }: TPropsWithClassName) {
  return (
    <div
      className={cn(
        isDev && '__EditCategoryFormSkeleton', // DEBUG
        'flex w-full flex-col gap-4 p-6',
        className,
      )}
    >
      {/* Image Upload Skeleton */}
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-4 w-16 rounded" /> {/* Label */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-48 rounded" /> {/* Hint */}
            <Skeleton className="h-4 w-32 rounded" /> {/* FormMessage */}
          </div>
        </div>
      </div>

      {/* Instruction for users */}
      <div className="flex items-center gap-2 rounded-md border border-theme/10 p-2">
        <Skeleton className="size-6 flex-shrink-0 rounded-full" />
        <Skeleton className="h-4 flex-1 rounded" />
      </div>

      {/* Error message placeholder */}
      <div className="flex items-center gap-2 rounded-md border border-theme/10 p-2">
        <Skeleton className="size-6 flex-shrink-0 rounded" />
        <Skeleton className="h-4 flex-1 rounded" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-col items-stretch gap-2">
        {/* Tab List */}
        <div className="flex flex-1 justify-start gap-1">
          {generateArray(3).map((i) => (
            <Skeleton key={i} className="h-8 w-24 flex-1 rounded" />
          ))}
        </div>

        {/* Tab Content for each locale */}
        <div className="flex flex-1 flex-col items-start gap-4">
          {/* Name field */}
          <div className="flex w-full flex-col gap-4">
            <Skeleton className="h-4 w-24 rounded" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded" /> {/* Input */}
            <Skeleton className="h-4 w-32 rounded" /> {/* FormMessage */}
          </div>
        </div>
      </div>

      {/* Status field - only if not in suggestion mode */}
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-4 w-16 rounded" /> {/* Label */}
        <Skeleton className="h-10 w-full rounded" /> {/* Select */}
        <Skeleton className="h-4 w-32 rounded" /> {/* FormMessage */}
      </div>

      {/* Actions */}
      <div className="mt-4 flex w-full gap-4">
        <Skeleton className="h-10 w-24 rounded" /> {/* Submit button */}
        <Skeleton className="h-10 w-20 rounded" /> {/* Cancel button */}
      </div>
    </div>
  );
}
