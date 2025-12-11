export const aboutRoute = '/about';
export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const adminBotControlRoute = '/admin/bot/control';
export const adminRoute = '/admin';
export const allTopicsRoute = '/topics/all';
export const authErrorRoute = '/auth/error';
export const availableTopicsRoute = '/topics/available'; // Example
export const chartsRoute = '/charts';
export const cookiesRoute = '/cookies';
export const dashboardRoute = '/dashboard';
export const docsRoute = '/docs';
export const myTopicsRoute = '/topics/my';
export const settingsRoute = '/settings';
export const startRoute = '/start';
export const welcomeRoute = '/welcome';

// Public routes (without sidebar)
export const rootRoute = '/';
export const pricingRoute = '/pricing';
export const privacyRoute = '/privacy';
export const termsRoute = '/terms';

/** NOTE: That's used only to mock real intl context */
export const pathnames = {
  [aboutRoute]: aboutRoute,
  [adminAiTestTextQueryRoute]: adminAiTestTextQueryRoute,
  [adminBotControlRoute]: adminBotControlRoute,
  [adminRoute]: adminRoute,
  [allTopicsRoute]: allTopicsRoute,
  [availableTopicsRoute]: availableTopicsRoute,
  [chartsRoute]: chartsRoute,
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

export const routesWithoutSidebar = [
  // All routes to display without dashboard sidebar. TODO: Move to config?
  rootRoute,
  pricingRoute,
  privacyRoute,
  termsRoute,
];

export type TRoutePathKey = keyof typeof pathnames;
export type TRoutePath = keyof typeof pathnames;
