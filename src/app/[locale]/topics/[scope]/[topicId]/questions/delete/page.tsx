// import { ManageTopicQuestionsPage } from '@/components/pages/ManageTopicQuestions/ManageTopicQuestionsPage';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicQuestionsPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

interface DeleteTopicPageProps extends TAwaitedProps {
  searchParams: Promise<{ questionId: string }>;
}

export default async function DeleteTopicPage({ searchParams, params }: DeleteTopicPageProps) {
  const { questionId } = await searchParams;

  return <ManageTopicQuestionsPage params={params} deleteQuestionId={questionId} />;
}
