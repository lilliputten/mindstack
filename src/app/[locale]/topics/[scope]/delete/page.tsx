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
  // const { scope } = await params;
  // const topicsListRoutePath = topicsRoutes[scope];
  // NOTE: Don't display a delete topic modal by url request: just redirect to crsp topics list
  // redirect(route);

  return <ManageTopicsPage deleteTopicId={topicId} from={'SERVER:' + from} params={params} />;
}
