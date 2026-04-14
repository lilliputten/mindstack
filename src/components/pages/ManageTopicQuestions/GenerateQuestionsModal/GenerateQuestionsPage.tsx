'use server';

import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { GenerateQuestionsPageWrapper } from './GenerateQuestionsPageWrapper';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.EditQuestionPropertiesTitle');
  return constructMetadata({
    locale,
    title,
    noIndex: true,
  });
}

export async function GenerateQuestionsPage({ params }: TAwaitedProps) {
  const { scope, topicId } = await params;

  const t = await getT();

  if (!topicId) {
    return <PageError error={t('TopicNotFound')} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__GenerateQuestionsPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__GenerateQuestionsPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // vPadded
    >
      <GenerateQuestionsPageWrapper scope={scope} topicId={topicId} />
    </PageWrapper>
  );
}
