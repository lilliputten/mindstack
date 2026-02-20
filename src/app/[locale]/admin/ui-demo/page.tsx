import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { isAdminUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { getT, TAwaitedLocaleProps } from '@/i18n';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, welcomeAliasRoute } from '@/config';

import { UiDemoForm } from './UiDemoForm';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.TestQueryTitle'),
  });
}

export default async function TestQueryPage() {
  const isAdmin = await isAdminUser();

  if (!isAdmin) {
    return redirect(welcomeAliasRoute);
  }

  return (
    <PageWrapper
      id="UiDemoPage"
      className={cn(
        isDev && '__UiDemoPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__UiDemoPage_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // scrollable
    >
      <UiDemoForm />
    </PageWrapper>
  );
}
