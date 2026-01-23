'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TPropsWithChildren } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSessionData, useSessionUser } from '@/hooks';

import {
  filtersDataDefaults,
  filtersDataSchema,
  TAvailableWorkoutsFiltersParams,
  TFiltersData,
} from './WorkoutsFiltersTypes';

interface TWorkoutsFiltersContextValue {
  form: ReturnType<typeof useForm<TFiltersData>>;
  filtersParams: TAvailableWorkoutsFiltersParams;
  filtersData: TFiltersData;
  onDefaults: boolean;
  isSubmitEnabled: boolean;
  isExpanded: boolean;
  isReady: boolean;
  isInited: boolean;
  isLocal: boolean;
  error: string | null;
  handleApplyButton: (data: TFiltersData) => Promise<void>;
  handleResetToDefaults: () => void;
  handleClearChanges: () => void;
  toggleFilters: () => void;
  hideFilters: () => void;
  expandFilters: () => void;
  getFiltersParams: () => TAvailableWorkoutsFiltersParams;
}

const WorkoutsFiltersContext = React.createContext<TWorkoutsFiltersContextValue | undefined>(
  undefined,
);

export const useWorkoutsFiltersContext = () => {
  const context = React.useContext(WorkoutsFiltersContext);
  if (!context) {
    throw new Error('useWorkoutsFiltersContext must be used within WorkoutsFiltersContextProvider');
  }
  return context;
};

interface TWorkoutsFiltersContextProviderProps extends TPropsWithChildren {
  storageKey?: string;
  onFiltersChanged?: (filters: TAvailableWorkoutsFiltersParams) => void;
}

export function WorkoutsFiltersContextProvider(props: TWorkoutsFiltersContextProviderProps) {
  const { children, storageKey = 'workouts-filters', onFiltersChanged } = props;

  const { loading: isUserLoading, authenticated: isAuthenticated } = useSessionData();
  const isLocal = !isAuthenticated;

  const [isExpanded, setExpanded] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [filtersParams, setFiltersParams] = React.useState<TAvailableWorkoutsFiltersParams>({});

  const [storedFilters, setStoredFilters] = useLocalStorage<TFiltersData>(
    storageKey,
    filtersDataDefaults,
  );

  const form = useForm<TFiltersData>({
    resolver: zodResolver(filtersDataSchema),
    defaultValues: storedFilters,
  });

  const filtersData = form.watch();
  const isSubmitEnabled = form.formState.isDirty;
  const onDefaults = React.useMemo(
    () => JSON.stringify(filtersData) === JSON.stringify(filtersDataDefaults),
    [filtersData],
  );

  const getFiltersParams = React.useCallback((): TAvailableWorkoutsFiltersParams => {
    const {
      searchText,
      hasWorkoutStats,
      hasActiveWorkouts,
      langCode,
      langName,
      searchLang,
      minStarted,
      maxStarted,
      minFinished,
      maxFinished,
    } = filtersData;

    return {
      searchText: searchText || undefined,
      hasWorkoutStats: hasWorkoutStats || undefined,
      hasActiveWorkouts: hasActiveWorkouts || undefined,
      langCode: langCode || undefined,
      langName: langName || undefined,
      searchLang: searchLang || undefined,
      minStarted,
      maxStarted,
      minFinished,
      maxFinished,
    };
  }, [filtersData]);

  const handleApplyButton = React.useCallback(
    async (data: TFiltersData) => {
      try {
        setStoredFilters(data);
        form.reset(data);
        const filtersParams = getFiltersParams();
        setFiltersParams(filtersParams);
        onFiltersChanged?.(filtersParams);
        setExpanded(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        // eslint-disable-next-line no-console
        console.error('[WorkoutsFiltersContext:handleApplyButton]', { error: err });
      }
    },
    [form, getFiltersParams, onFiltersChanged, setStoredFilters],
  );

  const handleResetToDefaults = React.useCallback(() => {
    form.reset(filtersDataDefaults);
    setStoredFilters(filtersDataDefaults);
    setFiltersParams({});
    onFiltersChanged?.({});
  }, [form, onFiltersChanged, setStoredFilters]);

  const handleClearChanges = React.useCallback(() => {
    form.reset(storedFilters);
  }, [form, storedFilters]);

  const toggleFilters = React.useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const hideFilters = React.useCallback(() => {
    setExpanded(false);
  }, []);

  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const expandFilters = React.useCallback(() => {
    if (!isExpanded) {
      setExpanded(true);
    }
  }, [isExpanded]);

  const value = React.useMemo<TWorkoutsFiltersContextValue>(
    () => ({
      form,
      filtersParams,
      filtersData,
      onDefaults,
      isSubmitEnabled,
      isExpanded,
      isReady: isReady && !isUserLoading,
      isInited: isReady,
      isLocal,
      error,
      handleApplyButton,
      handleResetToDefaults,
      handleClearChanges,
      toggleFilters,
      hideFilters,
      expandFilters,
      getFiltersParams,
    }),
    [
      form,
      filtersParams,
      filtersData,
      onDefaults,
      isSubmitEnabled,
      isExpanded,
      isReady,
      isUserLoading,
      isLocal,
      error,
      handleApplyButton,
      handleResetToDefaults,
      handleClearChanges,
      toggleFilters,
      hideFilters,
      expandFilters,
      getFiltersParams,
    ],
  );

  return (
    <WorkoutsFiltersContext.Provider value={value}>{children}</WorkoutsFiltersContext.Provider>
  );
}

export default WorkoutsFiltersContext;
