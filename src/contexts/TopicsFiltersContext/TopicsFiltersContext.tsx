'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ErrorLike } from '@/lib/errors';
import { deepCompare, getErrorText } from '@/lib/helpers';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { TSettings } from '@/features/settings/types';

import {
  TopicsFiltersContextData,
  TopicsFiltersProviderProps,
} from './TopicsFiltersContextDefinitions';
import { filtersDataDefaults, filtersDataSchema, TFiltersData } from './TopicsFiltersTypes';

const TopicsFiltersContext = React.createContext<TopicsFiltersContextData | undefined>(undefined);

type TMemo = {
  inited?: boolean;
  initialzing?: boolean;
  restored?: boolean;
  applyFiltersData?: (filtersData: TFiltersData) => void;
  settings?: TSettings;
  isSettingsReady?: boolean;
  defaultFiltersData?: TFiltersData;
};

export function TopicsFiltersProvider(props: TopicsFiltersProviderProps) {
  const { children, applyFilters, augmentDefaults, storeId = 'TopicsFilters' } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const [isInited, setIsInited] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isExpanded, setExpanded] = React.useState(false);
  const [onDefaults, setOnDefaults] = React.useState(true);
  const [error, setError] = React.useState<ErrorLike>();
  const [filtersData, setFiltersData] = React.useState<TFiltersData | undefined>();

  const expandFilters = React.useCallback(() => setExpanded(true), []);
  const hideFilters = React.useCallback(() => setExpanded(false), []);
  const toggleFilters = React.useCallback(() => setExpanded((isExpanded) => !isExpanded), []);

  const { ready: isSettingsReady, settings } = useSettingsContext();
  memo.isSettingsReady = isSettingsReady;
  memo.settings = settings;

  const defaultFiltersData = React.useMemo<TFiltersData>(() => {
    const filtersData = {
      ...filtersDataDefaults,
      ...augmentDefaults,
    };
    if (!isSettingsReady || !settings) {
      return filtersData;
    }
    return {
      ...filtersData,
      showOnlyMyTopics: !!settings.showOnlyMyTopics,
      searchLang: settings.langCode,
    } satisfies TFiltersData;
  }, [settings, augmentDefaults, isSettingsReady]);
  memo.defaultFiltersData = defaultFiltersData;

  const form = useForm<TFiltersData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(filtersDataSchema),
    defaultValues: defaultFiltersData,
  });
  const { isDirty, isValid } = form.formState;
  const isReady = isInited && !isPending;
  const isSubmitEnabled = isReady && isDirty && isValid;

  const applyFiltersData = React.useCallback(
    (filtersData: TFiltersData) => {
      startTransition(async () => {
        const isDefaults = deepCompare(memo.defaultFiltersData, filtersData);
        setError(undefined);
        try {
          await applyFilters(filtersData);
          form.reset(filtersData);
          setFiltersData(filtersData);
          setOnDefaults(isDefaults);
          if (typeof window !== 'undefined') {
            if (isDefaults) {
              window.localStorage.removeItem(storeId);
            } else {
              window.localStorage.setItem(storeId, JSON.stringify(filtersData));
            }
          }
          if (!memo.inited) {
            memo.inited = true;
            setIsInited(true);
          }
        } catch (error) {
          const details = getErrorText(error);
          const message = 'Cannot update filters data';
          // eslint-disable-next-line no-console
          console.error('[TopicsFiltersContext:applyFiltersData]', message, {
            details,
            error,
            filtersData,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
          setError(message);
        }
      });
    },
    [memo, form, applyFilters, storeId],
  );
  memo.applyFiltersData = applyFiltersData;

  React.useEffect(() => {
    if (memo.inited || memo.initialzing || !isSettingsReady || !memo.defaultFiltersData) {
      return;
    }
    memo.initialzing = true;
    let filtersData: TFiltersData = memo.defaultFiltersData;
    if (typeof window !== 'undefined' && !memo.restored) {
      const jsonStr = window.localStorage.getItem(storeId);
      if (jsonStr) {
        try {
          const rawData = JSON.parse(jsonStr);
          filtersData = filtersDataSchema.parse(rawData);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[TopicsFiltersContext] Cannot parse saved filters data', {
            jsonStr,
            error,
          });
          debugger; // eslint-disable-line no-debugger
        }
      }
      memo.restored = true;
    }
    memo.applyFiltersData?.(filtersData);
    memo.inited = true;
    setIsInited(true);
    memo.initialzing = false;
  }, [memo, isSettingsReady, settings, storeId]);

  const handleApplyButton = React.useCallback(
    (filtersData: TFiltersData) => {
      const trimmedFiltersData: TFiltersData = {
        ...filtersData,
        searchText: filtersData.searchText?.trim() || '',
        searchLang: filtersData.searchLang?.trim() || '',
      };
      memo.applyFiltersData?.(trimmedFiltersData);
      setExpanded(false);
    },
    [memo],
  );

  const handleResetToDefaults = React.useCallback(() => {
    if (!memo.defaultFiltersData) {
      return;
    }
    form.reset(memo.defaultFiltersData);
    memo.applyFiltersData?.(memo.defaultFiltersData);
    setExpanded(false);
  }, [memo, form]);

  const handleClearChanges = React.useCallback(() => {
    if (!memo.defaultFiltersData) {
      return;
    }
    form.reset(filtersData);
    const isDefaults = deepCompare(memo.defaultFiltersData, filtersData);
    setOnDefaults(isDefaults);
  }, [memo, form, filtersData]);

  const contextValue: TopicsFiltersContextData = {
    isInited,
    isPending,
    isExpanded,
    onDefaults,
    error,
    filtersData,
    defaultFiltersData,
    form,
    isReady,
    isSubmitEnabled,
    setExpanded,
    toggleFilters,
    expandFilters,
    hideFilters,
    handleApplyButton,
    handleResetToDefaults,
    handleClearChanges,
  };

  return (
    <TopicsFiltersContext.Provider value={contextValue}>{children}</TopicsFiltersContext.Provider>
  );
}

export function useTopicsFiltersContext(): TopicsFiltersContextData {
  const context = React.useContext(TopicsFiltersContext);
  if (!context) {
    throw new Error('useTopicsFiltersContext must be used within a TopicsFiltersProvider');
  }
  return context;
}
