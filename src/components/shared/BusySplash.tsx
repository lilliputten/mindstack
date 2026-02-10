import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

export function BusySplash({ isBusy, className }: { isBusy?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        isDev && '__BusySplash_LoadingSplash', // DEBUG
        'absolute',
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'my-2 bg-background',
        'opacity-50',
        !isBusy && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.Spinner className="size-16 animate-spin text-theme" />
    </div>
  );
}
