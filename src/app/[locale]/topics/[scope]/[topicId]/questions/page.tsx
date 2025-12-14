import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TQuestionId } from '@/features/questions/types';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { ManageTopicQuestionsPageModalsWrapper } from './ManageTopicQuestionsPageModalsWrapper';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

interface ManageTopicQuestionsPageProps extends TAwaitedProps {
  showAddModal?: boolean;
  showGenerateModal?: boolean;
  deleteQuestionId?: TQuestionId;
  editQuestionId?: TQuestionId;
  editAnswersQuestionId?: TQuestionId;
}

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.ManageTopicQuestionsTitle');
  const description = t('Pages.ManageTopicQuestionsDescription');
  return constructMetadata({
    locale,
    title,
    description,
  });
}

export default async function ManageTopicQuestionsPage(props: ManageTopicQuestionsPageProps) {
  const {
    showAddModal,
    showGenerateModal,
    deleteQuestionId,
    editQuestionId,
    editAnswersQuestionId,
    params,
  } = props;

  const resolvedParams = await params;
  const { topicId } = resolvedParams;

  if (!topicId) {
    return <PageError error={'No topic specified.'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ManageTopicQuestionsPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ManageTopicQuestionsPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // vPadded
    >
      <ManageTopicQuestionsPageModalsWrapper
        topicId={topicId}
        showAddModal={showAddModal}
        showGenerateModal={showGenerateModal}
        deleteQuestionId={deleteQuestionId}
        editQuestionId={editQuestionId}
        editAnswersQuestionId={editAnswersQuestionId}
      />
    </PageWrapper>
  );
}
