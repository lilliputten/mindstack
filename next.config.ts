import type { NextConfig } from 'next';
import { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes';
import createNextIntlPlugin from 'next-intl/plugin';

import { blobBodySizeLimitMb } from '@/constants';

// NOTE: Always import both client and server environments to ensure if they're ok
import { isDev } from './src/config/env';
import { VERCEL_BLOB_HOST } from './src/config/envServer';
import { staticRedirects, staticRewrites } from './src/config/routesConfig';
import {
  defaultThemeColor,
  primaryColor,
  primaryForegroundColor,
  secondaryColor,
  secondaryForegroundColor,
  themeColorData,
} from './src/config/themeColors';
import { defaultLocale, localesList } from './src/i18n/types';

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
  /* // @see https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
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
  webpack: (config, _ctx) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    // Optimize webpack cache for large strings
    if (config.cache && typeof config.cache === 'object' && config.cache.type === 'filesystem') {
      config.cache.buildDependencies = config.cache.buildDependencies || {};
      config.cache.managedPaths = config.cache.managedPaths || [];
      config.optimization = config.optimization || {};
      config.optimization.minimize =
        config.optimization.minimize !== undefined ? config.optimization.minimize : !isDev;
    }

    const terserPlugin = config.optimization.minimizer.find(
      (minimizer: { constructor: { name: string } }) =>
        minimizer.constructor.name === 'TerserPlugin',
    );

    if (terserPlugin) {
      // Modify Terser options to keep debugger statements
      terserPlugin.options.terserOptions.compress.drop_debugger = false;
      // Optionally, prevent console logs from being dropped
      terserPlugin.options.terserOptions.compress.drop_console = false;
    }

    return config;
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
  sassOptions: {
    additionalData: scssVariables,
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    /* // It's deprecated
     * domains: [VERCEL_BLOB_HOST], // Vercel Blob Storage
     */
    // If you have other image domains, add them here as well
    remotePatterns: [
      {
        protocol: 'https',
        hostname: VERCEL_BLOB_HOST,
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['multilingual-stemmer'],
    serverActions: {
      bodySizeLimit: `${blobBodySizeLimitMb}mb`,
    },
  },
  compress: !isDev, // In favor of xtunnel (it loses `gzip` header)
  reactStrictMode: false,
};

export default withNextIntl(nextConfig);
