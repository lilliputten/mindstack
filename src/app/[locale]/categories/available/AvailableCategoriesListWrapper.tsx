'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

import { cn } from '@/lib/utils';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
// import { CategoriesManageScopeIds, TCategoriesManageScopeId } from '@/contexts/CategoriesContext';
// import {
//   CategoriesFiltersProvider,
//   convertAvailableFiltersToParams,
//   TApplyFiltersData,
//   TAvailableCategoriesFiltersParams,
// } from '@/contexts/CategoriesFiltersContext';
import {
  CategoriesFiltersProvider,
  convertAvailableFiltersToParams,
  TApplyFiltersData,
  TAvailableCategoriesFiltersParams,
  TFiltersData,
  useAvailableCategories,
} from '@/features/categories';

import { AvailableCategoriesListPage } from './AvailableCategoriesListPage';

/** Used for tests below */
// const now = new Date();

export function AvailableCategoriesListWrapper() {
  // const manageScope: TCategoriesManageScopeId = CategoriesManageScopeIds.AVAILABLE_TOPICS;

  /* // User: is it necessary here?
   * const {
   *   data: sessionData,
   *   // status: sessionStatus,
   * } = useSession();
   * const user = sessionData?.user;
   */

  /** Use only public categories */
  const onlyPublic = true;

  const [filtersParams, setFiltersParams] = React.useState<
    TAvailableCategoriesFiltersParams | undefined
  >();

  const augmentFiltersDefaults = React.useMemo<Partial<TFiltersData>>(
    () => ({ status: 'PUBLIC' }),
    [],
  );

  const availableCategoriesQuery = useAvailableCategories({
    enabled: !!filtersParams,
    status: onlyPublic ? 'PUBLIC' : undefined,
    ...filtersParams,
    // includeWorkout: true,
    // // DEBUG: Sort examples
    // orderBy: { createdAt: 'desc' },
    // orderBy: [ { name: 'asc' }, { createdAt: 'desc' }, { updatedAt: 'desc' } ],
    // orderBy: [{ name: 'asc' }, { updatedAt: 'desc' }],
    // // DEBUG: Test search options
    // searchText: 'test',
    // hasWorkoutStats: true,
    // hasActiveWorkouts: true,
    // hasQuestions: false,
    // minCreatedAt: createDateWithDaysDiff(-5, now),
    // maxCreatedAt: createDateWithDaysDiff(-5, now),
    // minUpdatedAt: createDateWithDaysDiff(-5, now),
    // maxUpdatedAt: createDateWithDaysDiff(-5, now),
    // langCode: 'za', // Exact language conde
    // langName: 'Zhuang; Chuang', // Exact language name
    // searchLang: 'Chua', // Fuzzy language name opr code
  });
  const {
    queryClient,
    queryKey,
    isError,
    refetch,
    error,
    // hasCategories,
    // isFetched,
  } = availableCategoriesQuery;

  /* // DEBUG: Show current query key
   * React.useEffect(() => {
   *   const debugKey = queryKey.map(String).map(decodeURIComponent).join(', ').replace(/&/g, ' ');
   *   console.log('[AvailableCategoriesListWrapper:DEBUG]', debugKey, {
   *     queryKey,
   *   });
   * }, [queryKey]);
   */

  const applyFilters = React.useCallback(
    async (filtersData: TApplyFiltersData) => {
      const filtersParams = convertAvailableFiltersToParams(filtersData);
      setFiltersParams(filtersParams);
      queryClient.removeQueries({ queryKey });
      if (isDev) {
        await new Promise((r) => setTimeout(r, 500));
      }
    },
    [queryClient, queryKey],
  );

  if (isError) {
    return (
      <PageError
        className={cn(
          isDev && '__ManageCategoriesListWrapper_Error', // DEBUG
          'my-0',
        )}
        error={error || 'Error loading available categories data'}
        reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  return (
    <CategoriesFiltersProvider
      storeId="available-categories-filters"
      applyFilters={applyFilters}
      augmentDefaults={augmentFiltersDefaults}
      onlyPublic={onlyPublic}
      // defaultExpanded // DEBUG: Open by default
    >
      <AvailableCategoriesListPage availableCategoriesQuery={availableCategoriesQuery} />
    </CategoriesFiltersProvider>
  );
}
