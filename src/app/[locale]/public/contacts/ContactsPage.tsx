import { setRequestLocale } from 'next-intl/server';

import {
  authorGithub,
  authorLinkedin,
  authorName,
  authorSiteUrl,
  projectGithub,
} from '@/config/contacts';
import { constructMetadata } from '@/lib/constructMetadata';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { defaultLocale, strictLocalesList, TAwaitedLocaleProps, TLocale } from '@/i18n/types';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper } from '@/components/shared';
import { contactEmail, isDev } from '@/config';

// export const dynamic = 'force-static';

const saveScrollHash = getRandomHashString();

type TContactsPageProps = TAwaitedLocaleProps;

interface TContactsPagePropsWithContent extends TContactsPageProps {
  content?: string;
}

async function getContentImport(locale: TLocale) {
  switch (locale) {
    case 'es':
      return import('./ContactsContentEs.md');
    case 'ru':
      return import('./ContactsContentRu.md');
    case 'en':
    default:
      return import('./ContactsContentEn.md');
  }
}

async function getContent(locale: TLocale) {
  const imported = await getContentImport(locale);
  return imported.default;
}

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.ContactsPageTitle') || 'Project Contacts',
    locale,
  });
}

export async function generateStaticParams() {
  const locales = strictLocalesList;
  const params = [];
  for (const locale of locales) {
    let content: string = '';
    try {
      content = await getContent(locale);
    } catch (error) {
      const message = 'Error loading page content for static generation';
      const details = getErrorText(error);
      // eslint-disable-next-line no-console
      console.error('[ContactsPage:generateStaticParams]', [message, details].join(': '), {
        message,
        details,
        error,
      });
    }
    params.push({ locale, content });
  }
  return params;
}

export async function ContactsPage(props: TContactsPagePropsWithContent) {
  const { params, content: preloadedContent } = props;
  const { locale = defaultLocale } = await params;

  const t = await getT({ locale });

  // Enable static rendering
  setRequestLocale(locale);

  let content = preloadedContent;

  if (!content) {
    content = await getContent(locale);
  }

  // Variables to render
  const vars = {
    serviceName: t('Pages.RootTitle'),
    contactEmail,
    authorName,
    authorSiteUrl,
    authorLinkedin,
    authorGithub,
    projectGithub,
  };

  return (
    <ScrollArea
      saveScrollKey="ContactsContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__ContactsContent_Scroll',
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__ContactsContent_ScrollViewport',
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
