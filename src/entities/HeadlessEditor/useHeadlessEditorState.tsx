import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale } from '@/i18n';
import { isDev } from '@/config';

import { newItemIdPrefix } from './constants';
import { HeadlessEditor } from './HeadlessEditor';
import { getUniqueIdForSet } from './helpers';
import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean = boolean> {
  /// Lifecylcle control...

  /** Data ready flag. A skeleton will be disaplayed until it hasn't set. */
  isReady?: boolean;

  /// Options...

  /** Locale for comparator */
  locale: TLocale;
  /** Large texts support: To item textss using ngrams for large texts or with just tokens otherwise */
  largeTexts?: LargeTexts;

  /// Filters...

  filterTargeted?: boolean;
  filterUpdated?: boolean;
  filterAdded?: boolean;
  filterSelected?: boolean;

  // Items interface...

  /** Items list */
  defaultItems: T[];
  /** A method to retrieve an items text to compare */
  getItemText: (item: T) => string;
  /** Editor item rendering component */
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
}

interface TRenderProps {
  className?: string;
  /** Display in a narrow layout */
  forceCompact?: boolean;
}

interface TMemo<T extends TCmpItemBase> {
  items?: T[];
  addedIds?: Set<TCmpItemId>;
  updatedIds?: Set<TCmpItemId>;
  deletedIds?: Set<TCmpItemId>;
  reorderedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  compareTargetId?: TCmpItemId;
}

export function useHeadlessEditorState<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const memo = React.useMemo<TMemo<T>>(() => ({}), []);
  const {
    isReady,
    locale,
    largeTexts,
    // forceCompact,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    defaultItems,
    getItemText,
    RenderItem,
  } = props;

  // Items data...
  const [items, setItems] = React.useState(() => defaultItems);
  memo.items = items;

  // Tracking indices
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [deletedIds, setDeletedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [addedIds, setAddedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [reorderedIds, setReorderedIds] = React.useState<Set<TCmpItemId> | undefined>();
  memo.addedIds = addedIds;
  memo.updatedIds = updatedIds;
  memo.deletedIds = deletedIds;
  memo.reorderedIds = reorderedIds;

  // Update items handler
  const updateItems = React.useCallback((its: T[]) => {
    const newIdsMap = new Map(its.map((item) => [item.id, item]));
    setUpdatedIds((updatedIds = new Set()) => new Set([...updatedIds, ...newIdsMap.keys()]));
    setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
  }, []);

  // Update reordered indices handler
  const updateReordered = React.useCallback((its: T[]) => {
    const newIdsMap = new Map(its.map((item) => [item.id, item]));
    setReorderedIds((reorderedIds = new Set()) => new Set([...reorderedIds, ...newIdsMap.keys()]));
    setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
  }, []);

  // State: Local selected ids set
  const [selectedIds, setSelectedIds] = React.useState<Set<TCmpItemId> | undefined>();
  memo.selectedIds = selectedIds;
  // State: Local selected target id
  const [compareTargetId, setCompareTargetId] = React.useState<TCmpItemId | undefined>();
  memo.compareTargetId = compareTargetId;

  // Toggle item selected status handler
  const toggleSelectedId = React.useCallback((id: TCmpItemId, selected: boolean) => {
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
      new Set(
        items
          .filter(({ id, isNew }) => isNew || String(id).startsWith(newItemIdPrefix))
          .map(({ id }) => id),
      ),
    );
  }, [items]);

  // Restore defaults handler
  const restoreDefaults = React.useCallback(() => {
    setItems(defaultItems);
    setUpdatedIds(undefined);
    setDeletedIds(undefined);
    setAddedIds(
      new Set(
        defaultItems
          .filter(({ id, isNew }) => isNew || String(id).startsWith(newItemIdPrefix))
          .map(({ id }) => id),
      ),
    );
  }, [defaultItems]);

  // Generate an id for the new item, based on the deleted and actual ids
  const getUniqueNewId = React.useCallback(() => {
    // Combine a set of used ids from deleted and actual ones...
    const usedIds = new Set([...(deletedIds ?? []), ...items.map(({ id }) => id)]);
    return getUniqueIdForSet(usedIds);
  }, [items, deletedIds]);

  type TNew = Omit<T, 'id'> & Partial<Pick<T, 'id'>>;

  // Add new item handler (XXX!)
  const addNewItem = React.useCallback(
    (newBaseItem: TNew) => {
      const newItem = {
        ...newBaseItem,
        id: newBaseItem.id || getUniqueNewId(),
      } as T;
      setItems((items) => {
        return items.concat(newItem);
      });
      setAddedIds((ids) => {
        const newSet = new Set(ids);
        newSet.add(newItem.id);
        return newSet;
      });
    },
    [getUniqueNewId],
  );

  // Delete selected items handler
  const deleteSelected = React.useCallback(() => {
    if (selectedIds?.size) {
      // Add removed item ids to `deletedIds`
      setDeletedIds((deletedIds = new Set()) => new Set([...deletedIds, ...selectedIds]));
      // Delete items
      setItems((items) => items.filter(({ id }) => !selectedIds?.has(id)));
    }
  }, [selectedIds]);

  const RenderHeadlessEditor = React.useCallback(
    (props: TRenderProps) => {
      const { className, forceCompact } = props;
      const {
        // deletedIds,
        items,
        addedIds,
        compareTargetId,
        reorderedIds,
        selectedIds,
        updatedIds,
      } = memo;
      return (
        <HeadlessEditor
          className={cn(
            isDev && '__HeadlessEditorDemo_HeadlessEditor', // DEBUG
            className,
          )}
          // Lifecylcle control...
          isReady={isReady}
          // Options...
          locale={locale}
          largeTexts={largeTexts}
          forceCompact={forceCompact}
          filterTargeted={filterTargeted}
          filterUpdated={filterUpdated}
          filterAdded={filterAdded}
          filterSelected={filterSelected}
          // Items...
          items={items || []}
          getItemText={getItemText}
          RenderItem={RenderItem}
          updateItems={updateItems}
          updateReordered={updateReordered}
          // State...
          updatedIds={updatedIds}
          addedIds={addedIds}
          reorderedIds={reorderedIds}
          selectedIds={selectedIds}
          toggleSelectedId={toggleSelectedId}
          compareTargetId={compareTargetId}
          setCompareTargetId={setCompareTargetId}
        />
      );
    },
    [
      // addedIds,
      // compareTargetId,
      // items,
      // reorderedIds,
      // selectedIds,
      // updatedIds,
      RenderItem,
      filterAdded,
      filterSelected,
      filterTargeted,
      filterUpdated,
      getItemText,
      isReady,
      largeTexts,
      locale,
      memo,
      toggleSelectedId,
      updateItems,
      updateReordered,
    ],
  );

  const totalChangedCount = [
    updatedIds?.size,
    deletedIds?.size,
    addedIds?.size,
    reorderedIds?.size,
  ].reduce((summ = 0, val = 0) => summ + val, 0);

  return {
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

    /// Indices...

    updatedIds,
    deletedIds,
    addedIds,
    reorderedIds,
    selectedIds,

    /// Handlers...

    restoreDefaults,
    addNewItem,
    deleteSelected,

    /// Auxilliary helpers...

    getUniqueNewId,

    /// Component...

    RenderHeadlessEditor,

    /* /// Internal setters and getters (not exposed)...
    updateItems,
    updateReordered,
    toggleSelectedId,
    */
  };
}
