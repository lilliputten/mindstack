'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TPropsWithChildren } from '@/lib/types/react';
import { deepCompare, prepareObjectToLossyCompare } from '@/lib/helpers';
import { useLocalStorage, useSessionData } from '@/hooks';

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

function getFiltersParamsFromData(filtersData: TFiltersData) {
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
    searchText: searchText != null ? searchText : undefined,
    hasWorkoutStats: hasWorkoutStats != null ? hasWorkoutStats : undefined,
    hasActiveWorkouts: hasActiveWorkouts != null ? hasActiveWorkouts : undefined,
    langCode: langCode != null ? langCode : undefined,
    langName: langName != null ? langName : undefined,
    searchLang: searchLang != null ? searchLang : undefined,
    minStarted,
    maxStarted,
    minFinished,
    maxFinished,
  };
}

/** Lossy compare with defaults. Don't count:
 * - empty arrays
 * - empty strings
 * - nullable entries
 */
function compareWithDefaults(defaultFiltersData?: TFiltersData, filtersData?: TFiltersData) {
  if (!defaultFiltersData || !filtersData) {
    return false;
  }
  const cmp1 = prepareObjectToLossyCompare(defaultFiltersData);
  const cmp2 = prepareObjectToLossyCompare(filtersData);
  return deepCompare(cmp1, cmp2);
}

export function WorkoutsFiltersContextProvider(props: TWorkoutsFiltersContextProviderProps) {
  const { children, storageKey = 'workouts-filters', onFiltersChanged } = props;

  const { loading: isUserLoading, authenticated: isAuthenticated } = useSessionData();
  const isLocal = !isAuthenticated;

  const [isExpanded, setExpanded] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [isInited, setIsInited] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [filtersParams, setFiltersParams] = React.useState<TAvailableWorkoutsFiltersParams>({});

  const [storedFilters, setStoredFilters, localStorageInited] = useLocalStorage<TFiltersData>(
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
    () => compareWithDefaults(filtersDataDefaults, filtersData),
    [filtersData],
  );

  const getFiltersParams = React.useCallback((): TAvailableWorkoutsFiltersParams => {
    return getFiltersParamsFromData(filtersData);
  }, [filtersData]);

  const handleApplyButton = React.useCallback(
    async (data: TFiltersData) => {
      try {
        form.reset(data);
        const isDefaults = JSON.stringify(data) === JSON.stringify(filtersDataDefaults);
        const saveData = isDefaults ? undefined : data;
        setStoredFilters(saveData);
        const filtersParams = getFiltersParamsFromData(data);
        setFiltersParams(filtersParams);
        onFiltersChanged?.(filtersParams);
        setExpanded(false);
        if (!isInited) {
          setIsInited(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        // eslint-disable-next-line no-console
        console.error('[WorkoutsFiltersContext:handleApplyButton]', { error: err });
      }
    },
    [form, isInited, onFiltersChanged, setStoredFilters],
  );

  const handleResetToDefaults = React.useCallback(() => {
    form.reset(filtersDataDefaults);
    setStoredFilters(undefined);
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

  // Initialization
  React.useEffect(() => {
    if (isInited || !localStorageInited) return;
    // Initialize with stored filters or defaults
    const initialFilters = { ...filtersDataDefaults, ...storedFilters };
    form.reset(initialFilters);
    setStoredFilters(initialFilters);
    const filtersParams = getFiltersParamsFromData(initialFilters);
    setFiltersParams(filtersParams);
    setIsReady(true);
    setIsInited(true);
  }, [form, isInited, localStorageInited, storedFilters, setStoredFilters, storageKey]);

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
      isReady: isReady && !isUserLoading && localStorageInited,
      isInited,
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
      localStorageInited,
      isLocal,
      error,
      handleApplyButton,
      handleResetToDefaults,
      handleClearChanges,
      toggleFilters,
      hideFilters,
      expandFilters,
      getFiltersParams,
      isInited,
    ],
  );

  return (
    <WorkoutsFiltersContext.Provider value={value}>{children}</WorkoutsFiltersContext.Provider>
  );
}

export default WorkoutsFiltersContext;
