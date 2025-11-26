'use client';

import React from 'react';

import { myTopicsRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import {
  AvailableTopicsFilters,
  TApplyFiltersData,
} from '@/features/topics/components/AvailableTopicsFilters';
import { useAvailableTopicsByScope, useGoToTheRoute, useSessionUser } from '@/hooks';

import { AvailableTopicsList } from './AvailableTopicsList';

interface TProps {
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  manageScope: TTopicsManageScopeId;
  applyFilters: (applyFiltersData: TApplyFiltersData) => Promise<unknown> | void;
}

export function AvailableTopicsListPage(props: TProps) {
  const { availableTopicsQuery, manageScope, applyFilters } = props;
  // const [filtersData, setFiltersData] = React.useState<TFiltersData>(filtersDataDefaults);

  const [isFiltersInited, setIsFiltersInited] = React.useState(false);

  const interceptApplyFilters = React.useCallback(
    (applyFiltersData: TApplyFiltersData) => {
      applyFilters(applyFiltersData);
      setIsFiltersInited(true);
    },
    [applyFilters],
  );

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
          id: 'Manage Your Topics',
          content: 'Manage Your Topics',
          variant: 'ghost',
          icon: Icons.Edit,
          visibleFor: 'md',
          hidden: !user?.id,
          onClick: () => goToTheRoute(myTopicsRoute),
        },
        {
          id: 'reload',
          content: 'Reload',
          variant: 'ghost',
          icon: Icons.Refresh,
          pending: isRefetching,
          visibleFor: 'md',
          disabled: !isFetched,
          onClick: refetch,
        },
      ] satisfies TActionMenuItem[],
    [goToTheRoute, user, refetch, isFetched, isRefetching],
  );

  return (
    <>
      <DashboardHeader
        heading="Available Topics"
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
        applyFilters={interceptApplyFilters}
        augmentDefaults={{ hasQuestions: true }}
      />
      <AvailableTopicsList
        className={cn(
          isDev && '__AvailableTopicsListPage_Content', // DEBUG
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        isFiltersInited={isFiltersInited}
        manageScope={manageScope}
        availableTopicsQuery={availableTopicsQuery}
      />
    </>
  );
}
