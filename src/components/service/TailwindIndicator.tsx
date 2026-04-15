import { cn } from '@/lib/utils';
import { isDev } from '@/config';

export function TailwindIndicator() {
  if (!isDev) {
    return null;
  }

  return (
    <div
      role="status"
      className={cn(
        isDev && '__TailwindIndicator', // DEBUG
        'fixed',
        'bottom-4',
        'right-4',
        'z-[99]',
        'flex',
        'size-6',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-[rgb(28,28,30)]',
        'border',
        'border-white/15',
        'p-3.5',
        'font-mono',
        'text-xs',
        'text-white',
      )}
    >
      <div className="block xs:hidden">xxs</div>
      <div className="hidden xs:max-sm:block">xs</div>
      <div className="hidden sm:max-md:block">sm</div>
      <div className="hidden md:max-lg:block">md</div>
      <div className="hidden lg:max-xl:block">lg</div>
      <div className="hidden xl:max-2xl:block">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}
