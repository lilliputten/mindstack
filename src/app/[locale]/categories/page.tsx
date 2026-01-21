import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { availableCategoriesRoute } from '@/config';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.CategoriesTitle'),
    locale,
  });
}

// This page only renders when the app is built statically (output: 'export')
export default async function DefaultCategotiesPage() {
  redirect(availableCategoriesRoute);
}
