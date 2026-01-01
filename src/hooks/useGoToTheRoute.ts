import React from 'react';
import { useRouter } from 'next/navigation';

import { rootAliasRoute } from '@/config';

export function useGoToTheRoute() {
  const router = useRouter();
  /** Go to the route (via push or replace, according to the `replace` parameter */
  const goToTheRoute = React.useCallback(
    /** A callback to make a redirect
     * @param {string} [routePath] - Route string, is the root route by default.
     * @param {boolean} [replace] - To replace the route instead of push it.
     */
    (routePath: string = rootAliasRoute, replace?: boolean) => {
      if (replace) {
        router.replace(routePath);
      } else {
        router.push(routePath);
      }
    },
    [router],
  );

  return goToTheRoute;
}
