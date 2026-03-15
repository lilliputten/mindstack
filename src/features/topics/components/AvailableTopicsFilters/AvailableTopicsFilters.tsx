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
import { SelectTopicLanguageModal } from '@/components/modals/SelectTopicLanguageModal';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { getActiveFilterIds, useTopicsFiltersContext } from '@/contexts/TopicsFiltersContext';

import { TSelectTopicLanguageData } from '../../types';
import { AvailableTopicsFiltersFields } from './AvailableTopicsFiltersFields';
import { AvailableTopicsFiltersInfo } from './AvailableTopicsFiltersInfo';

type TProps = TPropsWithClassName;

export function AvailableTopicsFilters(props: TProps) {
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
    // Options...
    ignoreOnlyMy,
  } = useTopicsFiltersContext();

  const [isSelectLanguageVisible, setShowSelectLanguage] = React.useState<boolean | undefined>();
  const [langCode, langName, langCustom] = form.watch(['langCode', 'langName', 'langCustom']);

  const handleSelectedLanguage = React.useCallback(
    ({ langCode, langName, langCustom }: TSelectTopicLanguageData) => {
      // Update the form fields
      const opts = {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      };
      form.setValue('langCode', langCode, opts);
      form.setValue('langName', langName, opts);
      form.setValue('langCustom', langCustom, opts);
    },
    [form],
  );
  const setAnyLanguage = React.useCallback(() => {
    setShowSelectLanguage(false);
    handleSelectedLanguage({ langCode: '-', langName: undefined, langCustom: undefined });
  }, [handleSelectedLanguage]);
  const resetLanguage = React.useCallback(() => {
    setShowSelectLanguage(false);
    handleSelectedLanguage({ langCode: undefined, langName: undefined, langCustom: undefined });
  }, [handleSelectedLanguage]);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const filtersInfo = React.useMemo(
    () => <AvailableTopicsFiltersInfo className="truncate font-normal" filtersData={filtersData} />,
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
                    {t('Displaying')}: {filtersInfo}
                  </>
                ) : isExpanded ? (
                  t('ClickToHideSettings')
                ) : (
                  t('ExpandToChangeDisplaySettings')
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
                    isDev && '__AvailableTopicsFilters_Form', // DEBUG
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
                    <AvailableTopicsFiltersFields
                      form={form}
                      ignoreOnlyMy={ignoreOnlyMy}
                      selectLanguage={() => setShowSelectLanguage(true)}
                      resetLanguage={resetLanguage}
                    />
                  </div>
                  <div
                    className={cn(
                      isDev && '__AvailableTopicsFilters_Actions', // DEBUG
                      'flex flex-wrap gap-2 pt-2 max-sm:flex-col',
                    )}
                  >
                    <Button
                      type="submit"
                      variant="theme"
                      disabled={!isSubmitEnabled}
                      className="flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Check className="size-4 opacity-50" />
                      <span className="truncate">{t('Apply')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetToDefaults}
                      disabled={onDefaults}
                      className="flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">{t('ResetToDefaults')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearChanges}
                      disabled={!form.formState.isDirty}
                      className="flex max-w-full items-center justify-start gap-2 truncate"
                    >
                      <Icons.Close className="size-4 opacity-50" />
                      <span className="truncate">{t('ClearChanges')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={hideFilters}
                      className="flex max-w-full items-center justify-start gap-2 truncate md:ml-auto"
                    >
                      <Icons.ChevronUp className="size-4 opacity-50" />
                      <span className="truncate">{t('Hide')}</span>
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </ScrollArea>
            <SelectTopicLanguageModal
              isVisible={isSelectLanguageVisible}
              langCode={langCode}
              langName={langName}
              langCustom={langCustom}
              handleHide={() => setShowSelectLanguage(false)}
              handleSelect={handleSelectedLanguage}
              setAnyLanguage={setAnyLanguage}
              resetLanguage={resetLanguage}
            />
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
