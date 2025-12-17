import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { SettingsPage } from './SettingsPage';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.SettingsTitle');
  const description = t('Pages.SettingsDescription');
  return constructMetadata({
    locale,
    title,
    description,
  });
}

export default async function SettingsPageIndex({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const userId = user?.id;

  // Enable static rendering
  setRequestLocale(locale);

  return <SettingsPage userId={userId} />;
}
