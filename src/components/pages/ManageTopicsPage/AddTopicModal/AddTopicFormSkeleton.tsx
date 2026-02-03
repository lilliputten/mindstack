import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

export function AddTopicFormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        isDev && '__AddTopicFormSkeleton', // DEBUG
        'flex w-full flex-col items-start gap-6 p-8',
        className,
      )}
    >
      {/* Topic Name Field */}
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-4 w-32" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
        <Skeleton className="h-4 w-48" /> {/* Form Message */}
      </div>

      {/* Categories Field */}
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-4 w-32" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Select */}
        <Skeleton className="h-4 w-48" /> {/* Hint */}
      </div>

      {/* Is Public Field */}
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-4 w-32" /> {/* Label */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-12 !rounded-full" /> {/* Switch */}
        </div>
        <Skeleton className="h-4 w-48" /> {/* Hint */}
        <Skeleton className="h-4 w-48" /> {/* Form Message */}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-28" /> {/* Submit Button */}
        <Skeleton className="h-10 w-20" /> {/* Cancel Button */}
      </div>
    </div>
  );
}
