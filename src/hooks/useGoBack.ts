import React from 'react';
import { useRouter } from 'next/navigation';

import { rootAliasRoute } from '@/config';

export function useGoBack(failbackRoute?: string) {
  const router = useRouter();
  const goBack = React.useCallback(() => {
    const { href } = window.location;
    router.back();
    setTimeout(() => {
      // If still on the same page after trying to go back, fallback
      if (document.visibilityState === 'visible' && href === window.location.href) {
        router.push(failbackRoute || rootAliasRoute);
      }
    }, 200);
  }, [router, failbackRoute]);

  return goBack;
}
