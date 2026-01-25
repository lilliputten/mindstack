'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { PageError } from '@/components/shared/PageError';
import { availableCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import {
  CategoriesFiltersProvider,
  convertAvailableFiltersToParams,
  TApplyFiltersData,
  TAvailableCategoriesFiltersParams,
  TFiltersData,
} from '@/features/categories/contexts';
import { useAvailableCategories } from '@/features/categories/query-hooks';
import { useGoToTheRoute } from '@/hooks';

import { AvailableCategoriesListPage } from './AvailableCategoriesListPage';

interface TAvailableCategoriesListWrapperProps {
  showSuggestModal?: boolean;
  params?: { locale: string };
}

export function AvailableCategoriesListWrapper(props: TAvailableCategoriesListWrapperProps) {
  const { showSuggestModal } = props;
  const routePath = availableCategoriesRoute;
  const goToTheRoute = useGoToTheRoute();

  // Suggest Category Modal
  const openSuggestCategoryModal = React.useCallback(() => {
    const url = `${routePath}/suggest`;
    goToTheRoute(url);
  }, [routePath, goToTheRoute]);
  React.useEffect(() => {
    if (showSuggestModal) {
      openSuggestCategoryModal();
    }
  }, [showSuggestModal, openSuggestCategoryModal]);

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
    traceId: 'AvailableCategoriesListWrapper',
    enabled: !!filtersParams,
    status: onlyPublic ? 'PUBLIC' : undefined,
    // all: true, // Using InfiniteScroller
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
