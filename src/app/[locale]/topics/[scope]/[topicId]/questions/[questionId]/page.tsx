import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { ViewQuestionPageHolder } from './ViewQuestionPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.ManageQuestionTitle');
  return constructMetadata({
    locale,
    title,
    noIndex: true,
  });
}

export default async function ViewQuestionPageWrapper({ params }: TAwaitedProps) {
  const { topicId, questionId } = await params;

  if (!topicId) {
    return <PageError error={'No topic ID specified.'} />;
  }
  if (!questionId) {
    return <PageError error={'No question ID specified.'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ViewQuestionPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ViewQuestionPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <ViewQuestionPageHolder topicId={topicId} questionId={questionId} />
    </PageWrapper>
  );
}
