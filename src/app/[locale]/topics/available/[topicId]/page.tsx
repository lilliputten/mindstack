import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { ViewAvailableTopicPageWrapper } from './ViewAvailableTopicPageWrapper';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.ViewAvailableTopicTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function ViewTopicPageHolder({ params }: TAwaitedProps) {
  const { topicId } = await params;

  if (!topicId) {
    return <PageError error={'No topic ID specified'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ViewTopicPageHolder', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ViewTopicPageHolder_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <ViewAvailableTopicPageWrapper topicId={topicId} />
    </PageWrapper>
  );
}
