export const authErrorRoute = '/auth/error';
export const adminRoute = '/admin';
export const adminBotControlRoute = '/admin/bot/control';
export const adminAiTestTextQueryRoute = '/admin/ai/test-text-query';
export const chartsRoute = '/charts';
export const dashboardRoute = '/dashboard';
export const aboutRoute = '/about';
export const availableTopicsRoute = '/topics/available'; // Example
export const allTopicsRoute = '/topics/all';
export const myTopicsRoute = '/topics/my';
export const rootRoute = '/';
export const startRoute = '/start';
export const settingsRoute = '/settings';
export const welcomeRoute = '/welcome';

/** NOTE: That's used only to mock real intl context */
export const pathnames = {
  [adminRoute]: adminRoute,
  [adminBotControlRoute]: adminBotControlRoute,
  [adminAiTestTextQueryRoute]: adminAiTestTextQueryRoute,
  [chartsRoute]: chartsRoute,
  [dashboardRoute]: dashboardRoute,
  [availableTopicsRoute]: availableTopicsRoute,
  [aboutRoute]: aboutRoute,
  [myTopicsRoute]: myTopicsRoute,
  [allTopicsRoute]: allTopicsRoute,
  [rootRoute]: rootRoute,
  [settingsRoute]: settingsRoute,
  [welcomeRoute]: welcomeRoute,
};

export type TRoutePathKey = keyof typeof pathnames;
export type TRoutePath = keyof typeof pathnames;
