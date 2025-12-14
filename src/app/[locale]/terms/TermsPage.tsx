import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { TermsContent } from '@/components/screens/TermsContent';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TTermsPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('TermsPageTitle'),
    locale,
  });
}

export async function TermsPage({ params }: TTermsPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <TermsContent locale={locale} />;
}
