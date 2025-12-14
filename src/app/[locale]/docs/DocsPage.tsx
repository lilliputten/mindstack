import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { DocsContent } from '@/components/screens/DocsContent';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TDocsPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('DocsPageTitle'),
    locale,
  });
}

export async function DocsPage({ params }: TDocsPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <DocsContent locale={locale} />;
}
