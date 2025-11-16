import { pathnames, TRoutePathKey } from '@/config/routesConfig';
import { localesList, TLocale } from '@/i18n/types';

const localizedPrefixRegStr = `^/(${localesList.join('|')})/`;
const localizedPrefixRegExp = new RegExp(localizedPrefixRegStr);

export function getLocalizedRoute(route: string, locale: TLocale) {
  const pathKeys = Object.keys(pathnames);
  if (pathKeys.includes(route)) {
    const item = pathnames[route as TRoutePathKey];
    if (typeof item === 'object') {
      return item[locale];
    }
  }
}

export function getLocalePrefixedRoute(route: string, locale: TLocale) {
  if (!route || !locale) {
    return route;
  }
  if (!route.match(localizedPrefixRegExp)) {
    return `/${locale}${route}`;
  }
  return route;
}

export function getAllRouteSynonyms(route: string, locale: TLocale) {
  const prefixedRoute = getLocalePrefixedRoute(route, locale);
  const localizedRoute = getLocalizedRoute(route, locale);
  const prefixedLocalizedRoute = localizedRoute && getLocalePrefixedRoute(localizedRoute, locale);
  const routesList = [
    // All the paths represent the root path
    route,
    prefixedRoute,
    prefixedRoute &&
      prefixedRoute.endsWith('/') &&
      prefixedRoute.substring(0, prefixedRoute.length - 1),
    localizedRoute,
    prefixedLocalizedRoute,
  ].filter(Boolean);
  return routesList;
}
