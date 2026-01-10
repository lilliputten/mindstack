import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicQuestionAnswersPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

interface DeleteTopicPageProps extends TAwaitedProps {
  searchParams: Promise<{ answerId: string }>;
}

export default async function DeleteTopicPage({ searchParams, params }: DeleteTopicPageProps) {
  const { answerId } = await searchParams;

  return <ManageTopicQuestionAnswersPage params={params} deleteAnswerId={answerId} />;
}
