import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { ViewTopicPageHolder } from './ViewTopicPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t('Pages.ManageTopicTitle'),
  });
}

export default async function ViewTopicPageWrapper({ params }: TAwaitedProps) {
  const { topicId } = await params;

  if (!topicId) {
    return <PageError error={'No topic specified'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ViewTopicPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ViewTopicPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4',
      )}
      limitWidth
      vPadded
    >
      <ViewTopicPageHolder topicId={topicId} />
    </PageWrapper>
  );
}
