import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    /* // UNUSED: Locales are passed in `routing`, via `createMiddleware`.
     * // Set a cookie to remember the previous locale for
     * // all requests that have a locale prefix
     * '/(en|es|ru)/:path*',
     */

    // Enable redirects that add missing locales but exclude system paths
    '/((?!api|_next|_vercel|favicon|.well-known|static|.*\\..*).*)',
  ],
};
