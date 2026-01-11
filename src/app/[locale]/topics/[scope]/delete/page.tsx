import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicsPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId }>;

interface DeleteTopicPageProps {
  searchParams: Promise<{ topicId: string; from?: string }>;
}

export default async function DeleteTopicPage({
  searchParams,
  params,
}: DeleteTopicPageProps & TAwaitedProps) {
  const { topicId, from } = await searchParams;
  return <ManageTopicsPage deleteTopicId={topicId} from={'SERVER:' + from} params={params} />;
}
