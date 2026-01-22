'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/constants';
import { AvailableWorkoutsFilters } from '@/features/workouts/components';
import { useWorkoutsFiltersContext } from '@/features/workouts/contexts';
import { useAvailableWorkouts } from '@/features/workouts/query-hooks';

import { AvailableWorkoutsList } from './AvailableWorkoutsList';

type TProps = TPropsWithClassName;

export function AvailableWorkoutsListPage(props: TProps) {
  const t = useT();
  const { className } = props;

  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  // const isAdmin = user?.role === 'ADMIN';

  // const goBack = useGoBack(startAliasRoute);
  //
  // const {
  //   isInited: isFiltersInited,
  //   isExpanded: isFiltersExpanded,
  //   expandFilters,
  // } = useWorkoutsFiltersContext();

  const { filtersData } = useWorkoutsFiltersContext();

  // const filtersParams = React.useMemo(() => getFiltersParams(), [getFiltersParams]);

  // const [filtersParams, setFiltersParams] = React.useState<Record<string, unknown> | undefined>();
  // // Effect: Update filters
  // React.useEffect(() => {
  //   // Update query when filters change in context
  //   const params = getFiltersParams();
  //   setFiltersParams(params);
  // }, [getFiltersParams]);

  const availableWorkoutsQuery = useAvailableWorkouts({
    traceId: 'AvailableWorkoutsListPage',
    enabled: !!filtersData,
    ...filtersData,
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
    // refetch,
    isFetched,
    isLoading,
    isRefetching,
  } = availableWorkoutsQuery;

  const isBusy = !isFetched || isLoading || isRefetching;

  // const saveScrollHash = React.useMemo(
  //   () => sessionSaveScrollHash + getAbcHashString(queryUrlHash),
  //   [queryUrlHash],
  // );

  // if (isError) {
  //   return (
  //     <PageError
  //       className={cn(
  //         isDev && '__AvailableWorkoutsListPage_Error', // DEBUG
  //         'my-0',
  //       )}
  //       error={error || 'Error loading available workouts data'}
  //       reset={refetch}
  //     />
  //   );
  // }

  // if (!isFetched || !isFiltersInited) {
  //   return <ContentListSkeleton className="px-6" />;
  // }

  return (
    <>
      <AvailableWorkoutsFilters
        className={cn(
          isDev && '__AvailableWorkoutsListPage_Filters', // DEBUG
          'mx-6',
          'transition',
          isBusy && 'opacity-50',
        )}
      />

      <AvailableWorkoutsList
        className={className}
        user={user}
        availableWorkoutsQuery={availableWorkoutsQuery}
      />
    </>
  );
}
