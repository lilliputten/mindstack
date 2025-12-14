import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { CookiesContent } from '@/components/screens/CookiesContent';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TCookiesPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('CookiesPageTitle'),
    locale,
  });
}

export async function CookiesPage({ params }: TCookiesPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <CookiesContent locale={locale} />;
}
