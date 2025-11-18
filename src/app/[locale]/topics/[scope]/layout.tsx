import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { welcomeRoute } from '@/config/routesConfig';
import { isAdminUser, isLoggedUser } from '@/lib/session';
import {
  TopicsManageScopeIds,
  topicsNamespaces,
  topicsRoutes,
  TTopicsManageScopeId,
} from '@/contexts/TopicsContext';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { ManageTopicsStoreProvider } from '@/stores/ManageTopicsStoreProvider';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId }>;

type TManageTopicsLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
  addTopicModal: React.ReactNode; // slot from @addTopicModal
  deleteTopicModal: React.ReactNode; // slot from @deleteTopicModal
};

export default async function ManageTopicsLayout(props: TManageTopicsLayoutProps) {
  const {
    children,
    addTopicModal, // slot from @addTopicModal
    deleteTopicModal, // slot from @deleteTopicModal
    params,
  } = props;
  const { locale, scope: manageScope } = await params;

  const namespace = topicsNamespaces[manageScope];
  const routePath = topicsRoutes[manageScope];

  // An invalid scope received
  if (!namespace || !routePath) {
    // eslint-disable-next-line no-console
    console.warn('[ManageTopicsLayout] An invalid scope received:', manageScope);
    debugger; // eslint-disable-line no-debugger
    notFound();
  }

  // Check if logged user
  const isLogged = await isLoggedUser();
  if (!isLogged) {
    redirect(welcomeRoute);
  }

  const isAdmin = await isAdminUser();

  const isAdminMode = manageScope === TopicsManageScopeIds.ALL_TOPICS;

  // Check if it's admin user for 'all' scope
  if (isAdminMode && !isAdmin) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ManageTopicsLayout] Admin user role required for managing topics scope',
      manageScope,
    );
    debugger; // eslint-disable-line no-debugger
    notFound();
  }

  // const t = await getTranslations({ locale, namespace });

  // Enable static rendering
  setRequestLocale(locale);

  /*// UNUSED: Fetching the topics is proceeding on the client side, see `ManageTopicsListWrapper`. TODO: In the future the `TopicsContext` must be compeltely replcaed by react query-provided data
   * // const topicsPromise = isAdminMode ? getAllUsersTopics() : getThisUserTopics();
   * // const topics: TTopic[] = (await topicsPromise) || [];
   * const topicsPromise = getAvailableTopics({ adminMode: isAdminMode });
   * const topicResults = await topicsPromise;
   * const topics = topicResults.topics;
   */

  // TODO: Remove when done migrating to useAvailableTopicsByScope
  return (
    <ManageTopicsStoreProvider manageScope={manageScope}>
      {children}
      {addTopicModal}
      {deleteTopicModal}
    </ManageTopicsStoreProvider>
  );
}
