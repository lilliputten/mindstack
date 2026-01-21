'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/routing';
import { defaultLocale, TLocale } from '@/i18n/types';

export function useSwitchRouterLocale() {
  // const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const switchRouterLocale = React.useCallback(
    (nextLocale: TLocale = defaultLocale) => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale },
      );
    },
    [params, pathname, router],
  );

  return { switchRouterLocale };
}
