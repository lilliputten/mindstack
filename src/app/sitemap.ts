import { MetadataRoute } from 'next';

import { publicAppUrl } from '@/config/env';
import { getPathname } from '@/i18n/routing';
import { strictLocalesList, TLocale } from '@/i18n/types';
import { aliasedRoutes, excludeFromSitemap, publicRoutes } from '@/config';

type Href = Parameters<typeof getPathname>[0]['href'];

const allExcludes = excludeFromSitemap.concat(aliasedRoutes);

export default function sitemap(): MetadataRoute.Sitemap {
  // Retrieve all routes excluding
  return publicRoutes
    .filter((route) => !allExcludes.includes(route))
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
