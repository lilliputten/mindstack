import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { checkIfUserIsAdmin, getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { getT, TAwaitedLocaleProps } from '@/i18n';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, welcomeAliasRoute } from '@/config';
import { getFirstPublicTopicId } from '@/features/topics/actions';

import { UiDemoForm } from './UiDemoForm';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.TestQueryTitle'),
  });
}

export default async function TestQueryPage() {
  const user = await getCurrentUser();
  const isAdmin = checkIfUserIsAdmin(user); // await isAdminUser();

  // Fetch the first available public topic (which has questions) id
  const topicId = await getFirstPublicTopicId({ userId: user?.id });

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
      <UiDemoForm topicId={topicId} />
    </PageWrapper>
  );
}
