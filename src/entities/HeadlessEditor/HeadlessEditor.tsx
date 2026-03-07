'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { TLocale } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { SortableWrapper } from '@/components/sortable';
import { isDev } from '@/config';

import { HeadlessEditorItem } from './HeadlessEditorItem';
import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';
import { useComparator } from './useComparator';

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
  onlyTargeted?: boolean;

  // Items interface...
  items: T[];
  getItemText: (item: T) => string;
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  // updateItem?: (it: T) => void;
  updateItems?: (its: T[]) => void;

  // Items state...
  updatedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  setSelectedId?: (id: TCmpItemId, selected: boolean) => void;
  compareTargetId?: TCmpItemId;
  setCompareTargetId?: (id?: TCmpItemId) => void;
  changeItemsOrder?: (moveId: TCmpItemId, overId: TCmpItemId) => void;
}

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

/**
 * Comparator function for sorting by 'order', with these rules:
 * - Items with defined numeric 'order' come first (ascending).
 * - Items without 'order' come after, maintaining their original relative order.
 */
export function compareByOrder<T extends TCmpItemBase>(a: T, b: T): number {
  const aHasOrder = typeof a.order === 'number';
  const bHasOrder = typeof b.order === 'number';

  if (aHasOrder && bHasOrder) {
    return a.order! - b.order!;
  }
  if (aHasOrder) {
    return -1; // a comes before b
  }
  if (bHasOrder) {
    return 1; // b comes before a
  }
  return 0; // maintain original relative order
}

export function HeadlessEditor<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const {
    className,
    isReady: isOuterReady,
    // Options...
    locale,
    largeTexts,
    compact,
    onlyTargeted,
    // Items...
    items,
    getItemText,
    RenderItem,
    updateItems,
    // State...
    updatedIds: externalUpdatedIds,
    selectedIds: externalSelectedIds,
    setSelectedId: setExternalSelectedId,
    compareTargetId: externalCompareTargetId,
    setCompareTargetId: setExternalCompareTargetId,
    changeItemsOrder: changeExternalItemsOrder,
  } = props;

  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>(
    externalUpdatedIds,
  );
  React.useEffect(() => {
    setUpdatedIds(externalUpdatedIds);
  }, [externalUpdatedIds]);

  const addUpdatedIds = React.useCallback((ids: TCmpItemId[]) => {
    setUpdatedIds((updatedIds) => {
      const initial = updatedIds ? [...updatedIds] : [];
      const newIds = new Set(initial.concat(ids));
      return newIds;
    });
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
  // Effect: Update from external ids set
  React.useEffect(() => {
    setSelectedIds(externalSelectedIds);
  }, [externalSelectedIds]);

  // State: Local selected target id
  const [compareTargetId, setCompareTargetId] = React.useState<TCmpItemId | undefined>(
    externalCompareTargetId,
  );
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
    (it: T) => {
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
      return { normalized, value, overallValue, overallCount, overallTotal };
    },
    [compareTargetId, getComparedValue, itemsMap, overallComparedCache, compareMin, compareMax],
  );

  const RenderEditorItem = React.useCallback(
    ({ _idx, item: it, isOverlay }: { _idx?: number; item: T; isOverlay?: boolean }) => {
      const { normalized, value, overallValue, overallCount, overallTotal } =
        getItemComparedValues(it);
      return (
        <HeadlessEditorItem
          className={cn(
            isDev && '__HeadlessEditor_Item', // DEBUG
          )}
          _idx={_idx}
          // Lifecylcle control...
          isReady={isReady}
          isOverlay={isOverlay}
          // Display in narrow layout
          compact={compact}
          // Items interface...
          item={it}
          RenderItem={RenderItem}
          updateItem={handleUpdate}
          handleCheck={handleCheck}
          handleCompareTargetId={handleCompareTargetId}
          // Items state...
          updatedIds={updatedIds}
          selectedIds={selectedIds}
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
      RenderItem,
      compact,
      compareTargetId,
      getItemComparedValues,
      handleCheck,
      handleCompareTargetId,
      isReady,
      selectedIds,
      handleUpdate,
      updatedIds,
    ],
  );

  // Ordered items list...
  const [orderedItems, setOrderedItems] = React.useState<T[] | undefined>();
  const displayingItems = React.useMemo(() => {
    if (!compareTargetId || !onlyTargeted) {
      return orderedItems;
    }
    const compareTarget = itemsMap.get(compareTargetId);
    if (!compareTarget) {
      return orderedItems;
    }
    return orderedItems?.filter((it) => {
      const value = getComparedValue(compareTarget, it);
      return value && value >= 0.01;
    });
  }, [compareTargetId, onlyTargeted, orderedItems, itemsMap, getComparedValue]);
  console.log('XXX', {
    displayingItems,
    orderedItems,
  });
  React.useEffect(() => {
    const orderedItems = [...items];
    orderedItems.sort(compareByOrder);
    setOrderedItems(orderedItems);
  }, [items]);

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

      if (updateItems) updateItems(updatedItems);
      else addUpdatedIds(updatedItems.map(({ id }) => id));

      setOrderedItems(reOrderedItems);
    },
    [changeExternalItemsOrder, orderedItems, updateItems, addUpdatedIds],
  );

  const itemsCount = items.length;

  const renderedItems = React.useMemo(() => {
    if (!isReady || !displayingItems) {
      return generateArray(itemsCount || 5).map((idx) => (
        <Skeleton key={idx} className="h-9 w-full" />
      ));
    }
    return displayingItems.map((it, idx) => {
      return <RenderEditorItem _idx={idx + 1} key={it.id} item={it} />;
    });
  }, [isReady, RenderEditorItem, displayingItems, itemsCount]);

  return (
    <SortableWrapper
      // isPending={isPending}
      items={displayingItems || []}
      RenderItem={RenderEditorItem}
      changeItemsOrder={changeItemsOrder}
    >
      <div
        className={cn(
          isDev && '__HeadlessEditor', // DEBUG
          'content-truncate flex flex-col gap-2',
          'px-6',
          className,
        )}
      >
        {renderedItems}
        {isDev /* DEBUG */ && (
          <div
            className={cn(
              isDev && '__HeadlessEditor_DEBUG', // DEBUG
              'flex flex-wrap gap-2 text-sm opacity-50',
            )}
          >
            <span className="font-bold">DEBUG:</span>
            <span>
              <span className="opacity-50">count:</span> {items.length}
            </span>
            <span>
              <span className="opacity-50">compareMin:</span> {compareMin.toFixed(2)}
            </span>
            <span>
              <span className="opacity-50">compareMax:</span> {compareMax.toFixed(2)}
            </span>
            {!!compareTargetId && (
              <span>
                <span className="opacity-50">compareTargetId:</span> {compareTargetId}
              </span>
            )}
          </div>
        )}
      </div>
    </SortableWrapper>
  );
}
