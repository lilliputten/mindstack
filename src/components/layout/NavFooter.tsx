import React from 'react';

import { siteTitle, versionInfo } from '@/config/env';
import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

export function NavFooter() {
  // Effect: Show app info in the console
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[NavFooter]', siteTitle, versionInfo);
  }, []);
  return (
    <div
      className={cn(
        isDev && '__NavFooter', // DEBUG
        'relative flex w-full px-6',
        'bg-theme-400/70',
        'text-white',
      )}
    >
      <div
        className={cn(
          isDev && '__NavFooter_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient',
          'opacity-50',
          'z-0',
        )}
      />
      <div className="flex flex-row items-center gap-3 truncate py-1">
        <span>{siteTitle} </span>
        <span className="truncate text-xs opacity-50">{versionInfo}</span>
      </div>
    </div>
  );
}
