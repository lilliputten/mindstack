import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { EditTopicPageHolder } from './EditTopicPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.EditTopicPropertiesTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function EditTopicPageWrapper({ params }: TAwaitedProps) {
  const { topicId } = await params;

  if (!topicId) {
    return <PageError error={'No topic specified'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__EditTopicPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__EditTopicPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <EditTopicPageHolder topicId={topicId} />
    </PageWrapper>
  );
}
