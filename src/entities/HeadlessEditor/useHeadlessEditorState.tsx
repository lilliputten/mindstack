import React from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

import { newItemIdPrefix } from './constants';
import { HeadlessEditor } from './HeadlessEditor';
import {
  HeadlessEditorControls,
  THeadlessEditorControlsExternalProps,
} from './HeadlessEditorControls';
import { getUniqueIdForSet } from './helpers';
import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';

type TReorderFunc<T extends TCmpItemBase> = (items: T[], lang: string) => T[];
interface TCustomReorder<T extends TCmpItemBase> {
  func?: TReorderFunc<T>;
  desc?: boolean;
}

export type TReorderModes<T extends TCmpItemBase> = Record<string, TCustomReorder<T>>;

type TNew<T extends TCmpItemBase> = Omit<T, 'id'> & Partial<Pick<T, 'id'>>;

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean = boolean> {
  /// Lifecylcle control...

  /** Data ready flag. A skeleton will be disaplayed until it hasn't set. */
  isReady?: boolean;
  /** Does the owner editor component have unsaved data? */
  hasChanges?: boolean;

  /// Reorder options

  reorderModes?: TReorderModes<T>;

  /// Options...

  /** Language for the comparator */
  lang: string;
  /** Large texts support: To item textss using ngrams for large texts or with just tokens otherwise */
  largeTexts?: LargeTexts;
  /** Show normalized values */
  showNormalized?: boolean;
  setShowNormalized?: React.Dispatch<React.SetStateAction<boolean>>;

  /// Filters...

  filterText?: string;
  filterTextSmart?: boolean;

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
  filterText?: string;
  filterTextSmart?: boolean;
  filterTargeted?: boolean;
  filterUpdated?: boolean;
  filterAdded?: boolean;
  filterSelected?: boolean;
}

export interface THeadlessEditorState<
  T extends TCmpItemBase,
  // LargeTexts extends boolean = boolean,
> {
  /// Data...

  items: T[];

  /// State...

  compareTargetId?: T['id'];
  totalChangedCount: number;

  /// Setters (AKA state controllers)...

  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  setCompareTargetId: React.Dispatch<React.SetStateAction<T['id'] | undefined>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<T['id']> | undefined>>;
  setUpdatedIds: React.Dispatch<React.SetStateAction<Set<T['id']> | undefined>>;
  setDeletedIds: React.Dispatch<React.SetStateAction<Set<T['id']> | undefined>>;
  setAddedIds: React.Dispatch<React.SetStateAction<Set<T['id']> | undefined>>;
  setReorderedIds: React.Dispatch<React.SetStateAction<Set<T['id']> | undefined>>;

  /// Indices...

  updatedIds: Set<T['id']> | undefined;
  deletedIds: Set<T['id']> | undefined;
  addedIds: Set<T['id']> | undefined;
  reorderedIds: Set<T['id']> | undefined;
  selectedIds: Set<T['id']> | undefined;

  /// Handlers...

  restoreDefaults: () => void;
  addNewItem: (newBaseItem: TNew<T>) => void;
  deleteSelected: () => void;
  reorderItems: (reorderId?: string | undefined) => void;

  /// Auxilliary helpers...

  getUniqueNewId: () => T['id'];

  /// Components..

  RenderHeadlessEditor: (props: TRenderProps) => React.JSX.Element;
  RenderHeadlessEditorControls: (
    props: THeadlessEditorControlsExternalProps<T>,
  ) => React.JSX.Element;
}

export function useHeadlessEditorState<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const memo = React.useMemo<TMemo<T>>(() => ({}), []);
  const {
    isReady = true,
    hasChanges,
    lang,
    largeTexts,

    reorderModes,
    // forceCompact,
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    defaultItems,
    getItemText,
    RenderItem,

    // Normalized...
    showNormalized,
    setShowNormalized,
  } = props;
  memo.filterText = filterText;
  memo.filterTextSmart = filterTextSmart;
  memo.filterTargeted = filterTargeted;
  memo.filterUpdated = filterUpdated;
  memo.filterAdded = filterAdded;
  memo.filterSelected = filterSelected;

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
    setReorderedIds(undefined);
    // Recreate added ids list from the items...
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

  // Add new item handler
  const addNewItem = React.useCallback(
    (newBaseItem: TNew<T>) => {
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

  const reorderByTextFunc = React.useCallback<TReorderFunc<T>>(
    (items, lang) => {
      const itemTexts = new WeakMap(items.map((item) => [item, getItemText(item)]));
      const reorderedItems = [...items].sort((aIt, bIt) => {
        const a = itemTexts.get(aIt)?.trim() || '';
        const b = itemTexts.get(bIt)?.trim() || '';
        // return a < b ? -1 : a > b ? 1 : 0;
        return a.localeCompare(b, lang, {
          // 'sensitivity: "base"' treats 'á', 'a' and 'A' as the same
          // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#sensitivity
          sensitivity: 'base',
        });
      });
      return reorderedItems;
    },
    [getItemText],
  );

  const reorderWithFunc = React.useCallback(
    (func: TReorderFunc<T>, desc?: boolean) => {
      let reorderedItems = func(items, lang);
      if (desc) {
        reorderedItems = [...reorderedItems].reverse();
      }
      // Detect reordered items...
      const newReorderedIds = new Set<T['id']>();
      const newItems = reorderedItems.map((it, idx) => {
        const order = idx + 1;
        if (it.order !== order) {
          it = { ...it, order };
          newReorderedIds.add(it.id);
        }
        return it;
      });
      const reorderedCount = newReorderedIds.size;
      // Update the data if reordering has occured...
      if (reorderedCount) {
        setReorderedIds(
          (reorderedIds = new Set()) => new Set([...reorderedIds, ...newReorderedIds.keys()]),
        );
        setItems(newItems);
      }
    },
    [items, lang],
  );

  const reorderItems = React.useCallback(
    (reorderId?: string) => {
      const mode = reorderId && reorderModes ? reorderModes[reorderId] : undefined;
      const func = mode?.func || reorderByTextFunc;
      const desc = mode?.desc ?? reorderId?.toLowerCase().endsWith('desc');
      reorderWithFunc(func, desc);
    },
    [reorderWithFunc, reorderByTextFunc, reorderModes],
  );

  const totalChangedCount =
    [
      // Count all the 'changed' ids
      updatedIds?.size,
      deletedIds?.size,
      addedIds?.size,
      reorderedIds?.size,
    ].reduce((summ = 0, val = 0) => summ + val, 0) || 0;

  const RenderHeadlessEditorControls = React.useCallback(
    (props: THeadlessEditorControlsExternalProps<T>) => {
      const {
        className,
        // Reorder...
        reorderTitles,
        // Actions...
        onSaveData,
        onAddAction,
        onDeleteAction,
        // Filter setters...
        setFilterTargeted,
        setFilterUpdated,
        setFilterAdded,
        setFilterSelected,
        setFilterText,
        setFilterTextSmart,
      } = props;
      const {
        // deletedIds,
        items,
        addedIds,
        compareTargetId,
        reorderedIds,
        selectedIds,
        updatedIds,
        filterText,
        filterTextSmart,
        filterTargeted,
        filterUpdated,
        filterAdded,
        filterSelected,
      } = memo;
      return (
        <HeadlessEditorControls
          className={cn(
            isDev && '__HeadlessEditorDemo_HeadlessEditorControls', // DEBUG
            className,
          )}
          // Reorder...
          reorderItems={reorderItems}
          reorderTitles={reorderTitles}
          // Actions...
          onSaveData={onSaveData}
          onAddAction={onAddAction}
          onDeleteAction={onDeleteAction}
          // Filter setters...
          setFilterTargeted={setFilterTargeted}
          setFilterUpdated={setFilterUpdated}
          setFilterAdded={setFilterAdded}
          setFilterSelected={setFilterSelected}
          setFilterText={setFilterText}
          setFilterTextSmart={setFilterTextSmart}
          // Lifecylcle control...
          isReady={isReady}
          // Actions...
          setCompareTargetId={setCompareTargetId}
          setSelectedIds={setSelectedIds}
          setUpdatedIds={setUpdatedIds}
          setDeletedIds={setDeletedIds}
          setAddedIds={setAddedIds}
          setReorderedIds={setReorderedIds}
          restoreDefaults={restoreDefaults}
          // Calculated data...
          totalChangedCount={totalChangedCount}
          // Filters...
          filterText={filterText}
          filterTextSmart={filterTextSmart}
          filterTargeted={filterTargeted}
          filterUpdated={filterUpdated}
          filterAdded={filterAdded}
          filterSelected={filterSelected}
          // Items...
          items={items || []}
          // State...
          updatedIds={updatedIds}
          addedIds={addedIds}
          reorderedIds={reorderedIds}
          selectedIds={selectedIds}
          compareTargetId={compareTargetId}
          // Normalized...
          setShowNormalized={setShowNormalized}
          showNormalized={showNormalized}
        />
      );
    },
    [
      memo,
      reorderItems,
      isReady,
      restoreDefaults,
      totalChangedCount,
      setShowNormalized,
      showNormalized,
    ],
  );

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
        filterText,
        filterTextSmart,
        filterTargeted,
        filterUpdated,
        filterAdded,
        filterSelected,
      } = memo;
      return (
        <HeadlessEditor
          className={cn(
            isDev && '__HeadlessEditorDemo_HeadlessEditor', // DEBUG
            className,
          )}
          // Lifecylcle control...
          isReady={isReady}
          hasChanges={hasChanges || !!totalChangedCount}
          // Options...
          lang={lang}
          largeTexts={largeTexts}
          forceCompact={forceCompact}
          showNormalized={showNormalized}
          // Filters...
          filterText={filterText}
          filterTextSmart={filterTextSmart}
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
      // filterAdded,
      // filterSelected,
      // filterTargeted,
      // filterText,
      // filterTextSmart,
      // filterUpdated,
      // items,
      // reorderedIds,
      // selectedIds,
      // updatedIds,
      RenderItem,
      getItemText,
      hasChanges,
      isReady,
      lang,
      largeTexts,
      memo,
      showNormalized,
      toggleSelectedId,
      totalChangedCount,
      updateItems,
      updateReordered,
    ],
  );

  return React.useMemo<THeadlessEditorState<T>>(
    () => ({
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
      reorderItems,

      /// Auxilliary helpers...

      getUniqueNewId,

      /// Components..

      RenderHeadlessEditor,
      RenderHeadlessEditorControls,

      /* /// Internal setters and getters (not exposed)...
      updateItems,
      updateReordered,
      toggleSelectedId,
      */
    }),
    [
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
      reorderItems,

      /// Auxilliary helpers...

      getUniqueNewId,

      /// Components..

      RenderHeadlessEditor,
      RenderHeadlessEditorControls,
    ],
  );
}
