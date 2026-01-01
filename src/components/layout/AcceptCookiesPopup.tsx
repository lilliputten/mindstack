'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { cookiesAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useT } from '@/i18n';

export function AcceptCookiesPopup() {
  const t = useT();
  const [cookiesAccepted, setCookiesAccepted] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookiesAccepted(!!localStorage.getItem('cookies-accepted'));
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'yes');
    setCookiesAccepted(true);
  };

  if (cookiesAccepted !== false) {
    return null;
  }

  return (
    <div
      className={cn(
        isDev && '__AcceptCookiesPopup', // DEBUG
        'border-t p-4 sm:fixed sm:z-50',
        'bg-theme-600/80 text-white',
        'backdrop-blur-sm',
        'bottom-0',
        'sm:right-0 sm:mx-2 sm:mb-10 sm:rounded-lg',
        'max-sm:inset-x-0',
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('AcceptCookiesPopup.Message')}
          <a href={cookiesAliasRoute} className="ml-1 hover:underline">
            {t('AcceptCookiesPopup.LearnMore')}
          </a>
        </p>
        <Button
          onClick={handleAcceptCookies}
          size="sm"
          className="bg-white text-theme hover:bg-theme-600 hover:text-white"
        >
          {t('AcceptCookiesPopup.Accept')}
        </Button>
      </div>
    </div>
  );
}
