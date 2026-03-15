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

  /** DEBUG: Show idx to debug ordering, optional */
  _idx?: number;

  /// Lifecylcle control...

  isReady: boolean;
  isOverlay?: boolean;
  /** Does the owner editor component have unsaved data? */
  hasChanges?: boolean;

  /** Display in narrow layout */
  forceCompact?: boolean;
  /** Show normalized value */
  showNormalized?: boolean;

  /// Item interface...

  item: T;
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  updateItem?: (it: T) => void;
  toggleCheck?: (id: T['id']) => void;
  handleCompareTargetId?: (id: T['id']) => void;

  /// Item state...

  isUpdated?: boolean;
  isAdded?: boolean;
  isFresh?: boolean;
  isReordered?: boolean;
  isSelected?: boolean;
  compareTargetId?: TCmpItemId;

  /// Other derived props

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
    hasChanges,
    // Options...
    forceCompact,
    showNormalized,
    // Item interface...
    item: it,
    RenderItem,
    updateItem,
    toggleCheck,
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
  const showValue = showNormalized ? normalized : value;
  const infoStr = [
    // Combine all info values...
    // overallValue.toFixed(2),
    // value.toFixed(2),
    // normalized.toFixed(2),
    (showNormalized ? normalized : value).toFixed(2),
    overallCount ? `(${overallCount + 1})` : '',
    // overallTotal.toFixed(2),
  ]
    .filter(Boolean)
    .join(' ');
  const infoTitle = hasOverallValue
    ? t('Comparsion rate') + ': ' + infoStr
    : t('The element is not involved in the comparison');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        isDev && '__HeadlessEditorItem', // DEBUG
        'content-truncate flex items-start gap-2 p-1',
        'rounded',
        'relative',
        'transition',
        'border border-transparent',
        // Adaptive or forced compact mode...
        'max-xs:flex-col',
        'hover:bg-theme-500/5',
        forceCompact && 'flex-col',
        isUpdated && 'border-dashed border-theme-500/40 bg-theme/5 hover:bg-theme/10',
        isAdded && 'border-dashed border-green-600/50 bg-theme/5 hover:bg-theme/10',
        isDragging && 'pointer-events-none cursor-move border-theme-500/10',
        isOverlay && 'z-5 cursor-move border-dashed border-theme-500/50 opacity-50', // bg-theme-500/10 hover:bg-theme-500/10',
        className,
      )}
      style={
        {
          transform: CSS.Translate.toString(transform),
          transition,
        } as React.CSSProperties
      }
    >
      {isDragging && (
        <div
          className={cn(
            isDev && '__HeadlessEditorItem_SelectedBg', // DEBUG
            'absolute inset-0 bg-theme-500/10',
            'pointer-events-none z-[-1]',
          )}
        />
      )}
      {isSelected && (
        <div
          className={cn(
            isDev && '__HeadlessEditorItem_SelectedBg', // DEBUG
            'absolute inset-0 bg-theme-500/10',
            'pointer-events-none z-[-1]',
          )}
        />
      )}
      {isFresh && (
        <div
          className={cn(
            isDev && '__HeadlessEditorItem_IndicatorBg', // DEBUG
            'indicate-item absolute inset-0',
            'pointer-events-none z-[-1]',
          )}
          style={
            {
              // NOTE: Set parameters for newly added (fresh) item animation. TODO: Extract to the tailwind configuration?
              '--indicate-item-duration': `${freshEffectTimeout}ms`,
              '--indicate-item-background-color': isAdded
                ? 'rgba(var(--color-green-500-RGB) / 50%)'
                : 'rgba(var(--color-theme-500-RGB) / 40%)',
            } as React.CSSProperties
          }
        />
      )}
      <div
        className={cn(
          isDev && '__HeadlessEditorItem_Controllers', // DEBUG
          'flex shrink-0 items-center gap-2 text-sm',
          'min-h-6',
          'transition',
          // isDragging && 'opacity-0',
          isOverlay && 'opacity-20',
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
            isDev && '__HeadlessEditorItem_DragHandle', // DEBUG
            'opacity-50',
            'transition-all',
            'hover:opacity-100',
            'text-foreground/20',
            isOverlay && 'cursor-move',
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
            {!!toggleCheck && <Skeleton className="size-4" />}
            <Skeleton className="size-4" />
            {_showComparedValues && <Skeleton className="h-4 w-24" />}
          </>
        ) : (
          <>
            {!!toggleCheck && (
              <Checkbox
                checked={isSelected || false}
                aria-label={t('Select record')}
                title={t('Select Item')}
                className={cn(
                  isDev && '__HeadlessEditorItem_Checkbox', // DEBUG
                  'bg-background/20',
                )}
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  toggleCheck(id);
                }}
              />
            )}
            <div
              aria-label={t('Comparsion indicator')}
              className={cn(
                isDev && '__HeadlessEditorItem_CompareIcon', // DEBUG
                'box-content size-2.5 shrink-0 rounded-full p-[2px] transition',
                'border border-theme-500/50 bg-background/20',
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
                style={{ opacity: isCompareTarget ? 1 : showValue.toFixed(2) }}
              />
            </div>
            {_showComparedValues && (
              <div className="truncate font-thin opacity-30">[{infoStr}]</div>
            )}
          </>
        )}
      </div>
      <RenderItem
        className={cn(
          isDev && '__HeadlessEditorItem_RenderItem', // DEBUG
          'flex-1',
          'transition',
          // isDragging && 'opacity-0',
          isOverlay && 'opacity-20',
        )}
        key={id}
        item={it}
        updateItem={updateItem}
        hasChanges={hasChanges}
      />
    </div>
  );
}

/* // NOTE: It's possible to use memoized component verison
 * export const HeadlessEditorItem = React.memo(
 *   HeadlessEditorItemComponent,
 * ) as typeof HeadlessEditorItemComponent;
 */
