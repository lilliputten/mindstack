import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper } from '@/components/shared';
import {
  contactEmail,
  cookiesRoute,
  docsRoute,
  isDev,
  privacyRoute,
  publicAddr,
  termsRoute,
  versionInfo,
} from '@/config';
import { getT } from '@/i18n';
import { defaultLocale, TAwaitedLocaleProps, TLocale } from '@/i18n/types';

export const dynamic = 'force-static';

const saveScrollHash = getRandomHashString();

type TDocsPageProps = TAwaitedLocaleProps;

interface TDocsPagePropsWithContent extends TDocsPageProps {
  content?: string;
}

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.DocsTitle'),
    locale,
  });
}

async function getContentImport(locale: TLocale) {
  switch (locale) {
    // TODO: Add another languages
    case 'en':
    default:
      return import('./DocsContentEn.md');
  }
}

async function getContent(locale: TLocale) {
  /* // DEBUG: Demo error
   * throw new Error('Test');
   */
  const imported = await getContentImport(locale);
  return imported.default;
}

export async function generateStaticParams() {
  const locale = 'en';
  let content: string = '';
  try {
    content = await getContent(locale);
  } catch (error) {
    const message = 'Error loading page content for static generation';
    const details = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[DocsPage:generateStaticParams]', [message, details].join(': '), {
      message,
      details,
      error,
    });
  }
  return [{ locale, content }];
}

export default async function DocsPage(props: TDocsPagePropsWithContent) {
  const { params, content: preloadedContent } = props;
  const { locale = defaultLocale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  /* // DEBUG
   * if (preloadedContent) {
   *   console.log('[DocsPage:before]', {
   *     locale,
   *     preloadedContent,
   *     props,
   *   });
   *   debugger;
   * }
   */

  let content = preloadedContent;

  if (!content) {
    content = await getContent(locale);
  }

  // Variables to render
  const vars = {
    docsRoute,
    contactEmail,
    publicAddr,
    cookiesRoute,
    privacyRoute,
    termsRoute,
    versionInfo,
  };

  return (
    <ScrollArea
      saveScrollKey="DocsContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__DocsContent_Scroll',
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__DocsContent_ScrollViewport',
        'flex flex-1 flex-col',
        'bg-decorative-gradient',
        '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
      )}
    >
      <MaxWidthWrapper className="text-content flex flex-col p-6">
        <MarkdownText vars={vars}>{content || ''}</MarkdownText>
      </MaxWidthWrapper>
      <ContentFooter />
    </ScrollArea>
  );
}
