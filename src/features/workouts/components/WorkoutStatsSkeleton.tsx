import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
}

export function WorkoutStatsSkeleton({ className }: TProps) {
  return (
    <div
      className={cn(
        // isDev && '__WorkoutStatsSkeleton', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      {false && isDev && <p className="text-xs opacity-50">__WorkoutStatsSkeleton</p>}
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
