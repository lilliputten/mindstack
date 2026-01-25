import { setRequestLocale } from 'next-intl/server';

import { NEXT_PUBLIC_URL } from '@/config/envServer';
import { constructMetadata } from '@/lib/constructMetadata';
import { formatDate, getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { defaultLocale, strictLocalesList, TAwaitedLocaleProps, TLocale } from '@/i18n/types';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { currencyNames } from '@/components/currencies';
import { ContentFooter, MaxWidthWrapper } from '@/components/shared';
import {
  contactEmail,
  effectiveTermsDate,
  internationalPhone,
  internationalTIN,
  isDev,
  privacyAliasRoute,
  russianPhone,
  russianTIN,
} from '@/config';
import { localeCurrencies } from '@/features/currencies';

// export const dynamic = 'force-static';

const saveScrollHash = getRandomHashString();

type TOfertaPageProps = TAwaitedLocaleProps;

interface TOfertaPagePropsWithContent extends TOfertaPageProps {
  content?: string;
}

async function getContentImport(locale: TLocale) {
  switch (locale) {
    case 'es':
      return import('./OfertaContentEs.md');
    case 'ru':
      return import('./OfertaContentRu.md');
    case 'en':
    default:
      return import('./OfertaContentEn.md');
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
    title: t('Pages.OfertaPageTitle'),
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
      console.error('[OfertaPage:generateStaticParams]', [message, details].join(': '), {
        message,
        details,
        error,
      });
    }
    params.push({ locale, content });
  }
  return params;
}

export async function OfertaPage(props: TOfertaPagePropsWithContent) {
  const { params, content: preloadedContent } = props;
  const { locale = defaultLocale } = await params;

  const t = await getT({ locale });

  // Enable static rendering
  setRequestLocale(locale);

  let content = preloadedContent;

  if (!content) {
    content = await getContent(locale);
  }

  const localeCurrency = localeCurrencies[locale];
  // const CurrencySign = CurrencySigns[localeCurrency];
  const currencyName = currencyNames[localeCurrency];

  // Variables to render
  const vars = {
    ownerName: t('LegalOwnerName'),

    russianTIN, // Russian TIN (INN) number
    internationalTIN, // Uzbek TIN (PINFL) number
    russianPhone, // Russian phone
    internationalPhone, // Uzbek phone

    effectiveDate: formatDate(effectiveTermsDate, locale),
    contactEmail,
    publicAddr: NEXT_PUBLIC_URL,
    privacyPolicyUrl: privacyAliasRoute,
    currency: currencyName,
    currencyCode: localeCurrency,
  };

  return (
    <ScrollArea
      saveScrollKey="OfertaContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__OfertaContent_Scroll',
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__OfertaContent_ScrollViewport',
        'flex flex-1 flex-col',
        'bg-decorative-gradient',
        '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
      )}
    >
      <MaxWidthWrapper className="content-text flex flex-col p-6">
        <MarkdownText vars={vars}>{content || ''}</MarkdownText>
      </MaxWidthWrapper>
      <ContentFooter />
    </ScrollArea>
  );
}
