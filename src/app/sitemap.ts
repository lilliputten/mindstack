import { MetadataRoute } from 'next';

import { publicAppUrl } from '@/config/env';
import { aliasedRoutes, publicRoutes } from '@/config/routesConfig';
import { getPathname } from '@/i18n/routing';
import { strictLocalesList, TLocale } from '@/i18n/types';

type Href = Parameters<typeof getPathname>[0]['href'];

export default function sitemap(): MetadataRoute.Sitemap {
  // Retrieve all routes excluding
  return publicRoutes
    .filter((route) => !aliasedRoutes.includes(route))
    .map((path) => getRouteEntry(path as Href));
}

function getRouteEntry(href: Href) {
  return {
    url: getFullUrl(href),
    alternates: {
      languages: Object.fromEntries(
        strictLocalesList.map((locale) => [locale, getFullUrl(href, locale as TLocale)]),
      ),
    },
  };
}

function getFullUrl(href: Href, locale?: TLocale) {
  const pathname = locale ? getPathname({ locale, href }) : href;
  return publicAppUrl + pathname;
}
