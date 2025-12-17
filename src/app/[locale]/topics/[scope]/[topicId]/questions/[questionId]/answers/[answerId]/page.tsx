import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { ViewAnswerPageHolder } from './ViewAnswerPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
  answerId: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.ManageAnswerTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function ViewAnswerPageWrapper({ params }: TAwaitedProps) {
  const { topicId, questionId, answerId } = await params;

  if (!topicId) {
    return <PageError error={'No topic ID specified.'} />;
  }
  if (!questionId) {
    return <PageError error={'No question ID specified.'} />;
  }
  if (!answerId) {
    return <PageError error={'Not answer ID specified.'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ViewAnswerPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ViewAnswerPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <ViewAnswerPageHolder topicId={topicId} questionId={questionId} answerId={answerId} />
    </PageWrapper>
  );
}
