import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import {
  defaultThemeColor,
  primaryColor,
  primaryForegroundColor,
  secondaryColor,
  secondaryForegroundColor,
  themeColorData,
} from './src/config/themeColors';

// Import environments to ensure if they're ok
import './src/config/envServer';
import './src/config/env';

import { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes';

import { staticRedirects, staticRewrites } from './src/config/routesConfig';
import { defaultLocale, localesList } from './src/i18n/types';

const isDev = process.env.NODE_ENV === 'development';

/* // Show loaded environment variables
 * declare global {
 *   var __IS_NEXT_STARTED: boolean | undefined;
 * }
 * if (isDev && !global.__IS_NEXT_STARTED) {
 *   global.__IS_NEXT_STARTED = true;
 *   console.log('Loaded app environment variables:', { ...envApp });
 *   console.log('Loaded client environment variables:', { ...envClient });
 * }
 */

// @see https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
const withNextIntl = createNextIntlPlugin();

// Create a list of lists (id, color, [percentFix='0%']] for themes values
const scssThemes = Object.entries(themeColorData)
  .map(([id, { color, fix }]) => {
    return [id, color, fix == undefined ? '0%' : typeof fix === 'number' ? fix + '%' : fix].join(
      ' ',
    );
  })
  .join(', ');
const scssVariables = `
$primaryColor: ${primaryColor};
$secondaryColor: ${secondaryColor};
$primaryForegroundColor: ${primaryForegroundColor};
$secondaryForegroundColor: ${secondaryForegroundColor};
$defaultTheme: ${defaultThemeColor};
$themes: ( ${scssThemes} );
`;

// Prepare all aliases (rewrites and redirects)...
const localeRoutes = localesList.map((locale) => '/' + locale);
const defalutLocaleRoute = '/' + defaultLocale; // localeRoutes[0];
const foundAliases: string[] = [];
/** Generate all specific aliases for used locales */
function expandAliasWithLocales<T extends Rewrite | Redirect>(item: T): T[] {
  const { source, destination } = item;
  const aliasesErrorCommonMessage =
    'Check aliases definitions in the `src/config/routesConfig.ts` module.';
  // Check for self-referencing aliases?
  if (source === destination) {
    const error = new Error(
      `There is a self-pointing alias: "${source}". ${aliasesErrorCommonMessage}`,
    );
    // eslint-disable-next-line no-console
    console.error('[next.config]', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
  // Check for duplicated aliases?
  if (foundAliases.includes(source)) {
    const error = new Error(
      `There is a duplicated alias: "${source}". ${aliasesErrorCommonMessage}`,
    );
    // eslint-disable-next-line no-console
    console.error('[next.config]', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
  foundAliases.push(source);
  const extendedRewrites = [
    {
      ...item,
      source: source,
      destination: defalutLocaleRoute + destination,
    },
  ].concat(
    localeRoutes.map((localeRoute) => ({
      ...item,
      source: localeRoute + source,
      destination: localeRoute + destination,
    })),
  );
  return extendedRewrites;
}
// Composes alias lists...
const redirectsList: Redirect[] = staticRedirects.flatMap(expandAliasWithLocales);
const rewritesList: Rewrite[] = staticRewrites.flatMap(expandAliasWithLocales);

const nextConfig: NextConfig = {
  // redirects: async () => localeRewrites.map((item) => ({ permanent: true, ...item })),
  redirects: async () => redirectsList,
  rewrites: async () => rewritesList,
  /*
   * // @see https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
   * rewrites: async () => {
   *   // Create rewrites for each locale since next-intl handles internationalized routes
   *   // const locales = ['en', 'es', 'ru']; // Add all your supported locales
   *   return {
   *     afterFiles: localeRewrites,
   *   };
   * },
   */
  turbopack: {
    rules: {
      '*.md': {
        // Example using a raw loader exposed to Turbopack
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  sassOptions: {
    additionalData: scssVariables,
    silenceDeprecations: ['legacy-js-api'],
  },
  compress: !isDev, // In favor of xtunnel (it loses `gzip` header)
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
