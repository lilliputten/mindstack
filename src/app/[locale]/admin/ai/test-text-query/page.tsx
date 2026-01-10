import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { isAdminUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { getT, TAwaitedLocaleProps } from '@/i18n';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, welcomeAliasRoute } from '@/config';

import { TextQueryForm } from './TextQueryForm';

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
      id="TextQueryPage"
      className={cn(
        isDev && '__TextQueryPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__TextQueryPage_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // scrollable
    >
      <TextQueryForm />
    </PageWrapper>
  );
}
