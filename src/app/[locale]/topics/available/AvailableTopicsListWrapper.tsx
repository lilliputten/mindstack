'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import {
  convertAvailableFiltersToParams,
  TApplyFiltersData,
  TAvailableTopicsFiltersParams,
  TopicsFiltersProvider,
} from '@/features/topics/components/AvailableTopicsFilters';
import { useAvailableTopicsByScope } from '@/hooks';

import { AvailableTopicsListPage } from './AvailableTopicsListPage';

/** Used for tests below */
// const now = new Date();

export function AvailableTopicsListWrapper() {
  const manageScope: TTopicsManageScopeId = TopicsManageScopeIds.AVAILABLE_TOPICS;

  const [isFiltersInited, setIsFiltersInited] = React.useState(false);
  const [filtersParams, setFiltersParams] = React.useState<
    TAvailableTopicsFiltersParams | undefined
  >();

  const augmentFiltersDefaults = React.useMemo(() => ({ hasQuestions: true }), []);

  const availableTopicsQuery = useAvailableTopicsByScope({
    manageScope,
    enabled: isFiltersInited,
    ...filtersParams,
    orderBy: [
      // Sort examples
      { name: 'asc' },
      { createdAt: 'desc' },
      { updatedAt: 'desc' },
    ],
    // orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
    // includeWorkout: true,
    // DEBUG: Test search options
    // orderBy: { createdAt: 'desc' },
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
    // hasTopics,
    // isFetched,
  } = availableTopicsQuery;

  React.useEffect(() => {
    console.log(
      '[AvailableTopicsListWrapper:DEBUG]',
      queryKey.map(String).map(decodeURIComponent).join(','),
      {
        queryKey,
      },
    );
  }, [queryKey]);

  const applyFilters = React.useCallback(
    async (filtersData: TApplyFiltersData) => {
      const filtersParams = convertAvailableFiltersToParams(filtersData);
      setIsFiltersInited(true);
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
          isDev && '__ManageTopicsListWrapper_Error', // DEBUG
          'my-0',
        )}
        error={error || 'Error loading available topics data'}
        reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  return (
    <TopicsFiltersProvider
      storeId="AvailableTopicsFilters"
      applyFilters={applyFilters}
      augmentDefaults={augmentFiltersDefaults}
      // defaultExpanded
    >
      <AvailableTopicsListPage
        availableTopicsQuery={availableTopicsQuery}
        manageScope={manageScope}
      />
    </TopicsFiltersProvider>
  );
}
