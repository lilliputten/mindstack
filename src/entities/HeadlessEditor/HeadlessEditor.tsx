'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { TLocale } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { SortableWrapper } from '@/components/sortable';
import { isDev } from '@/config';

import { freshEffectTimeout, minCmpValue } from './constants';
import { HeadlessEditorDebug } from './HeadlessEditorDebug';
import { HeadlessEditorItem } from './HeadlessEditorItem';
import { compareByOrder } from './helpers';
import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';
import { useComparator } from './useComparator';

/* // EXAMPLE 1: A simpler editor component implementation, without forwarded API handlers, controlled via regular data props and optional handlers:
 * export function HeadlessEditor<T extends TCmpItemBase, LargeTexts extends boolean>(
 *   props: TProps<T, LargeTexts>,
 * ) { ... }
 *
 * // EXAMPLE 2: A more complex implementation, with an external interface:
 * export interface TComparatorRef<_T> {
 *   clearCompareTarget: () => void;
 *   // compareTargetId?: T;
 * }
 * export function HeadlessEditorFactory<
 *   T extends TCmpItemBase,
 *   LargeTexts extends boolean = boolean,
 * >() {
 *   return React.forwardRef<TComparatorRef<T>, TProps<T, LargeTexts>>(function HeadlessEditor(
 *     props: TProps<T, LargeTexts>,
 *     ref,
 *   ) {
 *     // ...
 *     const clearCompareTarget = React.useCallback(() => {
 *       setCompareTargetId(undefined);
 *     }, []);
 *     // Provide external API
 *     React.useImperativeHandle(
 *       ref,
 *       () => ({
 *         clearCompareTarget,
 *       }),
 *       [clearCompareTarget],
 *     );
 */

const __showDebug = isDev && true;

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean = boolean> {
  className?: string;

  // Lifecylcle control...
  isReady: boolean;

  // Options...
  // Locale for comparator
  locale: TLocale;
  // Compare using ngrams for large texts or with just tokens otherwise
  largeTexts: LargeTexts;
  // Display in narrow layout
  compact?: boolean;
  filterTargeted?: boolean;
  filterUpdated?: boolean;
  filterAdded?: boolean;
  filterSelected?: boolean;

  // Items interface...
  items: T[];
  getItemText: (item: T) => string;
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  // updateItem?: (it: T) => void;
  updateItems?: (its: T[]) => void;
  updateReordered?: (its: T[]) => void;

  // Items state...
  updatedIds?: Set<TCmpItemId>;
  addedIds?: Set<TCmpItemId>;
  reorderedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  // TODO: Use `setSelectedIds`
  setSelectedId?: (id: TCmpItemId, selected: boolean) => void;
  compareTargetId?: TCmpItemId;
  setCompareTargetId?: (id?: TCmpItemId) => void;
  changeItemsOrder?: (moveId: TCmpItemId, overId: TCmpItemId) => void;
}

type TTimeoutHandler = ReturnType<typeof setTimeout>;

interface TItemComparedValues {
  normalized: number;
  value: number;
  overallValue: number;
  overallCount: number;
  overallTotal: number;
}

interface TMemo<T extends TCmpItemBase> {
  freshIds?: Set<TCmpItemId>;
  addedIds?: Set<TCmpItemId>;
  updatedIds?: Set<TCmpItemId>;
  reorderedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  compareTargetId?: TCmpItemId;
  freshHandlers: Set<TTimeoutHandler>;
  getItemComparedValues?: (it: T) => TItemComparedValues;
}
const defaultMemo: TMemo<TCmpItemBase> = {
  freshHandlers: new Set(),
};

export function HeadlessEditor<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const memo = React.useMemo<TMemo<T>>(() => defaultMemo, []);
  const {
    className,
    isReady: isOuterReady,
    // Options...
    locale,
    largeTexts,
    compact,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    // Items...
    items,
    getItemText,
    RenderItem,
    updateItems,
    updateReordered,
    // State...
    updatedIds: externalUpdatedIds,
    addedIds,
    reorderedIds: externalReorderedIds,
    selectedIds: externalSelectedIds,
    setSelectedId: setExternalSelectedId,
    compareTargetId: externalCompareTargetId,
    setCompareTargetId: setExternalCompareTargetId,
    changeItemsOrder: changeExternalItemsOrder,
  } = props;
  memo.addedIds = addedIds;

  // Freshly added items...
  const [freshIds, setFreshIds] = React.useState<Set<TCmpItemId> | undefined>();
  memo.freshIds = freshIds;
  const addFreshIds = React.useCallback((ids: Set<TCmpItemId>) => {
    setFreshIds((freshIds) => {
      const initialLst = freshIds ? [...freshIds] : [];
      const newFreshIds = new Set([...initialLst, ...ids]);
      return newFreshIds;
    });
  }, []);
  const removeFreshIds = React.useCallback((ids: Set<TCmpItemId>) => {
    setFreshIds((freshIds) => {
      const initialLst = freshIds ? freshIds.keys() : [];
      return new Set([...initialLst.filter((id) => !ids.has(id))]);
    });
  }, []);

  // Updated items...
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>(
    externalUpdatedIds,
  );
  memo.updatedIds = updatedIds;
  React.useEffect(() => {
    setUpdatedIds(externalUpdatedIds);
  }, [externalUpdatedIds]);
  const addUpdatedIds = React.useCallback((ids: TCmpItemId[]) => {
    setUpdatedIds((updatedIds = new Set()) => new Set([...updatedIds, ...ids]));
  }, []);

  // Reordered items...
  const [reorderedIds, setReorderedIds] = React.useState<Set<TCmpItemId> | undefined>(
    externalReorderedIds,
  );
  memo.reorderedIds = reorderedIds;
  React.useEffect(() => {
    setReorderedIds(externalReorderedIds);
  }, [externalReorderedIds]);
  const addReorderedIds = React.useCallback((ids: TCmpItemId[]) => {
    setReorderedIds((reorderedIds = new Set()) => new Set([...reorderedIds, ...ids]));
  }, []);

  const handleUpdate = React.useCallback(
    (it: T) => {
      if (updateItems) updateItems([it]);
      else addUpdatedIds([it.id]);
    },
    [updateItems, addUpdatedIds],
  );

  // State: Local selected ids set
  const [selectedIds, setSelectedIds] = React.useState<Set<TCmpItemId> | undefined>(
    externalSelectedIds,
  );
  memo.selectedIds = selectedIds;
  // Effect: Update from external ids set
  React.useEffect(() => {
    setSelectedIds(externalSelectedIds);
  }, [externalSelectedIds]);

  // State: Local selected target id
  const [compareTargetId, setCompareTargetId] = React.useState<TCmpItemId | undefined>(
    externalCompareTargetId,
  );
  memo.compareTargetId = compareTargetId;
  // Effect: Update selected target id from external one
  React.useEffect(() => {
    setCompareTargetId(externalCompareTargetId);
  }, [externalCompareTargetId]);

  const handleCompareTargetId = React.useCallback(
    (id?: TCmpItemId) => {
      setCompareTargetId((compareTargetId) => {
        if (id && id == compareTargetId) {
          id = undefined;
        }
        if (setExternalCompareTargetId) {
          setExternalCompareTargetId(id);
        }
        return id;
      });
    },
    [setExternalCompareTargetId],
  );

  const { isComparatorReady, getComparedValue, overallComparedCache, itemsMap } = useComparator({
    isReady: isOuterReady,
    // Options...
    locale,
    largeTexts,
    // Items...
    items,
    getItemText,
  });

  const [compareMin, compareMax] = React.useMemo(() => {
    let min: number | undefined;
    let max: number | undefined;
    const compareTarget = compareTargetId ? itemsMap.get(compareTargetId) : undefined;
    items.forEach((it) => {
      const overall = overallComparedCache?.get(it);
      const overallValue = overall?.value || 0;
      let value = overallValue;
      if (compareTarget) {
        if (compareTarget === it) return;
        value = getComparedValue(compareTarget, it) || 0;
        if (!value) return;
      }
      if (value < (min ?? 1)) min = value;
      if (value > (max ?? 0)) max = value;
    });
    return [
      // ...
      min ?? 0,
      max ?? 1,
    ];
  }, [compareTargetId, getComparedValue, items, itemsMap, overallComparedCache]);

  const handleCheck = React.useCallback(
    (id: TCmpItemId) => {
      setSelectedIds((selectedIds) => {
        const isSelected = !!selectedIds?.has(id);
        if (setExternalSelectedId) {
          setExternalSelectedId(id, !isSelected);
        } else {
          // NOTE: Create a new distinctive set: there definitely will be a change
          selectedIds = new Set(selectedIds);
          if (isSelected) {
            selectedIds.delete(id);
          } else {
            selectedIds.add(id);
          }
        }
        return selectedIds;
      });
    },
    [setExternalSelectedId],
  );

  const isReady = isOuterReady && isComparatorReady;

  const getItemComparedValues = React.useCallback(
    (it: T): TItemComparedValues => {
      const overall = overallComparedCache?.get(it);
      const overallCount = overall?.count || 0;
      const overallValue = overall?.value || 0;
      const overallTotal = overall?.total || 0;
      let value = overallValue;
      if (compareTargetId) {
        const compareTarget = itemsMap.get(compareTargetId);
        if (compareTarget) {
          value = getComparedValue(compareTarget, it) || 0;
        }
      }
      const diam = compareMax - compareMin;
      const normalized = !value ? 0 : diam ? overallValue + (value - compareMin) / diam / 2 : 1;
      return {
        normalized,
        value,
        overallValue,
        overallCount,
        overallTotal,
      } satisfies TItemComparedValues;
    },
    [compareTargetId, getComparedValue, itemsMap, overallComparedCache, compareMin, compareMax],
  );
  memo.getItemComparedValues = getItemComparedValues;

  const RenderEditorItem = React.useCallback(
    ({ _idx, item: it, isOverlay }: { _idx?: number; item: T; isOverlay?: boolean }) => {
      const {
        addedIds,
        updatedIds,
        freshIds,
        reorderedIds,
        selectedIds,
        compareTargetId,
        getItemComparedValues,
      } = memo;
      if (!getItemComparedValues) {
        return null;
      }
      const { id } = it;
      const { normalized, value, overallValue, overallCount, overallTotal } =
        getItemComparedValues(it);
      return (
        <HeadlessEditorItem
          className={cn(
            isDev && '__HeadlessEditor_Item', // DEBUG
          )}
          _idx={_idx} // DEBUG: Show idx to debug ordering, optional
          // Lifecylcle control...
          isReady={isReady}
          isOverlay={isOverlay}
          // Display in a narrow layout
          forceCompact={compact}
          // Items interface...
          item={it}
          RenderItem={RenderItem}
          updateItem={handleUpdate}
          handleCheck={handleCheck}
          handleCompareTargetId={handleCompareTargetId}
          // Item state...
          isUpdated={updatedIds?.has(id)}
          isAdded={addedIds?.has(id)}
          isFresh={freshIds?.has(id)}
          isReordered={reorderedIds?.has(id)}
          isSelected={selectedIds?.has(id)}
          compareTargetId={compareTargetId}
          // Other derived props
          normalized={normalized}
          value={value}
          overallValue={overallValue}
          overallCount={overallCount}
          overallTotal={overallTotal}
        />
      );
    },
    [
      // addedIds,
      // compareTargetId,
      // freshIds,
      // getItemComparedValues, // Use memo
      // reorderedIds,
      // selectedIds,
      // updatedIds,
      RenderItem,
      compact,
      handleCheck,
      handleCompareTargetId,
      handleUpdate,
      isReady,
      memo,
    ],
  );

  // Ordered items list...
  const [orderedItems, setOrderedItems] = React.useState<T[] | undefined>();

  // Propersly filtered data
  const filteredItems = React.useMemo(() => {
    let filteredItems = orderedItems;
    if (filterUpdated) {
      if (!updatedIds?.size) {
        return [];
      }
      filteredItems = filteredItems?.filter((it) => {
        return updatedIds.has(it.id);
      });
    }
    if (filterAdded) {
      if (!addedIds?.size) {
        return [];
      }
      filteredItems = filteredItems?.filter((it) => {
        return addedIds.has(it.id);
      });
    }
    if (filterSelected) {
      if (!selectedIds?.size) {
        return [];
      }
      filteredItems = filteredItems?.filter((it) => {
        return selectedIds.has(it.id);
      });
    }
    if (filterTargeted) {
      const compareTarget = compareTargetId ? itemsMap.get(compareTargetId) : undefined;
      filteredItems = filteredItems?.filter((it) => {
        let value: number | undefined | null;
        if (compareTarget) {
          value = getComparedValue(compareTarget, it);
        } else {
          const overall = overallComparedCache?.get(it);
          value = overall?.value;
        }
        return value && value >= minCmpValue;
      });
    }
    return filteredItems;
  }, [
    addedIds,
    compareTargetId,
    filterAdded,
    filterSelected,
    filterTargeted,
    filterUpdated,
    getComparedValue,
    itemsMap,
    orderedItems,
    overallComparedCache,
    selectedIds,
    updatedIds,
  ]);

  // A ref for the bottommost element, required for scroll to the bottom on new items adding, see an effect below
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Effect: Sort items and initiate animation of newly added (fresh) items...
  React.useEffect(() => {
    const newItems = [...items];
    // Sort items according to order properties...
    newItems.sort(compareByOrder);
    setOrderedItems((oldItems) => {
      // Find newly added (fresh) items...
      let freshIdsSet: Set<TCmpItemId> | undefined;
      if (oldItems) {
        // Compare new and old (if existed)...
        const oldIdsSet = new Set(oldItems.map(({ id }) => id));
        const newIdsSet = new Set(newItems.map(({ id }) => id));
        freshIdsSet = newIdsSet.difference(oldIdsSet);
      } else {
        // Or find "new" items from the inital set...
        freshIdsSet = new Set(
          newItems
            .filter(({ id, isNew }) => isNew || String(id).startsWith('__new'))
            .map(({ id }) => id),
        );
      }
      // ...And animate them, if found...
      if (freshIdsSet?.size) {
        addFreshIds(freshIdsSet);
        const handler = setTimeout(() => {
          removeFreshIds(freshIdsSet);
          memo.freshHandlers.delete(handler);
        }, freshEffectTimeout + 100);
        memo.freshHandlers.add(handler);
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
      return newItems;
    });
  }, [memo, bottomRef, items, addFreshIds, removeFreshIds]);

  // Clear all hanged tiemout handlers on unmount
  React.useEffect(() => {
    return () => {
      memo.freshHandlers.keys().forEach((handler) => {
        clearTimeout(handler);
        memo.freshHandlers.delete(handler);
      });
    };
  }, [memo]);

  const changeItemsOrder = React.useCallback(
    (moveId: TCmpItemId, overId: TCmpItemId) => {
      if (changeExternalItemsOrder) {
        return changeExternalItemsOrder(moveId, overId);
      }

      if (!orderedItems) return;

      const list = [...orderedItems];
      const oldIndex = list.findIndex((i) => i.id === moveId);
      const newIndex = list.findIndex((i) => i.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Remove & insert
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);

      const start = Math.min(oldIndex, newIndex);
      const end = Math.max(oldIndex, newIndex);

      const updatedItems: T[] = [];

      const reOrderedItems = list.map((item, idx) => {
        const no = idx + 1;
        if ((idx >= start && idx <= end) || (idx < start && item.order !== no)) {
          const updated = { ...item, order: no };
          updatedItems.push(updated);
          return updated;
        }
        return item;
      });

      if (updateReordered) updateReordered(updatedItems);
      else addReorderedIds(updatedItems.map(({ id }) => id));

      setOrderedItems(reOrderedItems);
    },
    [changeExternalItemsOrder, orderedItems, updateReordered, addReorderedIds],
  );

  return (
    <SortableWrapper
      // isPending={isPending}
      items={filteredItems || []}
      RenderItem={RenderEditorItem}
      changeItemsOrder={changeItemsOrder}
    >
      <div
        className={cn(
          isDev && '__HeadlessEditor', // DEBUG
          'content-truncate flex flex-col gap-2',
          'px-6',
          // 'py-3', // NOTE: It may be required to have a vertical space if we use a bounce animation for frehly added items
          className,
        )}
      >
        {/* Render skeletons or real items */}
        {!isReady || !filteredItems ? (
          generateArray(items.length || 5).map((idx) => (
            <Skeleton key={idx} className="h-8 w-full" />
          ))
        ) : !filteredItems?.length ? (
          <div className="rounded border border-dashed p-6 text-center text-sm opacity-30">
            No items to display
          </div>
        ) : (
          filteredItems?.map((it, idx) => {
            return <RenderEditorItem _idx={idx + 1} key={it.id} item={it} />;
          })
        )}
        {/* The bottommost element, required for scroll to the bottom on new items adding */}
        <div className="h-0 w-full" ref={bottomRef} />
        {__showDebug && (
          <HeadlessEditorDebug
            className={cn(
              isDev && '__HeadlessEditor_DEBUG', // DEBUG
            )}
            itemsCount={items.length}
            compareMin={compareMin}
            compareMax={compareMax}
            compareTargetId={compareTargetId}
          />
        )}
      </div>
    </SortableWrapper>
  );
}
