'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, myTopicsRoute } from '@/config';
import { isDev } from '@/constants';
import { AvailableWorkoutsFilters } from '@/features/workouts/components';
import { useWorkoutsFiltersContext } from '@/features/workouts/contexts';
import { useAvailableWorkouts } from '@/features/workouts/query-hooks';
import { useSessionData } from '@/hooks';

import { AvailableWorkoutsList } from './AvailableWorkoutsList';

export function AvailableWorkoutsListPage() {
  const t = useT();

  const {
    user,
    // loading: isUserLoading,
  } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';

  const { filtersParams, isReady } = useWorkoutsFiltersContext();

  console.log('[AvailableWorkoutsListPage:DEBUG]', {
    isReady,
    filtersParams,
  });

  const availableWorkoutsQuery = useAvailableWorkouts({
    traceId: 'AvailableWorkoutsListPage',
    enabled: isReady,
    includeStats: true,
    ...filtersParams,
  });

  const {
    // allWorkouts,
    // error,
    // fetchNextPage,
    // hasNextPage,
    // hasWorkouts,
    // isError,
    // isFetchingNextPage,
    // queryClient,
    // queryKey,
    // queryUrlHash,
    refetch,
    isFetched,
    isLoading,
    isRefetching,
    isLocal,
  } = availableWorkoutsQuery;

  const isBusy = !(isFetched || isLocal) || isLoading || isRefetching;

  const manageTopicsRoute = isAdmin ? allTopicsRoute : myTopicsRoute;

  const actions = React.useMemo<TActionMenuItem[]>(
    () =>
      [
        {
          id: 'ManageYourTopicsAction',
          content: t('ManageTopics'),
          variant: 'ghost',
          icon: Icons.Edit,
          visibleFor: 'xl',
          hidden: !user?.id,
          href: manageTopicsRoute,
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
    [t, user?.id, manageTopicsRoute, isRefetching, isFetched, refetch],
  );
  return (
    <>
      <DashboardHeader
        heading={t('Trainings')}
        className={cn(
          isDev && '__AvailableWorkoutsListPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        // breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <AvailableWorkoutsFilters
        className={cn(
          isDev && '__AvailableWorkoutsListPage_Filters', // DEBUG
          'mx-6',
          'transition',
          isBusy && 'opacity-50',
        )}
      />
      <AvailableWorkoutsList
        className={cn(
          isDev && '__AvailableWorkoutsListPage_List', // DEBUG
          'transition',
          isBusy && 'opacity-50',
        )}
        user={user}
        availableWorkoutsQuery={availableWorkoutsQuery}
      />
    </>
  );
}
