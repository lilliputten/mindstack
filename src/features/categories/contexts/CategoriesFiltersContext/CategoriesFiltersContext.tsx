'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ErrorLike } from '@/lib/errors';
import { deepCompare, getErrorText, prepareObjectToLossyCompare } from '@/lib/helpers';
import { updateUrlParamsWithSchema } from '@/lib/helpers/urls';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { TSettings } from '@/features/settings/types';

import {
  CategoriesFiltersContextData,
  CategoriesFiltersProviderProps,
} from './CategoriesFiltersContextDefinitions';
import { filtersDataDefaults, filtersDataSchema, TFiltersData } from './CategoriesFiltersTypes';
import { parseUrlFilters } from './helpers/parseUrlFilters';

const CategoriesFiltersContext = React.createContext<CategoriesFiltersContextData | undefined>(
  undefined,
);

type TMemo = {
  inited?: boolean;
  initialzing?: boolean;
  restored?: boolean;
  applyFiltersData?: (filtersData: TFiltersData) => void;
  settings?: TSettings;
  isSettingsReady?: boolean;
  defaultFiltersData?: TFiltersData;
};

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

export function CategoriesFiltersProvider(props: CategoriesFiltersProviderProps) {
  const {
    children,
    applyFilters,
    augmentDefaults,
    storeId = 'CategoriesFilters',
    defaultExpanded = false,
  } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const [isInited, setIsInited] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isExpanded, setExpanded] = React.useState(defaultExpanded);
  const [onDefaults, setOnDefaults] = React.useState(true);
  const [error, setError] = React.useState<ErrorLike>();
  const [filtersData, setFiltersData] = React.useState<TFiltersData | undefined>();

  const router = useRouter();
  const searchParams = useSearchParams();

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
      // searchLang: settings.langCode,
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
          } else {
            // Update URL query parameters to reflect current filters using the shared function
            const newSearchParams = updateUrlParamsWithSchema(
              filtersData,
              filtersDataSchema,
              searchParams,
              defaultFiltersData,
            );
            // Update URL without page reload
            const queryString = newSearchParams.toString();
            const url = window.location.pathname + (queryString ? '?' + queryString : '');
            router.push(url, { scroll: false });
          }
        } catch (error) {
          const details = getErrorText(error);
          const message = 'Cannot update filters data';
          // eslint-disable-next-line no-console
          console.error(
            '[CategoriesFiltersContext:applyFiltersData]',
            [message, details].join(': '),
            {
              details,
              error,
              filtersData,
            },
          );
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
          setError(message);
        }
      });
    },
    [memo, applyFilters, form, storeId, searchParams, router, defaultFiltersData],
  );
  memo.applyFiltersData = applyFiltersData;

  // Helper function to parse URL query parameters using the zod schema
  const parseUrlParams = React.useCallback((): Partial<TFiltersData> => {
    if (typeof window === 'undefined') {
      return {};
    }
    const urlParams = parseUrlFilters(window.location.search);
    return urlParams;
  }, []);

  React.useEffect(() => {
    if (memo.inited || memo.initialzing || !isSettingsReady || !memo.defaultFiltersData) {
      return;
    }
    memo.initialzing = true;
    let filtersData: TFiltersData = memo.defaultFiltersData;

    // Override with localStorage values if available
    if (typeof window !== 'undefined' && !memo.restored) {
      const jsonStr = window.localStorage.getItem(storeId);
      if (jsonStr) {
        try {
          const rawData = JSON.parse(jsonStr);
          filtersData = filtersDataSchema.parse(rawData);
        } catch (error) {
          const details = getErrorText(error);
          const message = 'Cannot parse saved filters data';
          // eslint-disable-next-line no-console
          console.error('[CategoriesFiltersContext]', [message, details].join(': '), {
            details,
            jsonStr,
            error,
          });
          debugger; // eslint-disable-line no-debugger
        }
      }
      memo.restored = true;
    }

    // Finally, override with URL parameters if present
    const urlParams = parseUrlParams();
    if (Object.keys(urlParams).length > 0) {
      filtersData = {
        ...filtersData,
        ...urlParams,
      } satisfies TFiltersData;
    }

    memo.applyFiltersData?.(filtersData);
    memo.inited = true;
    setIsInited(true);
    memo.initialzing = false;
  }, [memo, isSettingsReady, settings, storeId, parseUrlParams]);

  const handleApplyButton = React.useCallback(
    (filtersData: TFiltersData) => {
      const trimmedFiltersData: TFiltersData = {
        ...filtersData,
        searchText: filtersData.searchText?.trim() || '',
        // searchLang: filtersData.searchLang?.trim() || '',
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
    const isDefaults = compareWithDefaults(memo.defaultFiltersData, filtersData);
    setOnDefaults(isDefaults);
  }, [memo, form, filtersData]);

  const contextValue: CategoriesFiltersContextData = {
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
    <CategoriesFiltersContext.Provider value={contextValue}>
      {children}
    </CategoriesFiltersContext.Provider>
  );
}

export function useCategoriesFiltersContext(): CategoriesFiltersContextData {
  const context = React.useContext(CategoriesFiltersContext);
  if (!context) {
    throw new Error('useCategoriesFiltersContext must be used within a CategoriesFiltersProvider');
  }
  return context;
}
