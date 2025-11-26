'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ErrorLike } from '@/lib/errors';
import { deepCompare, getErrorText } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { SettingsContextData, useSettingsContext } from '@/contexts/SettingsContext';
import { TSettings } from '@/features/settings/types';

import { AvailableTopicsFiltersFields } from './AvailableTopicsFiltersFields';
import { getActiveFilterIds } from './AvailableTopicsFiltersHelpers';
import { AvailableTopicsFiltersInfo } from './AvailableTopicsFiltersInfo';
import {
  filtersDataDefaults,
  filtersDataSchema,
  TFiltersData,
} from './AvailableTopicsFiltersTypes';

export type TApplyFiltersData = TFiltersData /* & { isInitial: boolean } */;

interface TProps extends TPropsWithClassName {
  applyFilters: (applyFiltersData: TApplyFiltersData) => Promise<unknown> | void;
  storeId?: string;
}

type TMemo = {
  inited?: boolean;
  initialzing?: boolean;
  restored?: boolean;
  applyFiltersData?: (filtersData: TFiltersData) => void;
  settings?: TSettings;
  isSettingsReady?: boolean;
  defaultFiltersData?: TFiltersData;
};

export function AvailableTopicsFilters(props: TProps) {
  const { className, applyFilters, storeId = 'AvailableTopicsFilters' } = props;

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const [isInited, setIsInited] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [onDefaults, setOnDefaults] = React.useState(true);
  const [error, setError] = React.useState<ErrorLike>();

  const [filtersData, setFiltersData] = React.useState<TFiltersData | undefined>();

  const settingsContext: SettingsContextData = useSettingsContext();
  const { ready: isSettingsReady, settings } = settingsContext;
  memo.isSettingsReady = isSettingsReady;
  memo.settings = settings;

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const defaultFiltersData = React.useMemo<TFiltersData>(() => {
    if (!isSettingsReady || !settings) {
      return filtersDataDefaults;
    }
    return {
      ...filtersDataDefaults,
      showOnlyMyTopics: !!settings.showOnlyMyTopics,
      searchLang: settings.langCode,
    } satisfies TFiltersData;
  }, [settings, isSettingsReady]);
  memo.defaultFiltersData = defaultFiltersData;

  const form = useForm<TFiltersData>({
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(filtersDataSchema),
    defaultValues: defaultFiltersData, // filtersData,
  });
  const { isDirty, isValid } = form.formState;
  const isReady = isInited && !isPending; // isDataReady && isUserReady;
  const isSubmitEnabled = isReady && isDirty && isValid;

  /* // DEBUG: Effect: Watch form values
   * const formData: TFiltersData = form.watch();
   * React.useEffect(() => {
   *   console.log('[AvailableTopicsFilters] DEBUG: Effect: Watch form values', {
   *     formData,
   *     hasWorkoutStats: formData.hasWorkoutStats,
   *   });
   * }, [formData]);
   */

  const captionFormData = filtersData;

  const filtersInfo = React.useMemo(
    () => (
      <AvailableTopicsFiltersInfo className="truncate font-normal" filtersData={captionFormData} />
    ),
    [captionFormData],
  );

  const activeFilterIds = getActiveFilterIds(captionFormData);
  const hasFilters = !!activeFilterIds.length;

  const filterCaption = React.useMemo(() => {
    if (!hasFilters) {
      return 'No active filters';
    }
    return <span className="flex items-center gap-2 truncate">{filtersInfo}</span>;
  }, [hasFilters, filtersInfo]);

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
          if (memo.inited) {
            memo.inited = true;
            setIsInited(true);
          }
        } catch (error) {
          const details = getErrorText(error);
          const message = 'Cannot update filters data';
          // eslint-disable-next-line no-console
          console.error('[AvailableTopicsFilters:applyFiltersData]', message, {
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

  // Effect: Initiazlize & restore saved filters data
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
          const errMsg = 'Can not parse saved filters data';
          // eslint-disable-next-line no-console
          console.error('[AvailableTopicsFilters]', errMsg, {
            jsonStr,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          // toast.error('Can not parse saved filters data');
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
      // Trim searchText and searchLang values
      const trimmedFiltersData: TFiltersData = {
        ...filtersData,
        searchText: filtersData.searchText?.trim() || '',
        searchLang: filtersData.searchLang?.trim() || '',
      };
      memo.applyFiltersData?.(trimmedFiltersData);
      setIsExpanded(false);
    },
    [memo],
  );

  const handleResetToDefaults = React.useCallback(() => {
    if (!memo.defaultFiltersData) {
      return;
    }
    form.reset(memo.defaultFiltersData);
    // setOnDefaults(true);
    memo.applyFiltersData?.(memo.defaultFiltersData);
    setIsExpanded(false);
  }, [memo, form]);

  const handleClearChanges = React.useCallback(() => {
    if (!memo.defaultFiltersData) {
      return;
    }
    form.reset(filtersData);
    const isDefaults = deepCompare(memo.defaultFiltersData, filtersData);
    setOnDefaults(isDefaults);
  }, [memo, form, filtersData]);

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={cn(
          isDev && '__AvailableTopicsFilters', // DEBUG
          'flex flex-col',
          !isExpanded && 'shrink-0',
          !isReady && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <CardHeader
          className={cn(
            isDev && '__AvailableTopicsFilters_Header', // DEBUG
            'flex flex-row items-center justify-between space-y-0 p-0',
            'shrink-0',
            'overflow-hidden',
          )}
        >
          <CardTitle className="rounded-0 w-full">
            <Tooltip key="AvailableTopicsFilters-Caption">
              <TooltipTrigger asChild>
                <Button
                  variant={isExpanded ? 'ghost' : 'theme'}
                  onClick={() => setIsExpanded((isExpanded) => !isExpanded)}
                  className="flex w-full items-center gap-2 rounded-none"
                >
                  <span className="flex flex-1 items-center gap-2 truncate">
                    <HeaderIcon className={cn('size-4 shrink-0', !isReady && 'animate-spin')} />
                    {filterCaption}
                  </span>
                  <span className="flex items-center gap-2">
                    <ToggleIcon className="size-4" />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-2 truncate">
                {hasFilters ? (
                  <>Displaying: {filtersInfo}</>
                ) : isExpanded ? (
                  'Click to hide settings'
                ) : (
                  'Expand to change display settings'
                )}
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent
            className={cn(
              isDev && '__AvailableTopicsFilters_Content', // DEBUG
              'overflow-hidden',
              'flex flex-col',
              'px-0',
              'py-0',
            )}
          >
            <ScrollArea
              className={cn(
                isDev && '__AvailableTopicsFilters_Scroll', // DEBUG
              )}
              viewportClassName={cn(
                isDev && '__AvailableTopicsFilters_ScrollViewport', // DEBUG
                'flex py-6 flex-col flex-1',
                '[&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
              )}
            >
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleApplyButton)}
                  className={cn(
                    isDev && '__AvailableTopicsFilters', // DEBUG
                    'flex flex-col gap-4',
                    className,
                  )}
                >
                  {error && (
                    <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
                      <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
                      <span className="text-red-500">{String(error)}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      isDev && '__AvailableTopicsFilters_Fields', // DEBUG
                      'flex flex-col gap-4',
                    )}
                  >
                    <AvailableTopicsFiltersFields form={form} />
                  </div>
                  <div
                    className={cn(
                      isDev && '__AvailableTopicsFilters_Actions', // DEBUG
                      'flex flex-col flex-wrap gap-2 pt-2 sm:flex-row',
                    )}
                  >
                    <div
                      className={cn(
                        isDev && '__AvailableTopicsFilters_ActionsLeft', // DEBUG
                        'flex flex-1 flex-wrap items-end gap-2',
                      )}
                    >
                      <Button
                        type="submit"
                        variant="theme"
                        disabled={!isSubmitEnabled}
                        className="flex items-center gap-2"
                      >
                        <Icons.Check className="size-4 opacity-50" />
                        Apply
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetToDefaults}
                        disabled={onDefaults}
                        className="flex items-center gap-2"
                      >
                        <Icons.Close className="size-4 opacity-50" />
                        Reset to defaults
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearChanges}
                        disabled={!isDirty}
                        className="flex items-center gap-2"
                      >
                        <Icons.Close className="size-4 opacity-50" />
                        Clear changes
                      </Button>
                    </div>
                    <div
                      className={cn(
                        isDev && '__AvailableTopicsFilters_ActionsLeft', // DEBUG
                        'flex flex-wrap items-end gap-2',
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center gap-2"
                      >
                        <Icons.ChevronUp className="size-4 opacity-50" />
                        Hide
                      </Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
