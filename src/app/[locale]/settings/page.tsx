import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { SettingsPage } from './SettingsPage';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale, namespace: 'SettingsPage' });
  const title = t('title');
  const description = t('description');
  return constructMetadata({
    locale,
    title,
    description,
  });
}

export default async function SettingsPageIndex() {
  const user = await getCurrentUser();
  const userId = user?.id;
  return <SettingsPage userId={userId} />;
}
