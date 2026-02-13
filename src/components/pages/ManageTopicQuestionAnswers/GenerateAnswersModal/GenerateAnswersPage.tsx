'use server';

import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { GenerateAnswersPageWrapper } from './GenerateAnswersPageWrapper';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('GenerateAnswersModal.Title');
  return constructMetadata({
    locale,
    title,
    noIndex: true,
  });
}

export async function GenerateAnswersPage({ params }: TAwaitedProps) {
  const { scope, topicId, questionId } = await params;

  const t = await getT();

  if (!topicId) {
    return <PageError error={t('TopicNotFound')} />;
  }
  if (!questionId) {
    return <PageError error={t('QuestionNotFound')} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__GenerateAnswersPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__GenerateAnswersPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
    >
      <GenerateAnswersPageWrapper scope={scope} topicId={topicId} questionId={questionId} />
    </PageWrapper>
  );
}
