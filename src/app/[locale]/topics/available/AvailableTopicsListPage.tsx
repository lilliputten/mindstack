'use client';

import React from 'react';

import { myTopicsRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { AvailableTopicsFilters } from '@/features/topics/components/AvailableTopicsFilters';
import { useAvailableTopicsByScope, useGoToTheRoute, useSessionUser } from '@/hooks';
import { useT } from '@/i18n';

import { AvailableTopicsList } from './AvailableTopicsList';

interface TProps {
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  manageScope: TTopicsManageScopeId;
}

export function AvailableTopicsListPage(props: TProps) {
  const { availableTopicsQuery, manageScope } = props;

  const t = useT();
  const user = useSessionUser();
  const goToTheRoute = useGoToTheRoute();
  // const goBack = useGoBack(rootRoute);

  const {
    isFetched,
    isRefetching,
    refetch,
    // isLoading,
    // isError,
    // error,
    // hasTopics,
  } = availableTopicsQuery;

  const actions = React.useMemo<TActionMenuItem[]>(
    () =>
      [
        {
          id: 'ManageYourTopicsAction',
          content: t('AvailableTopicsListPage.ManageYourTopicsAction'),
          variant: 'ghost',
          icon: Icons.Edit,
          visibleFor: 'md',
          hidden: !user?.id,
          onClick: () => goToTheRoute(myTopicsRoute),
        },
        {
          id: 'reload',
          content: t('Reload'),
          variant: 'ghost',
          icon: Icons.Refresh,
          pending: isRefetching,
          visibleFor: 'md',
          disabled: !isFetched,
          onClick: refetch,
        },
      ] satisfies TActionMenuItem[],
    [goToTheRoute, user, refetch, isFetched, isRefetching, t],
  );

  return (
    <>
      <DashboardHeader
        heading={t('AvailableTopicsListPage.AvailableTopicsHeading')}
        className={cn(
          isDev && '__AvailableTopicsListPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        // breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <AvailableTopicsFilters
        className={cn(
          isDev && '__AvailableTopicsListPage_Filters', // DEBUG
          'mx-6',
        )}
      />
      <AvailableTopicsList
        className={cn(
          isDev && '__AvailableTopicsListPage_Content', // DEBUG
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        manageScope={manageScope}
        availableTopicsQuery={availableTopicsQuery}
      />
    </>
  );
}
