import { TAwaitedLocaleProps } from '@/i18n/types';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import ManageTopicsPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId }>;

export default function AddTopicPage({ params }: TAwaitedProps) {
  return <ManageTopicsPage showAddModal={true} params={params} />;
}
