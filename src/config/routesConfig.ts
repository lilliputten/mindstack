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

// Root route
export const rootRoute = '/';

// Public content routes (without sidebar)
export const cookiesRoute = '/cookies';
export const docsRoute = '/docs';
export const pricingRoute = '/pricing';
export const privacyRoute = '/privacy';
export const startRoute = '/start';
export const termsRoute = '/terms';
export const welcomeRoute = '/welcome';

/** NOTE: That's used only to mock real intl context */
export const pathnames = {
  [aboutRoute]: aboutRoute,
  [adminAiTestTextQueryRoute]: adminAiTestTextQueryRoute,
  [adminBotControlRoute]: adminBotControlRoute,
  [adminRoute]: adminRoute,
  [allTopicsRoute]: allTopicsRoute,
  [availableTopicsRoute]: availableTopicsRoute,
  [cookiesRoute]: cookiesRoute,
  [dashboardRoute]: dashboardRoute,
  [docsRoute]: docsRoute,
  [myTopicsRoute]: myTopicsRoute,
  [settingsRoute]: settingsRoute,
  [welcomeRoute]: welcomeRoute,

  // Public routes (without sidebar)
  [rootRoute]: rootRoute,
  [pricingRoute]: pricingRoute,
  [privacyRoute]: privacyRoute,
  [termsRoute]: termsRoute,
};

/** All routes to display without dashboard sidebar. */
export const routesWithoutSidebar = [
  // Root route
  rootRoute,

  // Public content routes (without sidebar)
  cookiesRoute,
  docsRoute,
  pricingRoute,
  privacyRoute,
  startRoute,
  termsRoute,
  welcomeRoute,
];

export type TRoutePathKey = keyof typeof pathnames;
export type TRoutePath = keyof typeof pathnames;
