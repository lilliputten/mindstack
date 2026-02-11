import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

interface TProps {
  isBusy?: boolean;
  className?: string;
  noAbsolute?: boolean;
}

export function BusySplash({ isBusy, className, noAbsolute }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__BusySplash_LoadingSplash', // DEBUG
        !noAbsolute && 'absolute',
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'my-2 bg-background',
        'opacity-50',
        !isBusy && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.Spinner className="size-12 animate-spin text-theme" />
    </div>
  );
}
