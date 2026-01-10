import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicQuestionAnswersPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

export default function AddAnswerModalPage({ params }: TAwaitedProps) {
  return <ManageTopicQuestionAnswersPage showGenerateModal={true} params={params} />;
}
