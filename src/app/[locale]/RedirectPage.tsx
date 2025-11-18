import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { myTopicsRoute, welcomeRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { TAwaitedLocaleProps } from '@/i18n/types';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RedirectPage' });
  return constructMetadata({
    title: t('title'),
    locale,
  });
}

export async function RedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(welcomeRoute);
  } else {
    redirect(myTopicsRoute);
  }
}
