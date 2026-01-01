import { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes';

// 0. Root route
export const publicRootRoute = '/';

// 1. Public content routes (without sidebar)
export const publicAboutRoute = '/about';
export const publicContactsRoute = '/contacts';
export const publicDocsRoute = '/docs';
export const publicPricingRoute = '/pricing';
export const publicWelcomeRoute = '/welcome';

// 2. Legal page routes
export const legalCookiesRoute = '/legal/cookies';
export const legalOfferRoute = '/legal/offer';
export const legalPrivacyRoute = '/legal/privacy';
export const legalTermsRoute = '/legal/terms';

// 3. Open routes (availale for guests)
export const availableTopicsRoute = '/topics/available';
export const settingsRoute = '/settings';

// 4. User-only allowed routes
export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const adminBotControlRoute = '/admin/bot/control';
export const adminRoute = '/admin';
export const allTopicsRoute = '/topics/all';
export const authErrorRoute = '/auth/error';
export const myTopicsRoute = '/topics/my';

// 5. Subsription routes
export const pricingChooseRoute = '/pricing/choose';

// 6. Alias routes
/** Default route for guests */
export const startAliasRoute = '/start';
/** Default route for authorized users */
export const userStartAliasRoute = '/start/user';

// Export aliases lists for the nextjs config
export const staticRedirects: Redirect[] = [
  /* // Sample
   * {
   *   source: startAliasRoute,
   *   destination: availableTopicsRoute,
   *   permanent: false, // To specify a 308 status for the permanent redirect or a 307 otherwise
   * },
   */
  { source: userStartAliasRoute, destination: myTopicsRoute, permanent: true },
  { source: startAliasRoute, destination: availableTopicsRoute, permanent: true },
  { source: '/cookies', destination: legalCookiesRoute, permanent: true },
  { source: '/offer', destination: legalOfferRoute, permanent: true },
  { source: '/privacy', destination: legalPrivacyRoute, permanent: true },
  { source: '/terms', destination: legalTermsRoute, permanent: true },
] as const;
export const staticRewrites: Rewrite[] = [
  /* // Sample
   * {
   *   source: startAliasRoute,
   *   destination: availableTopicsRoute,
   * },
   */
] as const;

/** All used routes */
export const allRoutes = [
  // 0. Root route
  publicRootRoute,

  // 1. Public content routes (without sidebar)
  publicAboutRoute,
  publicContactsRoute,
  publicDocsRoute,
  publicPricingRoute,
  publicWelcomeRoute,

  // 2. Legal page routes
  legalCookiesRoute,
  legalOfferRoute,
  legalPrivacyRoute,
  legalTermsRoute,

  // 3. Open routes (availale for guests)
  availableTopicsRoute,
  settingsRoute,

  // 4. User-only allowed routes
  adminAiTestTextQueryRoute,
  adminBotControlRoute,
  adminRoute,
  allTopicsRoute,
  myTopicsRoute,

  // 5. Subsription routes
  pricingChooseRoute,

  // 6. Alias routes
  startAliasRoute,
  userStartAliasRoute,
] as const;
export type TRoutePath = (typeof allRoutes)[number];
export type TAnyRoutePath = string | TRoutePath;

/** NOTE: That's used only to mock real intl context */
export const pathnames = allRoutes.reduce(
  (all, path) => {
    all[path] = path;
    return all;
  },
  {} as Record<TRoutePath, TRoutePath>,
);

/** All routes to display without dashboard sidebar. */
export const routesWithoutSidebar: TRoutePath[] = [
  // Root route
  publicRootRoute,

  // Public content routes (without sidebar)
  legalCookiesRoute,
  publicDocsRoute,
  publicPricingRoute,
  legalPrivacyRoute,
  // publicStartRoute, // Don't include here, while it's only an alias for 'availableTopicsRoute`
  legalTermsRoute,
  publicWelcomeRoute,
];
