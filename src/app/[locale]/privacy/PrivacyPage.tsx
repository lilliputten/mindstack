import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { PrivacyContent } from '@/components/screens/PrivacyContent';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TPrivacyPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.PrivacyTitle'),
    locale,
  });
}

export async function PrivacyPage({ params }: TPrivacyPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <PrivacyContent locale={locale} />;
}
