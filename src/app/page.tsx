import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { startAliasRoute, welcomeAliasRoute } from '@/config';
import { getT } from '@/i18n';
import { defaultLocale, TAwaitedLocaleProps } from '@/i18n/types';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.RootTitle'),
    locale,
  });
}

// This page only renders when the app is built statically (output: 'export')
export default async function DefaultRootPage() {
  const prefix = '/' + defaultLocale;
  const user = await getCurrentUser();
  const route = user ? startAliasRoute : welcomeAliasRoute;
  redirect(prefix + route);
}
