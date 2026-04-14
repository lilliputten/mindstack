import React from 'react';

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

function prepareItemToSave<T extends TCmpItemBase>(it: T): T {
  if (it._count) {
    it = { ...it };
    delete it._count;
  }
  return it;
}
function prepareNewItemToSave<T extends TCmpItemBase>(it: T): TNew<T> {
  const newIt = { ...prepareItemToSave(it) } as TNew<T>;
  delete newIt.isNew;
  // delete newIt.id;
  return newIt;
}
function getAddedIdsSet<T extends TCmpItemBase>(items: T[]) {
  return new Set(
    items
      .filter(({ id, isNew }) => isNew || String(id).startsWith(newItemIdPrefix))
      .map(({ id }) => id),
  );
}

export interface TSaveDataParams<T extends TCmpItemBase> {
  // All items list...
  items: T[];
  // Items by update type...
  updatedItems?: Set<T>;
  deletedItems?: Set<T>;
  addedItems?: Set<TNew<T>>;
  // Ids by update type...
  // affectedIds?: Set<T['id']>;
  addedIds?: Set<T['id']>;
  updatedIds?: Set<T['id']>;
  deletedIds?: Set<T['id']>;
  reorderedIds?: Set<T['id']>;
  selectedIds?: Set<T['id']>;
}

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean = boolean> {
  /// Lifecylcle control...

  /** Data ready flag. A skeleton will be disaplayed until it hasn't set. */
  isReady?: boolean;
  isLoading?: boolean;

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
  saveData?: (params: TSaveDataParams<T>) => Promise<unknown>;
  /** A method to retrieve an items text to compare */
  getItemText: (item: T) => string;
  /** Editor item rendering component */
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  /** When true, `hasChanges` is derived from `totalChangedCount` instead of tracked as independent state. */
  calculateChanges?: boolean;
  /** Arbitrary extra data forwarded to every RenderItem call */
  extraParams?: unknown;
}

interface TRenderProps {
  className?: string;
  /** Display in a narrow layout */
  forceCompact?: boolean;
}

interface TMemo<T extends TCmpItemBase> {
  items?: T[];
  defaultItems?: T[];
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
  showNormalized?: boolean;
  totalChangedCount?: number;
  changesCount?: number;
  hasRevertableChanges?: boolean;
  allowedSave?: boolean;
  extraParams?: unknown;
  isReady?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
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
  hasChanges: boolean;

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
    isLoading,
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
    saveData,
    getItemText,
    RenderItem,
    calculateChanges,
    extraParams,

    // Normalized...
    showNormalized,
    setShowNormalized,
  } = props;
  memo.defaultItems = defaultItems;
  memo.filterText = filterText;
  memo.filterTextSmart = filterTextSmart;
  memo.filterTargeted = filterTargeted;
  memo.filterUpdated = filterUpdated;
  memo.filterAdded = filterAdded;
  memo.filterSelected = filterSelected;
  memo.showNormalized = showNormalized;
  memo.extraParams = extraParams;
  memo.isReady = isReady;
  memo.isLoading = isLoading;

  const [isSaving, setSaving] = React.useState(false);
  memo.isSaving = isSaving;

  const [changesCount, setChangesCount] = React.useState<number>(0);

  // Items data...
  const [items, setItems] = React.useState(() => defaultItems);
  memo.items = items;

  // Initialize ids from items
  const initAddedIds = React.useMemo(() => new Set(getAddedIdsSet(defaultItems)), [defaultItems]);

  // Tracking indices
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>(undefined);
  const [deletedIds, setDeletedIds] = React.useState<Set<TCmpItemId> | undefined>(undefined);
  const [addedIds, setAddedIds] = React.useState<Set<TCmpItemId> | undefined>(initAddedIds);
  const [reorderedIds, setReorderedIds] = React.useState<Set<TCmpItemId> | undefined>(undefined);
  memo.addedIds = addedIds;
  memo.updatedIds = updatedIds;
  memo.deletedIds = deletedIds;
  memo.reorderedIds = reorderedIds;

  // Update items handler
  const updateItems = React.useCallback((its: T[]) => {
    const newItemsMap = new Map(its.map((item) => [item.id, item]));
    setUpdatedIds((updatedIds = new Set()) => new Set([...updatedIds, ...newItemsMap.keys()]));
    setItems((items) => {
      const updatedItems = items.map((old) => newItemsMap.get(old.id) ?? old);
      return updatedItems;
    });
    setChangesCount((count) => count + newItemsMap.size);
  }, []);

  // Update reordered indices handler
  const updateReordered = React.useCallback((its: T[]) => {
    const newItemsMap = new Map(its.map((item) => [item.id, item]));
    setReorderedIds(
      (reorderedIds = new Set()) => new Set([...reorderedIds, ...newItemsMap.keys()]),
    );
    setItems((items) => items.map((old) => newItemsMap.get(old.id) ?? old));
    setChangesCount((count) => count + its.length);
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

  // Effect: Actualize tracked id sets when items change (remove orphan ids)...
  React.useEffect(() => {
    const existedKeys = new Set<TCmpItemId>(items.map(({ id }) => id));
    const hasId = (id: TCmpItemId) => existedKeys.has(id);
    const hasIdsSet = (ids?: Set<TCmpItemId>) => ids && new Set(ids.keys().filter(hasId));
    const addedIds = getAddedIdsSet(items);
    // Lifecycle workaround (TODO: Use a proper way to update)
    setTimeout(() => {
      setCompareTargetId((id) => {
        return id && existedKeys.has(id) ? id : undefined;
      });
      setSelectedIds(hasIdsSet);
      setUpdatedIds(hasIdsSet);
      setReorderedIds(hasIdsSet);
      setAddedIds(addedIds);
    });
  }, [items]);

  // Restore defaults (UNDO) handler
  const restoreDefaults = React.useCallback(() => {
    const { defaultItems } = memo;
    if (!defaultItems) return;
    setItems(defaultItems);
    setUpdatedIds(undefined);
    setDeletedIds(undefined);
    setReorderedIds(undefined);
    // Recreate added ids list from the items...
    const addedIds = getAddedIdsSet(defaultItems);
    setAddedIds(addedIds);
    setChangesCount(0);
  }, [memo]);

  // Restore defaults handler
  const handleSave = React.useCallback(() => {
    const {
      items, // T[]
      addedIds, // Set<TCmpItemId>
      updatedIds, // Set<TCmpItemId>
      deletedIds, // Set<TCmpItemId>
      reorderedIds, // Set<TCmpItemId>
      selectedIds, // Set<TCmpItemId>
      // compareTargetId, // TCmpItemId
      // filterText, // string
      // filterTextSmart, // boolean
      // filterTargeted, // boolean
      // filterUpdated, // boolean
      // filterAdded, // boolean
      // filterSelected, // boolean
    } = memo;
    if (!items) {
      return;
    }
    // Emulate data save procedure: remove any 'new item' features...
    // const affectedIds = new Set<T['id']>();
    const updatedItems = new Set<T>();
    const deletedItems = new Set<T>();
    const addedItems = new Set<TNew<T>>();
    /* const __savedItems = */ items.map((it) => {
      const id: T['id'] = it.id;
      if (it.isNew || String(id).startsWith(newItemIdPrefix) || addedIds?.has(id)) {
        // delete it.isNew; // DEBUG only
        addedItems.add(prepareNewItemToSave(it));
      } else if (deletedIds?.has(id)) {
        deletedItems.add(it);
      } else if (updatedIds?.has(id) || reorderedIds?.has(id)) {
        updatedItems.add(it);
      }
      // affectedIds.add(id);
      return it;
    });

    const saveDataParams: TSaveDataParams<T> = {
      // All items list...
      items, // T[]
      // Items by update type...
      updatedItems, // Set<T>
      deletedItems, // Set<T>
      addedItems, // Set<TNew<T>>
      // Ids by update type...
      // affectedIds,
      addedIds, // Set<T['id']>
      deletedIds, // Set<T['id']>
      updatedIds, // Set<T['id']>
      reorderedIds, // Set<T['id']>
      selectedIds, // Set<T['id']>
    };
    // startSavingTransition(async () => { });
    setSaving(true);
    const savePromise = saveData?.(saveDataParams) || Promise.resolve();
    savePromise
      .then(() => {
        // Update all data-related indices...
        setUpdatedIds(undefined);
        setDeletedIds(undefined);
        setAddedIds(undefined);
        setReorderedIds(undefined);
        setChangesCount(0);
      })
      .finally(() => {
        setSaving(false);
      });
  }, [memo, saveData]);

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
      setChangesCount((count) => count + 1);
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
      setChangesCount((count) => count + selectedIds?.size);
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
      const { items } = memo;
      if (!items) return;
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
        setChangesCount((count) => count + reorderedCount);
      }
    },
    [memo, lang],
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
  memo.totalChangedCount = totalChangedCount;
  memo.changesCount = changesCount;
  memo.hasRevertableChanges = !!changesCount;
  memo.allowedSave = calculateChanges ? !!totalChangedCount : !!changesCount;

  const RenderHeadlessEditorControls = React.useCallback(
    (props: THeadlessEditorControlsExternalProps<T>) => {
      const {
        className,
        // Reorder...
        reorderTitles,
        // Actions...
        // onSaveData, // NOTE: `handleSave` is used
        onAddAction,
        onDeleteAction,
        onReload,
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
        showNormalized,
        changesCount,
        allowedSave,
        isReady,
        isLoading,
        isSaving,
        // totalChangedCount,
        // hasRevertableChanges,
      } = memo;
      return (
        <HeadlessEditorControls
          className={cn(
            isDev && '__useHeadlessEditorState_HeadlessEditorControls', // DEBUG
            'transition',
            (!isReady || isLoading) && 'opacity-50',
            !isReady && 'pointer-events-none',
            className,
          )}
          // Reorder...
          reorderItems={reorderItems}
          reorderTitles={reorderTitles}
          // Actions...
          onSaveData={saveData ? handleSave : undefined}
          onAddAction={onAddAction}
          onDeleteAction={onDeleteAction}
          onReload={onReload}
          // Filter setters...
          setFilterTargeted={setFilterTargeted}
          setFilterUpdated={setFilterUpdated}
          setFilterAdded={setFilterAdded}
          setFilterSelected={setFilterSelected}
          setFilterText={setFilterText}
          setFilterTextSmart={setFilterTextSmart}
          // Actions...
          setCompareTargetId={setCompareTargetId}
          setSelectedIds={setSelectedIds}
          setUpdatedIds={setUpdatedIds}
          setDeletedIds={setDeletedIds}
          setAddedIds={setAddedIds}
          setReorderedIds={setReorderedIds}
          restoreDefaults={restoreDefaults}
          // Calculated data...
          changesCount={changesCount}
          allowedSave={allowedSave}
          // totalChangedCount={totalChangedCount}
          // hasRevertableChanges={hasRevertableChanges}
          // Filters...
          filterText={filterText}
          filterTextSmart={filterTextSmart}
          filterTargeted={filterTargeted}
          filterUpdated={filterUpdated}
          filterAdded={filterAdded}
          filterSelected={filterSelected}
          // Items...
          items={items || []}
          // Lifecylcle control...
          isReady={isReady}
          isLoading={isLoading}
          isSaving={isSaving}
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
      handleSave,
      // isLoading,
      // isReady,
      // isSaving,
      memo,
      reorderItems,
      restoreDefaults,
      saveData,
      setShowNormalized,
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
        showNormalized,
        // hasChanges,
        allowedSave,
        // totalChangedCount,
        isReady,
        isLoading,
        isSaving,
      } = memo;
      return (
        <HeadlessEditor
          className={cn(
            isDev && '__useHeadlessEditorState_HeadlessEditor', // DEBUG
            'transition',
            (!isReady || isLoading || isSaving) && 'opacity-50',
            !isReady && 'pointer-events-none',
            className,
          )}
          // Lifecylcle control...
          isReady={isReady}
          isLoading={isLoading}
          hasChanges={allowedSave}
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
          extraParams={memo.extraParams}
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
      RenderItem,
      getItemText,
      // \<\(isReady\|isLoading\|isSaving\)\>
      // isReady,
      // isLoading,
      // isSaving,
      lang,
      largeTexts,
      memo,
      toggleSelectedId,
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
      hasChanges: !!memo.hasRevertableChanges,

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
    }),
    [
      /// Data...

      items,

      /// State...

      compareTargetId,
      totalChangedCount,
      memo.hasRevertableChanges,

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
