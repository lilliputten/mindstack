import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { WorkoutTopic } from './WorkoutTopic';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.TrainingTopicReviewTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function WorkoutTopicWrapper({ params }: TAwaitedProps) {
  const { topicId } = await params;

  if (!topicId) {
    throw new Error('No topic ID specified');
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__WorkoutTopicWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__WorkoutTopicWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <WorkoutTopic
        className={cn(
          isDev && '__WorkoutTopicWrapper_Content', // DEBUG
        )}
      />
    </PageWrapper>
  );
}
