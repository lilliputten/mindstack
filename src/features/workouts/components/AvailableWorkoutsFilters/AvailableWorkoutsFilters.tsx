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
  useWorkoutsFiltersContext,
} from '@/features/workouts/contexts/WorkoutsFiltersContext';

import { AvailableWorkoutsFiltersFields } from './AvailableWorkoutsFiltersFields';
import { AvailableWorkoutsFiltersInfo } from './AvailableWorkoutsFiltersInfo';

type TProps = TPropsWithClassName;

export function AvailableWorkoutsFilters(props: TProps) {
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
  } = useWorkoutsFiltersContext();

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const filtersInfo = React.useMemo(
    () => (
      <AvailableWorkoutsFiltersInfo className="truncate font-normal" filtersData={filtersData} />
    ),
    [filtersData],
  );

  const activeFilterIds = getActiveFilterIds(filtersData);
  const hasFilters = !!activeFilterIds.length;

  const filterCaption = React.useMemo(() => {
    if (!hasFilters) {
      return t('NoFiltersApplied');
    }
    return <span className="flex items-center gap-2 truncate">{filtersInfo}</span>;
  }, [hasFilters, filtersInfo, t]);

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={cn(
          isDev && '__AvailableWorkoutsFilters',
          'flex flex-col',
          !isExpanded && 'shrink-0',
          !isReady && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <CardHeader
          className={cn(
            isDev && '__AvailableWorkoutsFilters_Header',
            'flex flex-row items-center justify-between space-y-0 p-0',
            'shrink-0',
            'overflow-hidden',
          )}
        >
          <CardTitle className="rounded-0 w-full">
            <Tooltip key="AvailableWorkoutsFilters-Caption">
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
                    {!onDefaults && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          handleResetToDefaults();
                        }}
                        className="h-7 w-7 opacity-70 hover:opacity-100"
                        title={t('ResetToDefaults')}
                      >
                        <Icons.X className="size-3.5" />
                      </Button>
                    )}
                    <ToggleIcon className="size-4" />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-2 truncate">
                {hasFilters ? (
                  <>
                    {t('AvailableWorkoutsFilters.Displaying')}: {filtersInfo}
                  </>
                ) : isExpanded ? (
                  t('AvailableWorkoutsFilters.ClickToHideSettings')
                ) : (
                  t('AvailableWorkoutsFilters.ExpandToChangeDisplaySettings')
                )}
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent
            className={cn(
              isDev && '__AvailableWorkoutsFilters_Content',
              'overflow-hidden',
              'flex flex-col',
              'px-0',
              'py-0',
            )}
          >
            <ScrollArea
              className={cn(isDev && '__AvailableWorkoutsFilters_Scroll')}
              viewportClassName={cn(
                isDev && '__AvailableWorkoutsFilters_ScrollViewport',
                'flex py-6 flex-col flex-1',
                '[&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
              )}
            >
              <FormProvider {...form}>
                <form
                  className={cn(
                    isDev && '__AvailableWorkoutsFilters_Form',
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
                      isDev && '__AvailableWorkoutsFilters_Fields',
                      'flex flex-col gap-4',
                    )}
                  >
                    <AvailableWorkoutsFiltersFields form={form} />
                  </div>
                  <div
                    className={cn(
                      isDev && '__AvailableWorkoutsFilters_Actions',
                      'flex flex-wrap gap-2 pt-2 max-sm:flex-col',
                    )}
                  >
                    <Button
                      type="button"
                      variant="theme"
                      disabled={!isSubmitEnabled}
                      onClick={form.handleSubmit(handleApplyButton)}
                      className="text-truncate flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Check className="size-4 opacity-50" />
                      <span className="truncate">{t('Apply')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetToDefaults}
                      disabled={onDefaults}
                      className="text-truncate flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">{t('ResetToDefaults')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearChanges}
                      disabled={!form.formState.isDirty}
                      className="text-truncate flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">{t('ClearChanges')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={hideFilters}
                      className="text-truncate flex max-w-full items-center justify-start gap-2 truncate md:ml-auto"
                    >
                      <Icons.ChevronUp className="size-4 opacity-50" />
                      <span className="truncate">{t('Hide')}</span>
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
