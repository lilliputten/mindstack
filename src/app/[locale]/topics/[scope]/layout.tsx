import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { isAdminUser, isLoggedUser } from '@/lib/session';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { welcomeAliasRoute } from '@/config';
import {
  TopicsManageScopeIds,
  topicsNamespaces,
  topicsRoutes,
  TTopicsManageScopeId,
} from '@/contexts/TopicsContext';
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
    redirect(welcomeAliasRoute);
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

  // Enable static rendering
  setRequestLocale(locale);

  // TODO: Remove when done migrating to useAvailableTopicsByScope
  return (
    <ManageTopicsStoreProvider manageScope={manageScope}>
      {children}
      {addTopicModal}
      {deleteTopicModal}
    </ManageTopicsStoreProvider>
  );
}
