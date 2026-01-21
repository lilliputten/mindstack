import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { WorkoutTopicGo } from './WorkoutTopicGo';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.WorkoutTopicGoTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function WorkoutTopicGoWrapper({ params }: TAwaitedProps) {
  const { topicId } = await params;

  if (!topicId) {
    return <PageError error={'Not topic specified.'} />;
  }

  // TODO: Check if no active training and then go to workout review/control page (on the client, because the user might be unauthorized)

  return (
    <PageWrapper
      className={cn(
        isDev && '__WorkoutTopicGoWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__WorkoutTopicGoWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <WorkoutTopicGo />
    </PageWrapper>
  );
}
