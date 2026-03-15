import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { TCmpItemBase, THeadlessEditorProps } from './types';

type TProps<T extends TCmpItemBase, LargeTexts extends boolean> = Omit<
  THeadlessEditorProps<T, LargeTexts>,
  'RenderItem'
  // | 'items'
  // | 'getItemText'
  // | 'updateItems'
  // | 'updateReordered'
  // | 'updatedIds'
  // | 'addedIds'
  // | 'reorderedIds'
  // | 'selectedIds'
  // | 'toggleSelectedId'
  // | 'compareTargetId'
  // | 'setCompareTargetId'
>;

export function HeadlessControls<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const {
    className,
    isReady = true,
    hasChanges,
    // // Options...
    // lang,
    // largeTexts = false,
    // forceCompact,
    // showNormalized,
    // // Filters...
    // filterText,
    // filterTextSmart,
    // filterTargeted,
    // filterUpdated,
    // filterAdded,
    // filterSelected,
    // // Items...
    items,
    // getItemText,
    // RenderItem,
    // updateItems,
    // updateReordered,
    // // State...
    // updatedIds: externalUpdatedIds,
    // addedIds,
    // reorderedIds: externalReorderedIds,
    // selectedIds: externalSelectedIds,
    // toggleSelectedId: toggleExternalSelectedId,
    // compareTargetId: externalCompareTargetId,
    // setCompareTargetId: setExternalCompareTargetId,
    // changeItemsOrder: changeExternalItemsOrder,
  } = props;

  const t = useT();

  const [isExpanded, setExpanded] = React.useState(false);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  /* TODO:
   * - Save (optional, saveData)
   * - restoreDefaults
   */
  // return (
  //   <div
  //     className={cn(
  //       isDev && '__HeadlessControls', // DEBUG
  //       'content-truncate flex flex-col gap-1',
  //       className,
  //     )}
  //   >
  //     HeadlessControls
  //   </div>
  // );
  return (
    <Card
      className={cn(
        isDev && '__HeadlessControls', // DEBUG
        'flex flex-col',
        'content-truncate flex flex-col gap-1',
        !isExpanded && 'shrink-0',
        !isReady && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <CardHeader
        className={cn(
          isDev && '__HeadlessControls_Header', // DEBUG
          'flex flex-row items-center justify-between space-y-0 p-0',
          'shrink-0',
          'overflow-hidden',
        )}
      >
        <CardTitle className="rounded-0 w-full">
          <Button
            variant={isExpanded ? 'ghost' : 'theme'}
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
            className="flex w-full items-center gap-2 rounded-none"
          >
            <span className="flex flex-1 items-center gap-2 truncate">
              <HeaderIcon className={cn('size-4 shrink-0', !isReady && 'animate-spin')} />
              {/*controlsCaption*/}
              {isExpanded ? t('Hide Controls') : t('Show controls')}
            </span>
            <span className="flex items-center gap-2">
              {/*
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
                    */}
              <ToggleIcon className="size-4" />
            </span>
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent
          className={cn(
            isDev && '__HeadlessControls_Content', // DEBUG
            'overflow-hidden',
            'flex flex-col',
            'px-0',
            'py-0',
          )}
        >
          <ScrollArea
            className={cn(
              isDev && '__HeadlessControls_Scroll', // DEBUG
            )}
            viewportClassName={cn(
              isDev && '__HeadlessControls_ScrollViewport', // DEBUG
              'flex py-6 flex-col flex-1',
              '[&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
            )}
          >
            HeadlessControls: {isReady ? 'ready' : 'not ready'}
            {/*
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleApplyButton)}
                  className={cn(
                    isDev && '__HeadlessControls_Form', // DEBUG
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
                      isDev && '__HeadlessControls_Fields', // DEBUG
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
                      isDev && '__HeadlessControls_Actions', // DEBUG
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
              */}
          </ScrollArea>
          {/*
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
            */}
        </CardContent>
      )}
    </Card>
  );
}
