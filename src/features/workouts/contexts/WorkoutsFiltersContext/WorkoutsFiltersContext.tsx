'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TPropsWithChildren } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';

import {
  filtersDataDefaults,
  filtersDataSchema,
  TAvailableWorkoutsFiltersParams,
  TFiltersData,
} from './WorkoutsFiltersTypes';

interface TWorkoutsFiltersContextValue {
  form: ReturnType<typeof useForm<TFiltersData>>;
  filtersData: TFiltersData;
  onDefaults: boolean;
  isSubmitEnabled: boolean;
  isExpanded: boolean;
  isReady: boolean;
  error: string | null;
  handleApplyButton: (data: TFiltersData) => Promise<void>;
  handleResetToDefaults: () => void;
  handleClearChanges: () => void;
  toggleFilters: () => void;
  hideFilters: () => void;
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

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
      hasWorkoutStats,
      hasActiveWorkouts,
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
        onFiltersChanged?.(getFiltersParams());
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
    onFiltersChanged?.({});
  }, [form, onFiltersChanged, setStoredFilters]);

  const handleClearChanges = React.useCallback(() => {
    form.reset(storedFilters);
  }, [form, storedFilters]);

  const toggleFilters = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const hideFilters = React.useCallback(() => {
    setIsExpanded(false);
  }, []);

  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const value: TWorkoutsFiltersContextValue = React.useMemo(
    () => ({
      form,
      filtersData,
      onDefaults,
      isSubmitEnabled,
      isExpanded,
      isReady,
      error,
      handleApplyButton,
      handleResetToDefaults,
      handleClearChanges,
      toggleFilters,
      hideFilters,
      getFiltersParams,
    }),
    [
      form,
      filtersData,
      onDefaults,
      isSubmitEnabled,
      isExpanded,
      isReady,
      error,
      handleApplyButton,
      handleResetToDefaults,
      handleClearChanges,
      toggleFilters,
      hideFilters,
      getFiltersParams,
    ],
  );

  return (
    <WorkoutsFiltersContext.Provider value={value}>{children}</WorkoutsFiltersContext.Provider>
  );
}

export default WorkoutsFiltersContext;
