'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Checkbox } from '@/components/ui/Checkbox';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';

import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';
import { useComparator } from './useComparator';

const _showComparedValues = isDev && false;

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

  // Items interface...
  // Are comparator and other data ready?
  items: T[];
  getItemText: (item: T) => string;
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  updateItem?: (it: T) => void;

  // Items state...
  updatedIds?: Set<TCmpItemId>;
  // setUpdatedId?: (id: TCmpItemId) => void;
  selectedIds?: Set<TCmpItemId>;
  setSelectedId?: (id: TCmpItemId, selected: boolean) => void;
  compareTargetId?: TCmpItemId;
  setCompareTargetId?: (id?: TCmpItemId) => void;
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
    // Items...
    items,
    getItemText,
    RenderItem,
    updateItem,
    // State...
    updatedIds: externalUpdatedIds,
    // setUpdatedId: setExternalUpdatedId,
    selectedIds: externalSelectedIds,
    setSelectedId: setExternalSelectedId,
    compareTargetId: externalCompareTargetId,
    setCompareTargetId: setExternalCompareTargetId,
  } = props;

  const t = useT();

  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>(
    externalUpdatedIds,
  );

  const handleUpdate = React.useCallback(
    (it: T) => {
      setUpdatedIds((updatedIds) => {
        updatedIds = new Set(updatedIds);
        updatedIds.add(it.id);
        return updatedIds;
      });
      if (updateItem) updateItem(it);
    },
    [updateItem],
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

  const renderedItems = React.useMemo(() => {
    return items.map((it) => {
      const { id, isNew } = it;
      const isUpdated = updatedIds?.has(id);
      const { normalized, value, overallValue, overallCount, overallTotal } =
        getItemComparedValues(it);
      const isCompareTarget = compareTargetId && compareTargetId === id;
      const hasOverallValue = overallValue >= 0.01;
      const hasValue = value >= 0.01;
      const infoStr = [
        // Combine all info values...
        overallValue.toFixed(2),
        value.toFixed(2),
        normalized.toFixed(2),
        overallCount,
        overallTotal.toFixed(2),
      ].join(' ');
      const infoTitle = hasOverallValue
        ? t('Comparsion rate') + ': ' + infoStr
        : t('The element is not involved in the comparison');
      const hasSelected = selectedIds?.has(id);
      return (
        <div
          key={id}
          className={cn(
            isDev && '__HeadlessEditor_Item', // DEBUG
            'flex items-start gap-2',
            'content-truncate',
            'max-xs:flex-col',
            compact && 'flex-col',
            'mx-6 rounded px-2 py-1',
            'bg-theme-500/10',
            !isNew && 'bg-background/50',
            'border border-transparent',
            isUpdated && 'border border-dashed border-green-500/50',
          )}
        >
          <div
            className={cn(
              isDev && '__HeadlessEditor_ItemControllers', // DEBUG
              'flex shrink-0 items-center gap-2 text-sm',
              'min-h-6',
            )}
            // title="Click to toggle the item comparison mode only with similar items"
          >
            {false || !isReady ? (
              <>
                <Skeleton className="size-4" />
                <Skeleton className="size-4" />
                {_showComparedValues && <Skeleton className="h-4 w-24" />}
              </>
            ) : (
              <>
                <Checkbox
                  checked={hasSelected}
                  aria-label={t('Select record')}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    handleCheck(id);
                  }}
                />
                <div
                  aria-label={t('Comparsion indicator')}
                  className={cn(
                    isDev && '__HeadlessEditor_ItemCompareIcon', // DEBUG
                    'box-content size-2.5 shrink-0 rounded-full p-[2px] transition',
                    'border border-theme-500/50 bg-background',
                    !hasOverallValue && 'border-theme-500/10',
                    !!compareTargetId && hasValue && 'border-red-500/100',
                    isCompareTarget && 'animate-pulse border-dashed border-red-500',
                    hasOverallValue && 'cursor-pointer hover:ring-2 hover:ring-theme-500/50',
                  )}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (hasOverallValue) {
                      handleCompareTargetId(id);
                    }
                  }}
                  title={infoTitle}
                >
                  <div
                    className={cn(
                      isDev && '__HeadlessEditor_ItemCompareIcon', // DEBUG
                      'size-full rounded-full bg-red-500',
                      isCompareTarget && 'bg-red-500',
                    )}
                    style={{ opacity: isCompareTarget ? 1 : normalized.toFixed(2) }}
                  />
                </div>
                {_showComparedValues && (
                  <div className="truncate font-thin opacity-30">[{infoStr}]</div>
                )}
              </>
            )}
          </div>
          <RenderItem className="flex-1" key={id} item={it} updateItem={handleUpdate} />
        </div>
      );
    });
  }, [
    RenderItem,
    compact,
    compareTargetId,
    getItemComparedValues,
    handleCheck,
    handleCompareTargetId,
    isReady,
    items,
    selectedIds,
    t,
    handleUpdate,
    updatedIds,
  ]);

  return (
    <div
      className={cn(
        isDev && '__HeadlessEditor', // DEBUG
        'content-truncate flex flex-col gap-2',
        className,
      )}
    >
      {renderedItems}
      {isDev /* DEBUG */ && (
        <div
          className={cn(
            isDev && '__HeadlessEditor_DEBUG', // DEBUG
            'flex flex-wrap gap-2 px-6 text-sm opacity-50',
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
  );
}
