export const aboutRoute = '/about';
export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const adminBotControlRoute = '/admin/bot/control';
export const adminRoute = '/admin';
export const allTopicsRoute = '/topics/all';
export const authErrorRoute = '/auth/error';
export const availableTopicsRoute = '/topics/available'; // Example
export const dashboardRoute = '/dashboard';
export const myTopicsRoute = '/topics/my';
export const settingsRoute = '/settings';

// Legal page routes
export const legalCookiesRoute = '/legal/cookies';
export const legalOfferRoute = '/legal/offer';
export const legalPrivacyRoute = '/legal/privacy';
export const legalTermsRoute = '/legal/terms';

// Public content routes (without sidebar)
export const docsRoute = '/docs';
export const pricingRoute = '/pricing';
export const startRoute = '/start';
export const welcomeRoute = '/welcome';

// Root route
export const rootRoute = '/';

/** NOTE: That's used only to mock real intl context */
export const pathnames = {
  [aboutRoute]: aboutRoute,
  [adminAiTestTextQueryRoute]: adminAiTestTextQueryRoute,
  [adminBotControlRoute]: adminBotControlRoute,
  [adminRoute]: adminRoute,
  [allTopicsRoute]: allTopicsRoute,
  [availableTopicsRoute]: availableTopicsRoute,
  [dashboardRoute]: dashboardRoute,
  [docsRoute]: docsRoute,
  [myTopicsRoute]: myTopicsRoute,
  [settingsRoute]: settingsRoute,
  [welcomeRoute]: welcomeRoute,

  // Public routes (without sidebar)
  [rootRoute]: rootRoute,
  [pricingRoute]: pricingRoute,

  // Legal pages
  [legalCookiesRoute]: legalCookiesRoute,
  [legalOfferRoute]: legalOfferRoute,
  [legalPrivacyRoute]: legalPrivacyRoute,
  [legalTermsRoute]: legalTermsRoute,
};

/** All routes to display without dashboard sidebar. */
export const routesWithoutSidebar = [
  // Root route
  rootRoute,

  // Public content routes (without sidebar)
  legalCookiesRoute,
  docsRoute,
  pricingRoute,
  legalPrivacyRoute,
  startRoute,
  legalTermsRoute,
  welcomeRoute,
];

export type TRoutePathKey = keyof typeof pathnames;
export type TRoutePath = keyof typeof pathnames;
