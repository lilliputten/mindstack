import React from 'react';

import { siteTitle, versionInfo } from '@/config/env';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/constants';

export function NavFooter() {
  const t = useT();
  const rootTitle = t('Pages.RootTitle') || siteTitle;
  // Effect: Show app info in the console
  React.useEffect(() => {
    // NOTE: Show app info
    // eslint-disable-next-line no-console
    console.log(siteTitle, versionInfo);
  }, []);
  return (
    <div
      className={cn(
        isDev && '__NavFooter', // DEBUG
        'relative flex w-full px-6',
        'bg-theme-600',
        'text-white',
      )}
    >
      <div
        className={cn(
          isDev && '__NavFooter_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient',
          'after-header-decor',
          'opacity-50',
          'z-0',
        )}
      />
      <div className="z-10 flex flex-row items-center gap-3 truncate py-1 text-sm opacity-70">
        <span className="truncate">{rootTitle} </span>
        <span className="truncate opacity-50 max-xs:hidden">{versionInfo?.split(' ')[0]}</span>
      </div>
    </div>
  );
}
