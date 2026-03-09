import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions/AddQuestionModal';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { TQuestionId } from '@/features/questions/types';

import { newItemIdPrefix } from '../constants';
import { getUniqueIdForSet } from '../helpers';
import { useHeadlessEditorState } from '../useHeadlessEditorState';
import { CmpQuestion } from './CmpQuestion';
import { demoQuestions, demoTopicId } from './demoQuestions';
import { T } from './types';

interface TProps {
  className?: string;
  // Locale for comparator
  locale?: TLocale;
  // Compare using ngrams for large texts or with just tokens otherwise
  largeTexts?: boolean;
}

function getItemText(item: T) {
  return item.text;
}

export function HeadlessEditorDemo(props: TProps) {
  const {
    className,
    // Locale for comparator
    locale = 'en',
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
    // updatedIds,
    // deletedIds,
    // addedIds,
    // reorderedIds,
    selectedIds,
    /// Handlers...
    restoreDefaults,
    addNewItem,
    deleteSelected,
    /// Component...
    RenderHeadlessEditor,
  } = useHeadlessEditorState({
    // isReady,
    /// Options...
    locale,
    largeTexts,
    /// Filters...
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

  const selectedCount = selectedIds?.size || 0;

  const actions = React.useMemo(
    () => [
      <Button
        key="ClearCompareTarget"
        onClick={() => setCompareTargetId(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={compareTargetId ? 'theme' : 'ghost'}
        disabled={!compareTargetId}
      >
        <Icons.CircleSlash2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Clear compare target</span>
      </Button>,
      <Button
        key="ShowCompared"
        onClick={() => setFilterTargeted((filterTargeted) => !filterTargeted)}
        className="content-truncate flex items-center gap-2"
        variant={filterTargeted ? 'secondary' : 'ghost'}
      >
        <Icons.Scale className="size-5 shrink-0 opacity-50" />
        <span className="truncate">Filter compared</span>
      </Button>,
      <Button
        key="ShowUpdated"
        onClick={() => setFilterUpdated((filterUpdated) => !filterUpdated)}
        className="content-truncate flex items-center gap-2"
        variant={filterUpdated ? 'secondary' : 'ghost'}
      >
        <Icons.Pencil className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Filter updated</span>
      </Button>,
      <Button
        key="ShowAdded"
        onClick={() => setFilterAdded((filterAdded) => !filterAdded)}
        className="content-truncate flex items-center gap-2"
        variant={filterAdded ? 'secondary' : 'ghost'}
      >
        <Icons.Asterisk className="size-5 shrink-0 opacity-50" />
        <span className="truncate">Filter added</span>
      </Button>,
      <Button
        key="ShowSelected"
        onClick={() => setFilterSelected((filterSelected) => !filterSelected)}
        className="content-truncate flex items-center gap-2"
        variant={filterSelected ? 'secondary' : 'ghost'}
      >
        <Icons.CircleCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Filter selected</span>
      </Button>,
      <Button
        key="SelectAll"
        onClick={() => setSelectedIds(new Set(items.map(({ id }) => id)))}
        className="content-truncate flex items-center gap-2"
        variant={selectedCount !== items.length ? 'theme' : 'ghost'}
        disabled={selectedCount === items.length}
      >
        <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Select all</span>
      </Button>,
      <Button
        key="SelectNone"
        onClick={() => setSelectedIds(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={selectedCount ? 'theme' : 'ghost'}
        disabled={!selectedCount}
      >
        <Icons.Square className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Select none</span>
      </Button>,
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
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add new</span>
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
        key="DeleteSelected"
        onClick={() => setDeleteSelectedConfirmVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant={selectedCount ? 'destructive' : 'ghost'}
        disabled={!selectedCount}
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Delete selected
          {!!selectedCount && <span className="ml-1 font-thin opacity-50">({selectedCount})</span>}
        </span>
      </Button>,
      <Button
        key="SaveDefaults"
        onClick={saveDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'success' : 'ghost'}
        disabled={!totalChangedCount}
      >
        <Icons.Save className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Save</span>
      </Button>,
    ],
    [
      addNewItem,
      compareTargetId,
      filterAdded,
      filterSelected,
      filterTargeted,
      filterUpdated,
      items,
      restoreDefaults,
      saveDefaults,
      selectedCount,
      setCompareTargetId,
      setSelectedIds,
      totalChangedCount,
    ],
  );

  return (
    <div
      className={cn(
        isDev && '__HeadlessEditorDemo', // DEBUG
        'flex flex-col gap-6',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__HeadlessEditorDemo_Actions', // DEBUG
          'flex flex-wrap gap-1 px-6',
        )}
      >
        {actions}
      </div>
      <ScrollArea
        className={cn(
          isDev && '__HeadlessEditorDemo_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(
          isDev && '__HeadlessEditorDemo_ScrollViewport',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__HeadlessEditorDemo_HeadlessEditor', // DEBUG
            'w-full',
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
        dialogTitle={t('ManageTopicQuestionsListCard.ConfirmDeleteQuestions')}
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
        {t('ManageTopicQuestionsListCard.ConfirmDeleteQuestionsMessage', {
          count: selectedCount,
        })}
      </ConfirmModal>
    </div>
  );
}
