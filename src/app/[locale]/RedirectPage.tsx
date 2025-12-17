import { redirect } from 'next/navigation';

import { myTopicsRoute, welcomeRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.RedirectTitle'),
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
