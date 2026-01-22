'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

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

import { AvailableWorkoutsList } from './AvailableWorkoutsList';

export function AvailableWorkoutsListPage() {
  const t = useT();

  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const isAdmin = user?.role === 'ADMIN';

  const { filtersData } = useWorkoutsFiltersContext();

  // Use separate state for query parameters to avoid refetching on every field change
  const [queryParams, setQueryParams] = React.useState<Record<string, unknown> | undefined>();

  // Initialize query params only once when filters are first available
  React.useEffect(() => {
    if (filtersData && !queryParams) {
      const params = {
        ...filtersData,
        hasWorkoutStats:
          filtersData.hasWorkoutStats === null ? undefined : filtersData.hasWorkoutStats,
        hasActiveWorkouts:
          filtersData.hasActiveWorkouts === null ? undefined : filtersData.hasActiveWorkouts,
      };
      setQueryParams(params);
    }
  }, [filtersData, queryParams]);

  const availableWorkoutsQuery = useAvailableWorkouts({
    traceId: 'AvailableWorkoutsListPage',
    enabled: !!queryParams,
    includeStats: true,
    ...queryParams,
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
  } = availableWorkoutsQuery;

  const isBusy = !isFetched || isLoading || isRefetching;

  const manageTopicsRoute = isAdmin ? allTopicsRoute : myTopicsRoute;

  const actions = React.useMemo<TActionMenuItem[]>(
    () =>
      [
        {
          id: 'ManageYourTopicsAction',
          content: t('AvailableTopicsList.ManageTopics'),
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
