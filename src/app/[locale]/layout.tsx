import React from 'react';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { EnvProvider } from '@/contexts/EnvContext';

import '@/styles/globals.scss';
import '@/styles/root.scss';

import { AbstractIntlMessages } from 'next-intl';

import { BOT_USERNAME } from '@/config/envServer';
import { defaultThemeColor } from '@/config/themeColors';
import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/Toaster';
import { GenericLayout } from '@/components/layout/GenericLayout';
import ModalProvider from '@/components/modals/providers';
import { CustomNextIntlClientProvider } from '@/components/providers/CustomNextIntlClientProvider';
import { ReactQueryClientProvider } from '@/components/providers/ReactQueryClientProvider';
import { TailwindIndicator } from '@/components/service/TailwindIndicator';
import { fontDefault, fontHeading, fontMono } from '@/assets/fonts';
import { isDev } from '@/config';
import { SettingsContextProvider } from '@/contexts/SettingsContext';
import { getSettings } from '@/features/settings/actions';
import { routing } from '@/i18n/routing';
import { TAwaitedLocaleProps, TLocale } from '@/i18n/types';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  return constructMetadata({
    locale,
    icons: '/favicon.ico',
  });
}

type TRootLayoutProps = TAwaitedLocaleProps & {
  children: React.ReactNode;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale: locale as TLocale }));
}

async function RootLayout(props: TRootLayoutProps) {
  const { children, params: paramsPromise } = props;
  const params = await paramsPromise;
  const { defaultLocale } = routing;
  let { locale = defaultLocale } = params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    // NOTE: Sometimes we got `.well-known` value here. TODO?
    const error = new Error(`Invalid locale: ${locale}, using default: ${defaultLocale}`);
    // eslint-disable-next-line no-console
    console.warn('[layout:RootLayout]', error.message);
    // debugger; // eslint-disable-line no-debugger
    // TODO? -- Redirect to 'notFound' page?
    // Just use the default value
    locale = defaultLocale;
  }

  setRequestLocale(locale);

  const cookieStore = await cookies();

  // Provide i18n translations
  let messages: AbstractIntlMessages | undefined;
  try {
    messages = await getMessages();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[layout:messages]', locale, error);
    // debugger;
  }

  const user = await getCurrentUser();
  // const userId = user?.id;

  const settings = await getSettings();
  // Get theme color from setting or from cookie or get the default value
  const themeColor =
    settings?.themeColor || cookieStore.get('themeColor')?.value || defaultThemeColor;
  // const theme = settings?.theme;

  return (
    <html
      lang={locale}
      data-theme-color={themeColor}
      // style={{ colorScheme: theme }}
      // className={theme}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon shortcut" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/static/favicons/favicon-64x64.png" sizes="64x64" />
        {/* // TODO: Set SEO and OG meta tags
        <meta property="og:url" content="https://vanilla-tasks.lilliputten.com/" />
        <meta property="og:title" content="Vanilla Tasks Tracker" />
        <meta
          property="og:description"
          content="The small application aimed to demonstrate native js and css abilities in browser environment"
        />
        <meta property="twitter:image" content="/images/og/og-512.jpg" />
        <meta property="og:logo" content="/images/og/og-192.jpg" />
        <meta property="og:image" content="/images/og/og-1200x630.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        */}
        {/* Runs before any interactive/hydration code to update user settings to avoid content flash */}
        <Script
          id="layoyut-init-theme"
          strategy="beforeInteractive"
          src="/static/layout-init-theme.js"
        />
      </head>
      <body
        className={cn(
          isDev && '__layout',
          'flex flex-col',
          'font-default antialiased',
          'bg-page-gradient',
          fontDefault.variable,
          fontHeading.variable,
          fontMono.variable,
        )}
        data-layout="clippable" // Default layout mode, could casue flickering
      >
        <ReactQueryClientProvider>
          <SessionProvider>
            <EnvProvider BOT_USERNAME={BOT_USERNAME}>
              <CustomNextIntlClientProvider
                locale={locale}
                messages={messages}
                // onError={handleIntlError}
              >
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                  storageKey="app-theme"
                >
                  <ModalProvider>
                    {/* NOTE: The toaster should be located before the main content */}
                    <Toaster
                      // @see https://sonner.emilkowal.ski/toaster#api-reference
                      expand
                      richColors
                      closeButton
                      // theme="dark"
                      // invert?: boolean;
                      // theme?: 'light' | 'dark' | 'system';
                      // position?: Position;
                      // hotkey?: string[];
                      // richColors?: boolean;
                      // expand?: boolean;
                      // duration?: number;
                      // gap?: number;
                      // visibleToasts?: number;
                      // closeButton?: boolean;
                      // toastOptions?: ToastOptions;
                      // className?: string;
                      // style?: React.CSSProperties;
                      // offset?: Offset;
                      // mobileOffset?: Offset;
                      // dir?: 'rtl' | 'ltr' | 'auto';
                      // swipeDirections?: SwipeDirection[];
                      // icons?: ToastIcons;
                      // containerAriaLabel?: string;
                      // pauseWhenPageIsHidden?: boolean;
                    />
                    <SettingsContextProvider user={user}>
                      <GenericLayout>
                        {/* Core content */}
                        {children}
                      </GenericLayout>
                    </SettingsContextProvider>
                    <TailwindIndicator />
                  </ModalProvider>
                </ThemeProvider>
              </CustomNextIntlClientProvider>
            </EnvProvider>
          </SessionProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
