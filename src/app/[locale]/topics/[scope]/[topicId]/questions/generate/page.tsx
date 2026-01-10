import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicQuestionsPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
}>;

export default function GenerateQuestionsModalPage({ params }: TAwaitedProps) {
  return <ManageTopicQuestionsPage showGenerateModal={true} params={params} />;
}
