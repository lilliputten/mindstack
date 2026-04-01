import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions/AddQuestionModal';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { TNewOrOldQuestion, TQuestionId } from '@/features/questions/types';

import { newItemIdPrefix } from '../constants';
import { getUniqueIdForSet, reorderByDate } from '../helpers';
import { TReorderModes, useHeadlessEditorState } from '../useHeadlessEditorState';
import { CmpQuestion } from './CmpQuestion';
import { demoQuestions, demoTopicId } from './demoQuestions';
import { T } from './types';

interface TProps {
  className?: string;
  // Language for comparator
  lang?: string;
  // Compare using ngrams for large texts or with just tokens otherwise
  largeTexts?: boolean;
}

function getItemText(item: T) {
  return item.text;
}

const reorderModes = {
  abc: {},
  abcDesc: { desc: true },
  date: { func: reorderByDate },
  dateDesc: { func: reorderByDate, desc: true },
} as const satisfies TReorderModes<TNewOrOldQuestion>;
type TReorderKey = keyof typeof reorderModes;
const reorderTitles: Record<TReorderKey, string> = {
  abc: 'By text',
  abcDesc: 'By text (descending)',
  date: 'By date',
  dateDesc: 'By date (descending)',
};

export function HeadlessQuestionsEditorDemo(props: TProps) {
  const {
    className,
    // Language for comparator
    lang = 'en',
    // Compare using ngrams for large texts or with just tokens otherwise
    largeTexts = false,
  } = props;

  const t = useT();

  const [defaultItems, setDefaultItems] = React.useState(demoQuestions);

  const [addQuestionModalVisible, setAddQuestionModalVisible] = React.useState(false);
  const [deleteSelectedConfirmVisible, setDeleteSelectedConfirmVisible] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string | undefined>();
  const [filterTextSmart, setFilterTextSmart] = React.useState(false);

  const {
    /// Data...
    items,
    /// State...
    compareTargetId,
    totalChangedCount,
    /// Setters (AKA state controllers)...
    setItems,
    setCompareTargetId,
    setSelectedIds,
    setUpdatedIds,
    setDeletedIds,
    setAddedIds,
    setReorderedIds,
    /// Indices (TODO: To use on save)...
    // deletedIds,
    // reorderedIds,
    addedIds,
    selectedIds,
    updatedIds,
    /// Handlers...
    restoreDefaults,
    addNewItem,
    deleteSelected,
    reorderItems,
    /// Component...
    RenderHeadlessEditor,
  } = useHeadlessEditorState({
    // isReady,
    /// Options...
    lang,
    largeTexts,
    /// Reordering...
    reorderModes,
    /// Filters...
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    // Items interface...
    defaultItems,
    getItemText,
    RenderItem: CmpQuestion,
  });

  // Emulate 'Save data' operation...
  const saveDefaults = React.useCallback(() => {
    // Emulate data save procedure: remove any 'new item' features...
    const usedIds = new Set<TQuestionId>();
    const savedItems = items.map((it) => {
      const savedIt = { ...it };
      if (savedIt.isNew) delete savedIt.isNew;
      let id = savedIt.id;
      if (!id || id.startsWith(newItemIdPrefix)) {
        id = getUniqueIdForSet(usedIds, '__saved');
        savedIt.id = id;
      }
      usedIds.add(id);
      return savedIt;
    });
    // Save new data...
    setDefaultItems(savedItems);
    setItems(savedItems);
    // Update all data-related indices...
    setUpdatedIds(undefined);
    setDeletedIds(undefined);
    setAddedIds(undefined);
    setReorderedIds(undefined);
  }, [items, setUpdatedIds, setDeletedIds, setAddedIds, setReorderedIds, setItems]);

  const actions = React.useMemo(
    () => [
      // Basic data...
      <Button
        key="SaveDefaults"
        onClick={saveDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'success' : 'ghost'}
        disabled={!totalChangedCount}
        // size="sm"
      >
        <Icons.Save className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Save</span>
      </Button>,
      <Button
        key="UndoChanges"
        onClick={restoreDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'theme' : 'ghost'}
        disabled={!totalChangedCount}
      >
        <Icons.Undo2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Undo changes
          {!!totalChangedCount && (
            <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
          )}
        </span>
      </Button>,
      <Button
        key="ResetCompareTarget"
        onClick={() => setCompareTargetId(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={compareTargetId ? 'theme' : 'ghost'}
        disabled={!compareTargetId}
      >
        <Icons.CircleSlash2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reset comparison target</span>
      </Button>,
      // Filters...
      <div key="Filter" className="flex items-center text-sm font-bold opacity-50">
        <span>Filter:</span>
      </div>,
      <Label key="FilterTargeted" className="ml-1 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterTargeted}
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
          Updated
          <span className="ml-1 font-thin opacity-50">({updatedIds?.size || 0})</span>
        </span>
      </Label>,
      <Label key="FilterAdded" className="ml-1 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterAdded}
          onCheckedChange={(checked) => setFilterAdded(Boolean(checked))}
        />
        <span>
          Added
          <span className="ml-1 font-thin opacity-50">({addedIds?.size || 0})</span>
        </span>
      </Label>,
      <Label key="FilterSelected" className="ml-1 mr-2 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterSelected}
          onCheckedChange={(checked) => setFilterSelected(Boolean(checked))}
        />
        <span>
          Selected
          <span className="ml-1 font-thin opacity-50">({selectedIds?.size || 0})</span>
        </span>
      </Label>,
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
        <span className="truncate">{!selectedIds?.size ? 'Select all' : 'Deselect all'}</span>
      </Button>,
      /*
      // Separated select all/select none
      <Button
        key="SelectAll"
        onClick={() => setSelectedIds(new Set(items.map(({ id }) => id)))}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size !== items.length ? 'theme' : 'ghost'}
        disabled={selectedIds?.size === items.length}
        // size="sm"
      >
        <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Select all</span>
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
        <span className="truncate">Select none</span>
      </Button>,
      */
      <Button
        key="AddNew"
        // onClick={() => setAddQuestionModalVisible(true)}
        // XXX: Add an item without the dialog
        onClick={() => {
          const newItem = {
            topicId: demoTopicId,
            text: 'New item',
          };
          addNewItem(newItem);
        }}
        className="content-truncate flex items-center gap-2"
        variant="success"
        // size="sm"
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add new</span>
      </Button>,
      // Reorders...
      <Select key="Reorder" onValueChange={reorderItems}>
        <SelectTrigger
          className={cn(
            isDev && '__HeadlessQuestionsEditorDemo__SelectReorder', // DEBUG
            'flex-1',
          )}
        >
          <span className="opacity-50">Reorder items</span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(reorderTitles).map(([key, title]) => (
            <SelectItem key={key} value={key}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
      /* // Separated reorder handlers...
      <Button
        key="ReorderByText"
        onClick={() => reorderItems('abc')}
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
        // size="sm"
      >
        <Icons.ArrowDownAZ className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reorder by text</span>
      </Button>,
      <Button
        key="ReorderByTextDesc"
        onClick={() => reorderItems('abcDesc')}
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
        // size="sm"
      >
        <Icons.ArrowUpAZ className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reorder by text (desc)</span>
      </Button>,
      <Button
        key="ReorderByDate"
        onClick={() => reorderItems('date')}
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
        // size="sm"
      >
        <Icons.ArrowDown10 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reorder by date</span>
      </Button>,
      <Button
        key="ReorderByDateDesc"
        onClick={() => reorderItems('dateDesc')}
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
        // size="sm"
      >
        <Icons.ArrowUp10 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reorder by date (desc)</span>
      </Button>,
      */
      <Button
        key="DeleteSelected"
        onClick={() => setDeleteSelectedConfirmVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'destructive' : 'ghost'}
        disabled={!selectedIds?.size}
        // size="sm"
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Delete selected
          {!!selectedIds?.size && (
            <span className="ml-1 font-thin opacity-50">({selectedIds.size})</span>
          )}
        </span>
      </Button>,
      <div className="relative flex gap-2" key="FilterByText">
        <Input
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
      </div>,
      <Label
        key="TextFilterSmart"
        className={cn('flex select-none items-center gap-2', !filterText && 'disabled')}
      >
        <Checkbox
          defaultChecked={filterTextSmart}
          onCheckedChange={(checked) => setFilterTextSmart(Boolean(checked))}
        />
        Smart text filter
      </Label>,
    ],
    [
      addNewItem,
      addedIds,
      compareTargetId,
      filterAdded,
      filterSelected,
      filterTargeted,
      filterText,
      filterTextSmart,
      filterUpdated,
      items,
      reorderItems,
      restoreDefaults,
      saveDefaults,
      selectedIds,
      setCompareTargetId,
      setSelectedIds,
      t,
      totalChangedCount,
      updatedIds,
    ],
  );

  return (
    <div
      className={cn(
        isDev && '__HeadlessQuestionsEditorDemo', // DEBUG
        'flex flex-col gap-6',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__HeadlessQuestionsEditorDemo_Actions', // DEBUG
          'flex flex-wrap gap-2 px-6',
        )}
      >
        {actions}
      </div>
      <ScrollArea
        className={cn(
          isDev && '__HeadlessQuestionsEditorDemo_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(
          isDev && '__HeadlessQuestionsEditorDemo_ScrollViewport',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__HeadlessQuestionsEditorDemo_HeadlessEditor', // DEBUG
            'w-full px-6',
          )}
          // forceCompact
        />
      </ScrollArea>
      <AddQuestionModal
        isVisible={addQuestionModalVisible}
        onClose={() => setAddQuestionModalVisible(false)}
        onDone={(formData) => {
          const newItem = {
            topicId: demoTopicId,
            ...formData,
          };
          addNewItem(newItem);
        }}
        closeImmediatelly
      />
      <ConfirmModal
        dialogTitle={t('ConfirmDeleteQuestions')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('Delete')}
        confirmButtonBusyText={t('ManageTopicQuestionsListCard.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={() => setDeleteSelectedConfirmVisible(false)}
        handleConfirm={() => {
          deleteSelected();
          setDeleteSelectedConfirmVisible(false);
        }}
        isVisible={deleteSelectedConfirmVisible}
      >
        {t('ConfirmDeleteQuestionsMessage', {
          count: selectedIds?.size || 0,
        })}
      </ConfirmModal>
    </div>
  );
}
