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

const nextConfig: NextConfig = {
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
