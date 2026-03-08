import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import {
  AddQuestionModal,
  TFormData as TAddQuestionFormData,
} from '@/components/pages/ManageTopicQuestions/AddQuestionModal';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { HeadlessEditor } from '../HeadlessEditor';
import { TCmpItemId } from '../types';
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

  const [addQuestionModalVisible, setAddQuestionModalVisible] = React.useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);

  const [items, setItems] = React.useState(() => demoQuestions);
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [deletedIds, setDeletedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [addedIds, setAddedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [reorderedIds, setReorderedIds] = React.useState<Set<TCmpItemId> | undefined>();

  const updateItems = React.useCallback((its: T[]) => {
    const newIdsMap = new Map(its.map((item) => [item.id, item]));
    setUpdatedIds((updatedIds = new Set()) => new Set([...updatedIds, ...newIdsMap.keys()]));
    setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
  }, []);

  const updateReordered = React.useCallback((its: T[]) => {
    const newIdsMap = new Map(its.map((item) => [item.id, item]));
    setReorderedIds((reorderedIds = new Set()) => new Set([...reorderedIds, ...newIdsMap.keys()]));
    setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
  }, []);

  // State: Local selected ids set
  const [selectedIds, setSelectedIds] = React.useState<Set<TCmpItemId> | undefined>();
  // State: Local selected target id
  const [compareTargetId, setCompareTargetId] = React.useState<TCmpItemId | undefined>();

  const setSelectedId = React.useCallback((id: TCmpItemId, selected: boolean) => {
    setSelectedIds((selectedIds) => {
      selectedIds = new Set(selectedIds);
      if (selected) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }
      return selectedIds;
    });
  }, []);

  // Effect: Remove orphan ids, update `addedIds`...
  React.useEffect(() => {
    const existedKeys = new Set<TCmpItemId>(items.map(({ id }) => id));
    setCompareTargetId((id) => {
      return id && existedKeys.has(id) ? id : undefined;
    });
    const hasId = (id: TCmpItemId) => existedKeys.has(id);
    const hasIdsSet = (ids?: Set<TCmpItemId>) => ids && new Set(ids.keys().filter(hasId));
    // Actualize tracked id sets...
    setSelectedIds(hasIdsSet);
    setUpdatedIds(hasIdsSet);
    setReorderedIds(hasIdsSet);
    // Recreate added ids set...
    setAddedIds(
      new Set(items.filter(({ id, isNew }) => isNew || id.startsWith('__new')).map(({ id }) => id)),
    );
  }, [items]);

  const restoreDefaults = React.useCallback(() => {
    setItems(demoQuestions);
    setUpdatedIds(undefined);
    setDeletedIds(undefined);
    setAddedIds(
      new Set(
        demoQuestions
          .filter(({ id, isNew }) => isNew || id.startsWith('__new'))
          .map(({ id }) => id),
      ),
    );
  }, []);

  const selectedCount = selectedIds?.size || 0;

  const getUniqueNewId = React.useCallback(() => {
    // Combine a set of used ids from deleted and actual ones...
    const usedKeys = new Set([...(deletedIds ?? []), ...items.map(({ id }) => id)]);
    let count = 0;
    let id: string;
    do {
      // ...and find the first avaiable id...
      id = `__new${++count}`;
    } while (usedKeys.has(id));
    return id;
  }, [items, deletedIds]);

  const addNewItem = React.useCallback(
    (formData: TAddQuestionFormData) => {
      const id = getUniqueNewId();
      const newItem: T = {
        id,
        topicId: demoTopicId,
        // text: `New item ${id}`,
        ...formData,
      };
      setItems((items) => {
        return items.concat(newItem);
      });
      setAddedIds((ids) => {
        const newSet = new Set(ids);
        newSet.add(id);
        return newSet;
      });
    },
    [getUniqueNewId],
  );

  const deleteSelected = React.useCallback(() => {
    if (selectedIds?.size) {
      // Add removed item ids to `deletedIds`
      setDeletedIds((deletedIds = new Set()) => new Set([...deletedIds, ...selectedIds]));
      // Delete items
      setItems((items) => items.filter(({ id }) => !selectedIds?.has(id)));
      setShowDeleteSelectedConfirm(false);
    }
  }, [selectedIds]);

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
        onClick={() => setAddQuestionModalVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant="success"
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add new</span>
      </Button>,
      <Button
        key="RestoreDefaults"
        onClick={restoreDefaults}
        className="content-truncate flex items-center gap-2"
        variant="theme"
      >
        <Icons.Undo2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Restore defaults</span>
      </Button>,
      <Button
        key="DeleteSelected"
        onClick={() => setShowDeleteSelectedConfirm(true)}
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
    ],
    [
      compareTargetId,
      restoreDefaults,
      filterSelected,
      filterTargeted,
      filterUpdated,
      filterAdded,
      items,
      selectedCount,
    ],
  );

  // const viewportRef = React.useRef(null);

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
        <HeadlessEditor
          className={cn(
            isDev && '__HeadlessEditorDemo_HeadlessEditor', // DEBUG
            'w-full',
          )}
          // Lifecylcle control...
          isReady
          // Options...
          locale={locale}
          largeTexts={largeTexts}
          // compact
          filterTargeted={filterTargeted}
          filterUpdated={filterUpdated}
          filterAdded={filterAdded}
          filterSelected={filterSelected}
          // Items...
          items={items}
          getItemText={getItemText}
          RenderItem={CmpQuestion}
          updateItems={updateItems}
          updateReordered={updateReordered}
          // State...
          updatedIds={updatedIds}
          addedIds={addedIds}
          reorderedIds={reorderedIds}
          selectedIds={selectedIds}
          setSelectedId={setSelectedId}
          compareTargetId={compareTargetId}
          setCompareTargetId={setCompareTargetId}
        />
      </ScrollArea>
      <AddQuestionModal
        isVisible={addQuestionModalVisible}
        onClose={() => setAddQuestionModalVisible(false)}
        onDone={addNewItem}
        closeImmediatelly
      />
      <ConfirmModal
        dialogTitle={t('ManageTopicQuestionsListCard.ConfirmDeleteQuestions')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('Delete')}
        confirmButtonBusyText={t('ManageTopicQuestionsListCard.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={() => setShowDeleteSelectedConfirm(false)}
        handleConfirm={deleteSelected}
        // isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteSelectedConfirm}
      >
        {t('ManageTopicQuestionsListCard.ConfirmDeleteQuestionsMessage', {
          count: selectedCount,
        })}
      </ConfirmModal>
    </div>
  );
}
