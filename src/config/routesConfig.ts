import { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes';

// 0. Root route
export const publicRootRoute = '/public';

// 1. Public content routes (without sidebar, see root aliases below)
export const publicAboutRoute = '/public/about';
export const publicContactsRoute = '/public/contacts';
export const publicDocsRoute = '/public/docs';
export const publicPricingRoute = '/public/pricing';
export const publicWelcomeRoute = '/public/welcome';

// 2. Legal page routes (without sidebar, see root aliases below)
export const legalCookiesRoute = '/legal/cookies';
export const legalOfferRoute = '/legal/offer';
export const legalPrivacyRoute = '/legal/privacy';
export const legalTermsRoute = '/legal/terms';

// 3. Open routes (availale for guests, see aliases)
export const rootCategoriesRoute = '/categories';
export const availableCategoriesRoute = '/categories/available';
export const availableTopicsRoute = '/topics/available';
export const recentTrainingsRoute = '/trainings/recent'
export const settingsRoute = '/settings';

// 4. User-only allowed routes
export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const adminBotControlRoute = '/admin/bot/control';
export const adminRoute = '/admin';
export const manageCategoriesRoute = '/categories/manage';
export const allTopicsRoute = '/topics/all';
export const authErrorRoute = '/auth/error';
export const myTopicsRoute = '/topics/my';

// 5. Subsription routes
export const pricingChooseRoute = '/pricing/choose';

// 6. Alias routes
export const rootAliasRoute = '/';
export const rootTrainingsRoute = '/trainings'; // -> recentTrainingsRoute

// 6.1. Public content routes (without sidebar)
export const aboutAliasRoute = '/about';
export const contactsAliasRoute = '/contacts';
export const docsAliasRoute = '/docs';
export const pricingAliasRoute = '/pricing';
export const welcomeAliasRoute = '/welcome';

// 6.2. Legal page routes
export const cookiesAliasRoute = '/cookies';
export const offerAliasRoute = '/offer';
export const privacyAliasRoute = '/privacy';
export const termsAliasRoute = '/terms';

// 6.3. Redirect routes
/** Default route for guests */
export const startAliasRoute = '/start';
/** Default route for authorized users */
export const userStartAliasRoute = '/start/user';

// Export aliases lists for the nextjs config
export const staticRewrites: Rewrite[] = [
  // 6.0. Root route
  { source: rootAliasRoute, destination: publicRootRoute },
  // 6.1. Public content routes (without sidebar)
  { source: aboutAliasRoute, destination: publicAboutRoute },
  { source: contactsAliasRoute, destination: publicContactsRoute },
  { source: docsAliasRoute, destination: publicDocsRoute },
  { source: pricingAliasRoute, destination: publicPricingRoute },
  { source: welcomeAliasRoute, destination: publicWelcomeRoute },
  // 6.2. Legal page routes
  { source: cookiesAliasRoute, destination: legalCookiesRoute },
  { source: offerAliasRoute, destination: legalOfferRoute },
  { source: privacyAliasRoute, destination: legalPrivacyRoute },
  { source: termsAliasRoute, destination: legalTermsRoute },
] as const;
export const staticRedirects: Redirect[] = [
  // 6.3. Redirects
  { source: userStartAliasRoute, destination: myTopicsRoute, permanent: true },
  { source: startAliasRoute, destination: availableTopicsRoute, permanent: true },
  { source: rootCategoriesRoute, destination: availableCategoriesRoute, permanent: true },
  { source: rootTrainingsRoute, destination: recentTrainingsRoute, permanent: true },
] as const;

export const rewritedRoutes = staticRewrites.map(({ destination }) => destination);
export const redirectedRoutes = staticRedirects.map(({ destination }) => destination);
export const aliasedRoutes = rewritedRoutes.concat(redirectedRoutes);

/** All used routes */
const allRoutes = [
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
  rootCategoriesRoute,
  rootTrainingsRoute,
  availableCategoriesRoute,
  recentTrainingsRoute,
  availableTopicsRoute,
  settingsRoute,

  // 4. User-only allowed routes
  adminAiTestTextQueryRoute,
  adminBotControlRoute,
  adminRoute,
  manageCategoriesRoute,
  allTopicsRoute,
  myTopicsRoute,

  // 5. Subsription routes
  pricingChooseRoute,

  // NOTE: Put aliases first in order to produce nicier sitemap
  // 6. Alias routes
  rootAliasRoute,
  // 6.1. Public content routes (without sidebar)
  aboutAliasRoute,
  contactsAliasRoute,
  docsAliasRoute,
  pricingAliasRoute,
  welcomeAliasRoute,
  // 6.2. Legal page routes
  cookiesAliasRoute,
  offerAliasRoute,
  privacyAliasRoute,
  termsAliasRoute,
  // 6.3. Redirects
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

/** Public routes */
export const publicRoutes: TRoutePath[] = [
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
  // settingsRoute,

  // 6. Alias routes
  rootAliasRoute,
  // 6.1. Public content routes (without sidebar)
  aboutAliasRoute,
  contactsAliasRoute,
  docsAliasRoute,
  pricingAliasRoute,
  welcomeAliasRoute,
  // 6.2. Legal page routes
  cookiesAliasRoute,
  offerAliasRoute,
  privacyAliasRoute,
  termsAliasRoute,
  // 6.3. Redirects
  startAliasRoute,
  userStartAliasRoute,
] as const;

/** Public routes which should contain sidebars */
const publicRoutesWithSidebar: TRoutePath[] = [
  // 3. Open routes (availale for guests)
  availableTopicsRoute,
  settingsRoute,
  // 6.3. Redirects
  startAliasRoute,
  userStartAliasRoute,
];

/** All routes to display without dashboard sidebar. */
export const routesWithoutSidebar: TRoutePath[] = publicRoutes.filter(
  (r) => !publicRoutesWithSidebar.includes(r),
);
