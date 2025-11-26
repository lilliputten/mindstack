'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TApplyFiltersData } from '@/features/topics/components';
import {
  convertAvailableFiltersToParams,
  TAvailableTopicsFiltersParams,
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

  const applyFilters = React.useCallback(async (applyFiltersData: TApplyFiltersData) => {
    const { isInitial, ...filtersData } = applyFiltersData;
    const filtersParams = convertAvailableFiltersToParams(filtersData);
    console.log('[AvailableTopicsListWrapper:applyFilters]', {
      isInitial,
      filtersData,
      filtersParams,
    });
    setIsFiltersInited(true);
    setFiltersParams(filtersParams);
    if (isDev) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }, []);

  const availableTopicsQuery = useAvailableTopicsByScope({
    manageScope,
    enabled: isFiltersInited,
    ...filtersParams,
    // includeWorkout: true,
    // DEBUG: Test search options
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
    isError,
    refetch,
    error,
    // hasTopics,
    // isFetched,
  } = availableTopicsQuery;

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
    <AvailableTopicsListPage
      availableTopicsQuery={availableTopicsQuery}
      manageScope={manageScope}
      applyFilters={applyFilters}
    />
  );
}
