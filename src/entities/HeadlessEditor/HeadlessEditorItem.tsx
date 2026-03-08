'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Checkbox } from '@/components/ui/Checkbox';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { freshEffectTimeout, minCmpValue } from './constants';
import { TCmpItemBase, TCmpItemId, TCmpItemProps } from './types';

const _showComparedValues = isDev && false;
const _showOrder = isDev && false;

interface TProps<T extends TCmpItemBase> {
  className?: string;
  _idx?: number; // DEBUG: Show idx to debug ordering, optional

  // Lifecylcle control...
  isReady: boolean;
  isOverlay?: boolean;

  // Display in narrow layout
  forceCompact?: boolean;

  // Item interface...
  item: T;
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  updateItem?: (it: T) => void;
  handleCheck?: (id: T['id']) => void;
  handleCompareTargetId?: (id: T['id']) => void;

  // Item state...
  isUpdated?: boolean;
  isAdded?: boolean;
  isFresh?: boolean;
  isReordered?: boolean;
  isSelected?: boolean;
  compareTargetId?: TCmpItemId;

  // Other derived props
  normalized: number;
  value: number;
  overallValue: number;
  overallCount: number;
  overallTotal: number;
}

export function HeadlessEditorItem<T extends TCmpItemBase>(props: TProps<T>) {
  const {
    className,
    _idx,
    // Lifecylcle control...
    isReady,
    isOverlay,
    // Display in narrow layout
    forceCompact,
    // Item interface...
    item: it,
    RenderItem,
    updateItem,
    handleCheck,
    handleCompareTargetId,
    // Item state...
    isUpdated,
    isAdded,
    isFresh,
    isReordered,
    isSelected,
    compareTargetId,
    // Other derived props
    normalized,
    value,
    overallValue,
    overallCount,
    overallTotal,
  } = props;

  const { id } = it;

  const t = useT();

  const {
    // Draggable support...
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const isCompareTarget = compareTargetId && compareTargetId === id;
  const hasOverallValue = overallValue >= minCmpValue;
  const hasValue = value >= minCmpValue;
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

  const indicateFreshItemBackgroundOpacity = isAdded ? 10 : 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        isDev && '__HeadlessEditorItem', // DEBUG
        'content-truncate flex items-start gap-2 p-1',
        'rounded',
        'transition',
        'border border-transparent',
        // Adaptive or forced compact mode...
        'max-xs:flex-col',
        forceCompact && 'flex-col',
        isUpdated && 'border-dashed border-theme-500/40',
        isAdded && 'border-dashed border-green-600/50',
        isUpdated && 'bg-background/25',
        isAdded && 'bg-theme/10',
        isFresh && 'indicate-fresh-item',
        isDragging && 'opacity-20',
        isOverlay && 'bg-theme-500/50 ring-2',
        className,
      )}
      style={
        {
          transform: /* isDragging ? */ CSS.Translate.toString(transform),
          transition,
          // NOTE: Set parameters for newly added (fresh) item animation. TODO: Extract to the tailwind configuration?
          '--indicate-fresh-item-duration': `${freshEffectTimeout}ms`,
          '--indicate-fresh-item-background-opacity': `${indicateFreshItemBackgroundOpacity}%`, // Corresponding default `isAdded` background transparency, 10, see above
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          isDev && '__HeadlessEditorItem_Controllers', // DEBUG
          'flex shrink-0 items-center gap-2 text-sm',
          'min-h-6',
        )}
        // title="Click to toggle the item comparison mode only with similar items"
      >
        {_showOrder && (it.order != undefined || _idx != undefined) && (
          <span className="text-sm font-thin opacity-30">
            {[_idx != undefined ? `[${_idx}]` : undefined, it.order].filter(Boolean).join(' ')}
          </span>
        )}
        <span
          className={cn(
            isDev && '__DragHandle', // DEBUG
            'opacity-50',
            'transition-all',
            'hover:opacity-100',
            'text-foreground/20',
            isReordered && 'text-theme-500',
          )}
          {...attributes}
          {...listeners}
          title={t('Drag item to reorder')}
        >
          <Icons.GripVertical className="size-4 shrink-0" />
        </span>
        {false || !isReady ? (
          <>
            {!!handleCheck && <Skeleton className="size-4" />}
            <Skeleton className="size-4" />
            {_showComparedValues && <Skeleton className="h-4 w-24" />}
          </>
        ) : (
          <>
            {!!handleCheck && (
              <Checkbox
                checked={isSelected}
                aria-label={t('Select record')}
                title={t('Select Item')}
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  handleCheck(id);
                }}
              />
            )}
            <div
              aria-label={t('Comparsion indicator')}
              className={cn(
                isDev && '__HeadlessEditorItem_CompareIcon', // DEBUG
                'box-content size-2.5 shrink-0 rounded-full p-[2px] transition',
                'border border-theme-500/50 bg-background/50',
                !hasOverallValue && 'border-theme-500/10',
                !!compareTargetId && hasValue && 'border-red-500/100',
                isCompareTarget && 'animate-pulse border-dashed border-red-500',
                !!handleCompareTargetId &&
                  hasOverallValue &&
                  'cursor-pointer hover:ring-2 hover:ring-theme-500/50',
              )}
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (hasOverallValue && handleCompareTargetId) {
                  handleCompareTargetId(id);
                }
              }}
              title={infoTitle}
            >
              <div
                className={cn(
                  isDev && '__HeadlessEditorItem_CompareIcon', // DEBUG
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
      <RenderItem className="flex-1" key={id} item={it} updateItem={updateItem} />
    </div>
  );
}

/* // NOTE: It's possible to use memoized component verison
 * export const HeadlessEditorItem = React.memo(
 *   HeadlessEditorItemComponent,
 * ) as typeof HeadlessEditorItemComponent;
 */
