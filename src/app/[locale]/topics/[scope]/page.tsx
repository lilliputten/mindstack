import { redirect } from 'next/navigation';

import { welcomeRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';
import { topicsNamespaces, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TTopicId } from '@/features/topics/types';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { ManageTopicsPageModalsWrapper } from './ManageTopicsPageModalsWrapper';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale, scope } = await params;
  const namespace = topicsNamespaces[scope];
  if (namespace) {
    const t = await getT({ locale });
    return constructMetadata({
      locale,
      title: t(`Pages.${namespace}Title`),
    });
  }
}

interface TManageTopicsPageHolderProps extends TAwaitedProps {
  showAddModal?: boolean;
  deleteTopicId?: TTopicId;
  editTopicId?: TTopicId;
  editQuestionsTopicId?: TTopicId;
  from?: string;
}

export default async function ManageTopicsPageHolder(props: TManageTopicsPageHolderProps) {
  const {
    showAddModal,
    deleteTopicId,
    editTopicId,
    editQuestionsTopicId,
    from,
    // params,
  } = props;

  // Check if logged user
  const isLogged = await isLoggedUser();
  if (!isLogged) {
    redirect(welcomeRoute);
  }
  return (
    <PageWrapper
      className={cn(
        isDev && '__ManageTopicsPageHolder', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ManageTopicsPageHolder_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
    >
      <ManageTopicsPageModalsWrapper
        showAddModal={showAddModal}
        deleteTopicId={deleteTopicId}
        editTopicId={editTopicId}
        editQuestionsTopicId={editQuestionsTopicId}
        from={from}
      />
    </PageWrapper>
  );
}
