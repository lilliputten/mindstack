'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  getActiveFilterIds,
  useCategoriesFiltersContext,
} from '@/features/categories/contexts/CategoriesFiltersContext';

import { AvailableCategoriesFiltersFields } from './AvailableCategoriesFiltersFields';
import { AvailableCategoriesFiltersInfo } from './AvailableCategoriesFiltersInfo';

type TProps = TPropsWithClassName;

export function AvailableCategoriesFilters(props: TProps) {
  const { className } = props;

  const t = useT();
  const {
    isExpanded,
    onDefaults,
    error,
    filtersData,
    form,
    isReady,
    isSubmitEnabled,
    toggleFilters,
    hideFilters,
    handleApplyButton,
    handleResetToDefaults,
    handleClearChanges,
  } = useCategoriesFiltersContext();

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const filtersInfo = React.useMemo(
    () => (
      <AvailableCategoriesFiltersInfo className="truncate font-normal" filtersData={filtersData} />
    ),
    [filtersData],
  );

  const activeFilterIds = getActiveFilterIds(filtersData);
  const hasFilters = !!activeFilterIds.length;

  const filterCaption = React.useMemo(() => {
    if (!hasFilters) {
      return t('AvailableCategoriesFilters.NoFiltersApplied');
    }
    return <span className="flex items-center gap-2 truncate">{filtersInfo}</span>;
  }, [hasFilters, filtersInfo, t]);

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={cn(
          isDev && '__AvailableCategoriesFilters', // DEBUG
          'flex flex-col',
          !isExpanded && 'shrink-0',
          !isReady && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <CardHeader
          className={cn(
            isDev && '__AvailableCategoriesFilters_Header', // DEBUG
            'flex flex-row items-center justify-between space-y-0 p-0',
            'shrink-0',
            'overflow-hidden',
          )}
        >
          <CardTitle className="rounded-0 w-full">
            <Tooltip key="AvailableCategoriesFilters-Caption">
              <TooltipTrigger asChild>
                <Button
                  variant={isExpanded ? 'ghost' : 'theme'}
                  onClick={toggleFilters}
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
                  <>
                    {t('AvailableCategoriesFilters.Displaying')}: {filtersInfo}
                  </>
                ) : isExpanded ? (
                  t('AvailableCategoriesFilters.ClickToHideSettings')
                ) : (
                  t('AvailableCategoriesFilters.ExpandToChangeDisplaySettings')
                )}
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent
            className={cn(
              isDev && '__AvailableCategoriesFilters_Content', // DEBUG
              'overflow-hidden',
              'flex flex-col',
              'px-0',
              'py-0',
            )}
          >
            <ScrollArea
              className={cn(
                isDev && '__AvailableCategoriesFilters_Scroll', // DEBUG
              )}
              viewportClassName={cn(
                isDev && '__AvailableCategoriesFilters_ScrollViewport', // DEBUG
                'flex py-6 flex-col flex-1',
                '[&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
              )}
            >
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleApplyButton)}
                  className={cn(
                    isDev && '__AvailableCategoriesFilters', // DEBUG
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
                      isDev && '__AvailableCategoriesFilters_Fields', // DEBUG
                      'flex flex-col gap-4',
                    )}
                  >
                    <AvailableCategoriesFiltersFields form={form} />
                  </div>
                  <div
                    className={cn(
                      isDev && '__AvailableCategoriesFilters_Actions', // DEBUG
                      'flex flex-wrap gap-2 pt-2 max-sm:flex-col',
                    )}
                  >
                    <Button
                      type="submit"
                      variant="theme"
                      disabled={!isSubmitEnabled}
                      className="text-truncate flex items-center justify-start gap-2"
                    >
                      <Icons.Check className="size-4 opacity-50" />
                      <span className="truncate">{t('AvailableCategoriesFilters.Apply')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetToDefaults}
                      disabled={onDefaults}
                      className="text-truncate flex items-center justify-start gap-2"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">
                        {t('AvailableCategoriesFilters.ResetToDefaults')}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearChanges}
                      disabled={!form.formState.isDirty}
                      className="text-truncate flex items-center justify-start gap-2"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">
                        {t('AvailableCategoriesFilters.ClearChanges')}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={hideFilters}
                      className="text-truncate flex items-center justify-start gap-2 md:ml-auto"
                    >
                      <Icons.ChevronUp className="size-4 opacity-50" />
                      <span className="truncate">{t('AvailableCategoriesFilters.Hide')}</span>
                    </Button>
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
