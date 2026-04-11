import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/Select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { THeadlessEditorProps } from './HeadlessEditor';
import { TCmpItemBase, TCmpItemId } from './types';

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean>
  extends Omit<
    THeadlessEditorProps<T, LargeTexts>,
    // | 'showNormalized'
    | 'RenderItem'
    | 'changeItemsOrder'
    | 'className'
    | 'forceCompact'
    | 'getItemText'
    | 'hasChanges'
    | 'lang'
    | 'largeTexts'
    | 'toggleSelectedId'
    | 'updateItems'
    | 'updateReordered'
  > {
  // Actions...
  restoreDefaults: () => void;
  reorderItems?: (id?: string) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<TCmpItemId> | undefined>>;
  setUpdatedIds: React.Dispatch<React.SetStateAction<Set<TCmpItemId> | undefined>>;
  setDeletedIds: React.Dispatch<React.SetStateAction<Set<TCmpItemId> | undefined>>;
  setAddedIds: React.Dispatch<React.SetStateAction<Set<TCmpItemId> | undefined>>;
  setReorderedIds: React.Dispatch<React.SetStateAction<Set<TCmpItemId> | undefined>>;
  // Calculated data...
  totalChangedCount?: number;
  // Show normalized values
  // showNormalized?: boolean;
  setShowNormalized?: React.Dispatch<React.SetStateAction<boolean>>;
  // Options...
  disableScroll?: boolean;
}

/** Options to pass from the render point in the target component.
 * Ensure re-passing of these options in the `src/entities/HeadlessEditor/useHeadlessEditorState.tsx`.
 */
export interface THeadlessEditorControlsExternalProps<_T extends TCmpItemBase> {
  className?: string;
  // Reorder...
  reorderTitles?: Record<string, string>;
  // Actions...
  onSaveData?: () => void;
  onAddAction?: () => void;
  onDeleteAction?: () => void;
  onReload?: () => void;
  // Filter setters...
  setFilterTargeted: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterAdded: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterText: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFilterTextSmart: React.Dispatch<React.SetStateAction<boolean>>;
}

export function HeadlessEditorControls<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts> & THeadlessEditorControlsExternalProps<T>,
) {
  const {
    className,
    // Options...
    isReady = true,
    disableScroll,
    // Calculated data...
    totalChangedCount,
    // Items...
    items,
    // Actions...
    onSaveData,
    onAddAction,
    onDeleteAction,
    onReload,
    // Editor actions...
    restoreDefaults,
    reorderItems,
    reorderTitles,
    setCompareTargetId,
    setSelectedIds,
    // setUpdatedIds,
    // setDeletedIds,
    // setAddedIds,
    // setReorderedIds,
    // Filter setters...
    setFilterTargeted,
    setFilterUpdated,
    setFilterAdded,
    setFilterSelected,
    setFilterText,
    setFilterTextSmart,
    // Filters...
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated, // And reordered (?)
    filterAdded,
    filterSelected,
    // State...
    updatedIds,
    addedIds,
    reorderedIds,
    selectedIds,
    compareTargetId,
    // Show normalized values
    showNormalized,
    setShowNormalized,
  } = props;

  /* // DEBUG: Detect excessive unmounts
   * React.useEffect(() => {
   *   return () => {
   *     console.log('[HeadlessEditorControls:DEBUG:UNMOUNTED]');
   *   };
   * }, []);
   */

  const t = useT();

  const [isExpanded, setExpanded] = React.useState(false);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  const actions = [
    // Basic actions...
    /* // UNUSED: These actions displayed in the panel header
     * onSaveData && !!totalChangedCount && (
     *   <Button
     *     key="SaveData"
     *     onClick={onSaveData}
     *     className="content-truncate flex items-center gap-2"
     *     variant={totalChangedCount ? 'success' : 'ghost'}
     *     disabled={!totalChangedCount}
     *   >
     *     <Icons.Save className="size-4 shrink-0 opacity-50" />
     *     <span className="truncate">
     *       {t('Save')}
     *       {!!totalChangedCount && (
     *         <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
     *       )}
     *     </span>
     *   </Button>
     * ),
     * !!totalChangedCount && (
     *   <Button
     *     key="UndoChanges"
     *     onClick={restoreDefaults}
     *     className="content-truncate flex items-center gap-2"
     *     variant={totalChangedCount ? 'theme' : 'ghost'}
     *     disabled={!totalChangedCount}
     *   >
     *     <Icons.Undo2 className="size-4 shrink-0 opacity-50" />
     *     <span className="truncate">
     *       {t('UndoChanges')}
     *       {!!totalChangedCount && (
     *         <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
     *       )}
     *     </span>
     *   </Button>
     * ),
     * !!onReload && (
     *   <Button
     *     key="Reload"
     *     onClick={onReload}
     *     className="content-truncate flex items-center gap-2"
     *     variant="ghost"
     *   >
     *     <Icons.Refresh className="size-4 shrink-0 opacity-50" />
     *     <span className="truncate">{t('Reload')}</span>
     *   </Button>
     * ),
     * !!items.length && (
     *   <Button
     *     key="SelectAll"
     *     onClick={() =>
     *       setSelectedIds((selectedIds) => {
     *         return !selectedIds?.size ? new Set(items.map(({ id }) => id)) : undefined;
     *       })
     *     }
     *     className="content-truncate flex items-center gap-2"
     *     variant={items.length ? 'theme' : 'ghost'}
     *     disabled={!items.length}
     *   >
     *     {!selectedIds?.size ? (
     *       <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
     *     ) : (
     *       <Icons.Square className="size-4 shrink-0 opacity-50" />
     *     )}
     *     <span className="truncate">
     *       {!selectedIds?.size ? t('SelectAll') : t('DeselectAll')}
     *       <span className="ml-1 font-thin opacity-50">({items.length})</span>
     *     </span>
     *   </Button>
     * ),
     */
    /*
      // Separate select all/select none controls
      <Button
        key="SelectAll"
        onClick={() => setSelectedIds(new Set(items.map(({ id }) => id)))}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size !== items.length ? 'theme' : 'ghost'}
        disabled={selectedIds?.size === items.length}
      >
        <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">{t('SelectAll')}</span>
      </Button>,
      <Button
        key="SelectNone"
        onClick={() => setSelectedIds(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'theme' : 'ghost'}
        disabled={!selectedIds?.size}
      >
        <Icons.Square className="size-4 shrink-0 opacity-50" />
        <span className="truncate">{t('SelectNone')}</span>
      </Button>,
      */
    <Button
      key="AddAction"
      onClick={onAddAction}
      className="content-truncate flex items-center gap-2"
      variant="success"
    >
      <Icons.Plus className="size-4 shrink-0 opacity-50" />
      <span className="truncate">{t('AddNew')}</span>
    </Button>,
    !!onDeleteAction && !!selectedIds?.size && (
      <Button
        key="DeleteSelected"
        onClick={onDeleteAction}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'destructive' : 'ghost'}
        disabled={!selectedIds?.size}
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          {t('DeleteSelected')}
          {!!selectedIds?.size && (
            <span className="ml-1 font-thin opacity-50">({selectedIds.size})</span>
          )}
        </span>
      </Button>
    ),
    <Button
      key="Hide"
      type="button"
      variant="ghost"
      onClick={() => setExpanded(false)}
      className="flex max-w-full items-center justify-start gap-2 truncate md:ml-auto"
    >
      <Icons.ChevronUp className="size-4 opacity-50" />
      <span className="truncate">{t('Hide')}</span>
    </Button>,
  ].filter(Boolean);

  const reorders = [
    // Reorders...
    !!items.length && !!reorderItems && !!reorderTitles && (
      <Label className="relative flex w-full items-center gap-2" key="Reorder">
        <div className="shrink-0 truncate text-sm font-bold opacity-50">{t('ReorderItems')}:</div>
        <Select onValueChange={reorderItems}>
          <SelectTrigger
            className={cn(
              isDev && '__HeadlessQuestionsEditorDemo__SelectReorder', // DEBUG
            )}
          >
            <span className="opacity-50">{t('HeadlessEditor.SelectReorderingMode')}</span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(reorderTitles).map(([key, title]) => (
              <SelectItem key={key} value={key}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
    ),
  ].filter(Boolean);

  const comparisons = [
    <div key="ComparisonLabel" className="flex items-center text-sm font-bold opacity-50">
      <span>{t('HeadlessEditor.Comparison')}:</span>
    </div>,
    !!setShowNormalized && (
      <Label
        key="ShowNormalizedComparsions"
        className={cn('mx-2 flex select-none items-center gap-2')}
      >
        <Checkbox
          defaultChecked={showNormalized || false}
          onCheckedChange={() => setShowNormalized?.(!showNormalized)}
        />
        {t('HeadlessEditor.ShowNormalizedRates')}
        <Tooltip key="ShowNormalizedComparsions-Tooltip">
          <TooltipTrigger asChild>
            <Icons.Info className="size-5 cursor-pointer text-theme" />
          </TooltipTrigger>
          <TooltipContent side="top" className="content-truncate flex max-w-sm items-center gap-2">
            {t('HeadlessEditor.ShowNormalizedComparsionsTooltip')}
          </TooltipContent>
        </Tooltip>
      </Label>
    ),
    !!setCompareTargetId && !!compareTargetId && (
      <Button
        key="ResetCompareTarget"
        onClick={() => setCompareTargetId(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={compareTargetId ? 'theme' : 'ghost'}
        disabled={!compareTargetId}
      >
        <Icons.CircleSlash2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">{t('HeadlessEditor.ResetComparisonTarget')}</span>
      </Button>
    ),
  ].filter(Boolean);

  const updatedAndReorderedCount = (updatedIds?.size || 0) + (reorderedIds?.size || 0);

  const filters = [
    // Filters...
    <div key="FiltersLabel" className="flex items-center text-sm font-bold opacity-50">
      <span>{t('Filter')}:</span>
    </div>,
    <Label key="FilterTargeted" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={!!filterTargeted}
        onCheckedChange={(checked) => setFilterTargeted(Boolean(checked))}
      />
      <span>{t('HeadlessEditor.FilterComparedItems')}</span>
      <Tooltip key="FilterTargeted-Tooltip">
        <TooltipTrigger asChild>
          <Icons.Info className="size-5 cursor-pointer text-theme" />
        </TooltipTrigger>
        <TooltipContent side="top" className="content-truncate flex max-w-sm items-center gap-2">
          {t('HeadlessEditor.FilterTargetedsTooltip')}
        </TooltipContent>
      </Tooltip>
    </Label>,
    <Label key="FilterUpdated" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterUpdated}
        onCheckedChange={(checked) => setFilterUpdated(Boolean(checked))}
      />
      <span>
        {t('HeadlessEditor.FilterUpdatedItems')}
        <Badge variant={'theme50'} className="ml-2 truncate px-2 text-xs opacity-50 max-xs:hidden">
          {updatedAndReorderedCount}
        </Badge>
      </span>
    </Label>,
    <Label key="FilterAdded" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterAdded}
        onCheckedChange={(checked) => setFilterAdded(Boolean(checked))}
      />
      <span>
        {t('HeadlessEditor.FilterAddedItems')}
        <Badge variant={'theme50'} className="ml-2 truncate px-2 text-xs opacity-50 max-xs:hidden">
          {addedIds?.size || 0}
        </Badge>
      </span>
    </Label>,
    <Label key="FilterSelected" className="ml-1 mr-2 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterSelected}
        onCheckedChange={(checked) => setFilterSelected(Boolean(checked))}
      />
      <span>
        {t('HeadlessEditor.FilterSelectedItems')}
        <Badge variant={'theme50'} className="ml-2 truncate px-2 text-xs opacity-50 max-xs:hidden">
          {selectedIds?.size || 0}
        </Badge>
      </span>
    </Label>,
  ].filter(Boolean);

  const textFilters = [
    <Label className="relative flex gap-2" key="FilterByText">
      <div key="Filter" className="flex items-center text-sm font-bold opacity-50">
        <span>{t('HeadlessEditor.FilterByText')}:</span>
      </div>
      <Input
        // id="FilterByText"
        name="FilterByText"
        className="inline pr-11"
        placeholder={t('HeadlessEditor.FilterByText')}
        value={filterText || ''}
        onChange={(ev) => {
          const { target } = ev;
          const value = target.value;
          setFilterText(value);
        }}
      />
      {filterText && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setFilterText('')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2',
            'rounded-sm',
            'opacity-30 transition hover:opacity-50',
          )}
          title={t('AvailableWorkoutsFilters.ClearText')}
        >
          <Icons.Close className="size-4" />
        </Button>
      )}
    </Label>,
    <Label
      key="TextFilterSmart"
      className={cn('mx-2 flex select-none items-center gap-2', !filterText && 'disabled')}
    >
      <Checkbox
        defaultChecked={filterTextSmart}
        onCheckedChange={(checked) => setFilterTextSmart(Boolean(checked))}
      />
      {t('HeadlessEditor.SmartTextFilter')}
      <Tooltip key="TextFilterSmart-Tooltip">
        <TooltipTrigger asChild>
          <Icons.Info className="size-5 cursor-pointer text-theme" />
        </TooltipTrigger>
        <TooltipContent side="top" className="content-truncate flex max-w-sm items-center gap-2">
          {t('HeadlessEditor.SmartTextFilterTooltip')}
        </TooltipContent>
      </Tooltip>
    </Label>,
  ].filter(Boolean);

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={cn(
          isDev && '__HeadlessEditorControls', // DEBUG
          'flex flex-col',
          'content-truncate flex flex-col gap-1',
          disableScroll && 'overflow-visible',
          !isExpanded && 'shrink-0',
          !isReady && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <CardHeader
          className={cn(
            isDev && '__HeadlessEditorControls_Header', // DEBUG
            'flex flex-row items-center justify-between space-y-0 p-0',
            'shrink-0',
            !disableScroll && 'overflow-hidden',
          )}
        >
          <CardTitle className="rounded-0 flex w-full">
            {/*
            <Tooltip key="AvailableTopicsFilters-Caption">
              <TooltipTrigger
                // asChild
                className={cn(
                  isDev && '__HeadlessEditorControls_TooltipTrigger', // DEBUG
                  'flex w-full items-center justify-between space-y-0 p-0',
                )}
              >
            */}
            {/* SaveData */}
            {onSaveData && !!totalChangedCount && (
              <div
                key="SaveData"
                onClick={onSaveData}
                title={t('Save')}
                className={cn(
                  buttonVariants({ variant: 'success' }),
                  'flex cursor-pointer items-center gap-2 truncate rounded-none',
                )}
              >
                <Icons.Save className={cn('size-4 shrink-0')} />
                <span className="truncate max-md:hidden">{t('Save')}</span>
              </div>
            )}
            {/* UndoChanges */}
            {!!totalChangedCount && (
              <div
                key="UndoChanges"
                onClick={restoreDefaults}
                title={t('UndoChanges')}
                className={cn(
                  buttonVariants({ variant: 'theme80' }),
                  'flex cursor-pointer items-center gap-2 truncate rounded-none',
                )}
              >
                <Icons.Undo2 className="size-4 shrink-0" />
                <span className="truncate max-xs:hidden">
                  <span className="truncate max-md:hidden">{t('UndoChanges')}</span>
                  {!!totalChangedCount && (
                    <Badge
                      variant={'theme'}
                      className="ml-2 truncate px-2 text-xs opacity-50 max-xs:hidden"
                    >
                      {totalChangedCount}
                    </Badge>
                  )}
                </span>
              </div>
            )}
            {/* Reload */}
            {!!onReload && (
              <div
                key="Reload"
                onClick={onReload}
                className={cn(
                  buttonVariants({ variant: 'theme80' }),
                  'flex cursor-pointer items-center gap-2 truncate rounded-none',
                )}
                title={t('Reload')}
              >
                <Icons.Refresh className="size-4 shrink-0" />
                <span className="truncate max-md:hidden">{t('Reload')}</span>
              </div>
            )}
            {/* SelectAll */}
            {!!items.length && (
              <div
                key="SelectAll"
                onClick={() =>
                  setSelectedIds((selectedIds) => {
                    return !selectedIds?.size ? new Set(items.map(({ id }) => id)) : undefined;
                  })
                }
                className={cn(
                  buttonVariants({ variant: 'theme80' }),
                  'flex cursor-pointer items-center gap-2 truncate rounded-none',
                )}
                title={!selectedIds?.size ? t('SelectAll') : t('DeselectAll')}
              >
                {!selectedIds?.size ? (
                  <Icons.Square className="size-4 shrink-0" />
                ) : selectedIds?.size === items.length ? (
                  <Icons.SquareCheck className="size-4 shrink-0" />
                ) : (
                  <Icons.SquareDot className="size-4 shrink-0" />
                )}
                <span className="truncate max-md:hidden">
                  {!selectedIds?.size ? t('SelectAll') : t('DeselectAll')}
                </span>
                <Badge variant={'theme'} className="truncate px-2 text-xs opacity-50 max-xs:hidden">
                  {selectedIds?.size || items.length}
                </Badge>
              </div>
            )}

            {/* // Expand toggler */}
            <div
              onClick={() => setExpanded((isExpanded) => !isExpanded)}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'flex flex-1 cursor-pointer items-center gap-2 truncate rounded-none',
              )}
              title={isExpanded ? t('HideOptions') : t('ShowOptions')}
            >
              <span className="flex flex-1 items-center gap-2 truncate">
                <HeaderIcon className={cn('size-4 shrink-0', !isReady && 'animate-spin')} />
                <span className="truncate max-xs:hidden">
                  {isExpanded ? t('HideOptions') : t('ShowOptions')}
                </span>
                {/* // These are not required as the changed status is obviously displayed in the header (see buttons above)
                    !!totalChangedCount && <span className="ml-1 font-thin opacity-50">*</span>
                    {!!totalChangedCount && <Icons.Asterisk className="size-4 opacity-50" />}
                    */}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <ToggleIcon className="size-4" />
              </span>
            </div>
            {/*
              </TooltipTrigger>
              <TooltipContent
                side="top"
                // side={isExpanded ? 'bottom' : 'top'}
                className="content-truncate flex items-center gap-2"
              >
                {totalChangedCount
                  ? t('HeadlessEditor.HasUnsavedChanges')
                  : t('HeadlessEditor.NoChangesMade')}
              </TooltipContent>
            </Tooltip>
            */}
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent
            className={cn(
              isDev && '__HeadlessEditorControls_Content', // DEBUG
              !disableScroll && 'overflow-hidden',
              'flex flex-col',
              'px-0',
              'py-0',
            )}
          >
            <ScrollArea
              disableScroll={disableScroll}
              className={cn(
                isDev && '__HeadlessEditorControls_Scroll', // DEBUG
              )}
              viewportClassName={cn(
                isDev && '__HeadlessEditorControls_ScrollViewport', // DEBUG
                'flex py-6 flex-col flex-1',
                '[&>div]:!flex [&>div]:flex-col [&>div]:gap-2 [&>div]:flex-1',
              )}
            >
              {/* Filters... */}
              {filters.length > 1 && (
                <div
                  className={cn(
                    isDev && '__HeadlessEditorControls_Filters', // DEBUG
                    'content-truncate flex flex-wrap gap-1 px-6 py-2',
                  )}
                >
                  {filters}
                </div>
              )}

              {/* Text filters... */}
              {textFilters.length > 1 && (
                <div
                  className={cn(
                    isDev && '__HeadlessEditorControls_TextFilters', // DEBUG
                    'content-truncate flex flex-wrap gap-1 px-6 py-2',
                  )}
                >
                  {textFilters}
                </div>
              )}

              {/* Reorders... */}
              {reorders.length > 0 && (
                <div
                  className={cn(
                    isDev && '__HeadlessEditorControls_Reorders', // DEBUG
                    'content-truncate flex flex-wrap gap-1 px-6 py-2',
                  )}
                >
                  {reorders}
                </div>
              )}

              {/* Reorders... */}
              {comparisons.length > 1 && (
                <div
                  className={cn(
                    isDev && '__HeadlessEditorControls_Reorders', // DEBUG
                    'content-truncate flex flex-wrap gap-1 px-6 py-2',
                  )}
                >
                  {comparisons}
                </div>
              )}

              {/* Actions... */}
              {!!actions.length && (
                <div
                  className={cn(
                    isDev && '__HeadlessEditorControls_Actions', // DEBUG
                    'content-truncate flex flex-wrap gap-1 px-6 py-2',
                  )}
                >
                  {actions}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
