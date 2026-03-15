import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/Select';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { THeadlessEditorProps } from './HeadlessEditor';
import { TCmpItemBase, TCmpItemId } from './types';

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean>
  extends Omit<
    THeadlessEditorProps<T, LargeTexts>,
    | 'RenderItem'
    | 'changeItemsOrder'
    | 'className'
    | 'lang'
    | 'largeTexts'
    | 'forceCompact'
    | 'showNormalized'
    | 'getItemText'
    | 'updateItems'
    | 'updateReordered'
    | 'hasChanges'
    | 'toggleSelectedId'
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
}

/** Options to pass from the reder point in the target component.
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
    // Calculated data...
    totalChangedCount,
    // Items...
    items,
    // Actions...
    onSaveData,
    onAddAction,
    onDeleteAction,
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
    filterUpdated,
    filterAdded,
    filterSelected,
    // State...
    updatedIds,
    addedIds,
    // reorderedIds,
    selectedIds,
    compareTargetId,
  } = props;

  const t = useT();

  const [isExpanded, setExpanded] = React.useState(true);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const HeaderIcon = !isReady ? Icons.Spinner : Icons.Settings2;

  const actions = [
    // Basic data...
    onSaveData && !!totalChangedCount && (
      <Button
        key="SaveData"
        onClick={onSaveData}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'success' : 'ghost'}
        disabled={!totalChangedCount}
        // size="sm"
      >
        <Icons.Save className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          {t('Save')}
          {!!totalChangedCount && (
            <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
          )}
        </span>
      </Button>
    ),
    !!totalChangedCount && (
      <Button
        key="UndoChanges"
        onClick={restoreDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'theme' : 'ghost'}
        disabled={!totalChangedCount}
      >
        <Icons.Undo2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          {t('Undo changes')}
          {!!totalChangedCount && (
            <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
          )}
        </span>
      </Button>
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
        <span className="truncate">{t('Reset comparison target')}</span>
      </Button>
    ),
    !!items.length && (
      <Button
        key="SelectAll"
        onClick={() =>
          setSelectedIds((selectedIds) => {
            return !selectedIds?.size ? new Set(items.map(({ id }) => id)) : undefined;
          })
        }
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
      >
        {!selectedIds?.size ? (
          <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        ) : (
          <Icons.Square className="size-4 shrink-0 opacity-50" />
        )}
        <span className="truncate">
          {!selectedIds?.size ? 'Select All' : 'Deselect All'}
          <span className="ml-1 font-thin opacity-50">({items.length})</span>
        </span>
      </Button>
    ),
    /*
      // Separate select all/select none controls
      <Button
        key="SelectAll"
        onClick={() => setSelectedIds(new Set(items.map(({ id }) => id)))}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size !== items.length ? 'theme' : 'ghost'}
        disabled={selectedIds?.size === items.length}
        // size="sm"
      >
        <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">{t('Select All')}</span>
      </Button>,
      <Button
        key="SelectNone"
        onClick={() => setSelectedIds(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'theme' : 'ghost'}
        disabled={!selectedIds?.size}
        // size="sm"
      >
        <Icons.Square className="size-4 shrink-0 opacity-50" />
        <span className="truncate">{t('Select None')}</span>
      </Button>,
      */
    <Button
      key="AddAction"
      onClick={onAddAction}
      className="content-truncate flex items-center gap-2"
      variant="success"
    >
      <Icons.Plus className="size-4 shrink-0 opacity-50" />
      <span className="truncate">{t('Add New')}</span>
    </Button>,
    !!onDeleteAction && !!selectedIds?.size && (
      <Button
        key="DeleteSelected"
        onClick={onDeleteAction}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'destructive' : 'ghost'}
        disabled={!selectedIds?.size}
        // size="sm"
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          {t('Delete Selected')}
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
  ];

  const reorders = [
    // Reorders...
    !!items.length && !!reorderItems && !!reorderTitles && (
      <Label className="relative flex w-full items-center gap-2" key="Reorder">
        <div className="shrink-0 truncate text-sm font-bold opacity-50">{t('Reorder Items')}:</div>
        <Select onValueChange={reorderItems}>
          <SelectTrigger
            className={cn(
              isDev && '__HeadlessEditorDemo__SelectReorder', // DEBUG
              // 'flex-1',
            )}
          >
            <span className="opacity-50">{t('Select reordering mode')}</span>
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
  ];

  const filters = [
    // Filters...
    <div key="FiltersLabel" className="flex items-center text-sm font-bold opacity-50">
      <span>Filter:</span>
    </div>,
    <Label key="FilterTargeted" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={!!filterTargeted}
        onCheckedChange={(checked) => setFilterTargeted(Boolean(checked))}
      />
      <span>Compared</span>
    </Label>,
    <Label key="FilterUpdated" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterUpdated}
        onCheckedChange={(checked) => setFilterUpdated(Boolean(checked))}
      />
      <span>
        {t('Updated')}
        <span className="ml-1 font-thin opacity-50">({updatedIds?.size || 0})</span>
      </span>
    </Label>,
    <Label key="FilterAdded" className="ml-1 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterAdded}
        onCheckedChange={(checked) => setFilterAdded(Boolean(checked))}
      />
      <span>
        {t('Added')}
        <span className="ml-1 font-thin opacity-50">({addedIds?.size || 0})</span>
      </span>
    </Label>,
    <Label key="FilterSelected" className="ml-1 mr-2 flex select-none items-center gap-2">
      <Checkbox
        defaultChecked={filterSelected}
        onCheckedChange={(checked) => setFilterSelected(Boolean(checked))}
      />
      <span>
        {t('Selected')}
        <span className="ml-1 font-thin opacity-50">({selectedIds?.size || 0})</span>
      </span>
    </Label>,
  ];
  const textFilters = [
    <Label className="relative flex gap-2" key="FilterByText">
      {/*
    <div className="relative flex gap-2">
      */}
      <div key="Filter" className="flex items-center text-sm font-bold opacity-50">
        <span>Filter by text:</span>
      </div>
      <Input
        // id="FilterByText"
        name="FilterByText"
        className="inline pr-11"
        placeholder="Filter by text"
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
      className={cn('ml-2 flex select-none items-center gap-2', !filterText && 'disabled')}
    >
      <Checkbox
        defaultChecked={filterTextSmart}
        onCheckedChange={(checked) => setFilterTextSmart(Boolean(checked))}
      />
      {t('Smart text filter')}
    </Label>,
  ];

  return (
    <Card
      className={cn(
        isDev && '__HeadlessEditorControls', // DEBUG
        'flex flex-col',
        'content-truncate flex flex-col gap-1',
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
              {isExpanded ? t('Hide Controls') : t('Show Controls')}
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
            isDev && '__HeadlessEditorControls_Content', // DEBUG
            'overflow-hidden',
            'flex flex-col',
            'px-0',
            'py-0',
          )}
        >
          <ScrollArea
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
            {!!filters.length && (
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
            {!!textFilters.length && (
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
            {!!reorders.length && (
              <div
                className={cn(
                  isDev && '__HeadlessEditorControls_Reorders', // DEBUG
                  'content-truncate flex flex-wrap gap-1 px-6 py-2',
                )}
              >
                {reorders}
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
  );
}
