export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const adminBotControlRoute = '/admin/bot/control';
export const adminRoute = '/admin';
export const allTopicsRoute = '/topics/all';
export const authErrorRoute = '/auth/error';
export const availableTopicsRoute = '/topics/available'; // Example
export const dashboardRoute = '/dashboard';
export const myTopicsRoute = '/topics/my';
export const settingsRoute = '/settings';

// Root route
export const publicRootRoute = '/';

// Alias routes
export const publicStartRoute = availableTopicsRoute; // '/start';

// Public content routes (without sidebar)
export const publicAboutRoute = '/about';
export const publicDocsRoute = '/docs';
export const publicPricingRoute = '/pricing';
export const publicWelcomeRoute = '/welcome';

// Legal page routes
export const legalCookiesRoute = '/legal/cookies';
export const legalOfferRoute = '/legal/offer';
export const legalPrivacyRoute = '/legal/privacy';
export const legalTermsRoute = '/legal/terms';

/** NOTE: That's used only to mock real intl context */
export const pathnames = {
  [publicAboutRoute]: publicAboutRoute,
  [adminAiTestTextQueryRoute]: adminAiTestTextQueryRoute,
  [adminBotControlRoute]: adminBotControlRoute,
  [adminRoute]: adminRoute,
  [allTopicsRoute]: allTopicsRoute,
  [availableTopicsRoute]: availableTopicsRoute,
  [dashboardRoute]: dashboardRoute,
  [publicDocsRoute]: publicDocsRoute,
  [myTopicsRoute]: myTopicsRoute,
  [settingsRoute]: settingsRoute,
  [publicWelcomeRoute]: publicWelcomeRoute,

  // Public routes (without sidebar)
  [publicRootRoute]: publicRootRoute,
  [publicPricingRoute]: publicPricingRoute,

  // Legal pages
  [legalCookiesRoute]: legalCookiesRoute,
  [legalOfferRoute]: legalOfferRoute,
  [legalPrivacyRoute]: legalPrivacyRoute,
  [legalTermsRoute]: legalTermsRoute,
};

/** All routes to display without dashboard sidebar. */
export const routesWithoutSidebar = [
  // Root route
  publicRootRoute,

  // Public content routes (without sidebar)
  legalCookiesRoute,
  publicDocsRoute,
  publicPricingRoute,
  legalPrivacyRoute,
  // publicStartRoute, // Don't include here, while it's only an aliad foe 'availableTopicsRoute`
  legalTermsRoute,
  publicWelcomeRoute,
];

export type TRoutePathKey = keyof typeof pathnames;
export type TRoutePath = keyof typeof pathnames;
