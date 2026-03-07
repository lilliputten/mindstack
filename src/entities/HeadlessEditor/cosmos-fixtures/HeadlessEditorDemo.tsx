import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { HeadlessEditor } from '../HeadlessEditor';
import { TCmpItemId } from '../types';
import { CmpQuestion } from './CmpQuestion';
import { demoQuestions } from './demoQuestions';
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

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);

  const [items, setItems] = React.useState(() => demoQuestions);
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId> | undefined>();
  const [reorderedIds, setReorderedIds] = React.useState<Set<TCmpItemId> | undefined>();

  const updateItems = React.useCallback(
    (its: T[]) => {
      const newIdsMap = new Map(its.map((item) => [item.id, item]));
      const initialLst = updatedIds ? [...updatedIds] : [];
      const newUpdatedIds = new Set([...initialLst, ...newIdsMap.keys()]);
      setUpdatedIds(newUpdatedIds);
      setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
    },
    [updatedIds],
  );

  const updateReordered = React.useCallback(
    (its: T[]) => {
      const newIdsMap = new Map(its.map((item) => [item.id, item]));
      const initialLst = reorderedIds ? [...reorderedIds] : [];
      const newReorderedIds = new Set([...initialLst, ...newIdsMap.keys()]);
      setReorderedIds(newReorderedIds);
      setItems((items) => items.map((old) => newIdsMap.get(old.id) ?? old));
    },
    [reorderedIds],
  );

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

  // Effect: Remove orphan ids...
  React.useEffect(() => {
    const existedKeys = new Set<TCmpItemId>(items.map(({ id }) => id));
    setCompareTargetId((id) => {
      return id && existedKeys.has(id) ? id : undefined;
    });
    const hasId = (id: TCmpItemId) => existedKeys.has(id);
    const hasIdsSet = (ids?: Set<TCmpItemId>) => ids && new Set(ids.keys().filter(hasId));
    setSelectedIds(hasIdsSet);
    setUpdatedIds(hasIdsSet);
    setReorderedIds(hasIdsSet);
  }, [items]);

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
        variant={filterTargeted ? 'secondary' : 'outline'}
      >
        <Icons.Target className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Show compared</span>
      </Button>,
      <Button
        key="ShowUpdated"
        onClick={() => setFilterUpdated((filterUpdated) => !filterUpdated)}
        className="content-truncate flex items-center gap-2"
        variant={filterUpdated ? 'secondary' : 'outline'}
      >
        <Icons.CircleAlert className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Show updated</span>
      </Button>,
      <Button
        key="ShowSelected"
        onClick={() => setFilterSelected((filterSelected) => !filterSelected)}
        className="content-truncate flex items-center gap-2"
        variant={filterSelected ? 'secondary' : 'outline'}
      >
        <Icons.CircleCheck className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Show selected</span>
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
        key="DeleteSelected"
        onClick={() => {
          setItems((items) => items.filter(({ id }) => !selectedIds?.has(id)));
        }}
        className="content-truncate flex items-center gap-2"
        variant={selectedCount ? 'destructive' : 'ghost'}
        disabled={!selectedCount}
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Delete selected</span>
      </Button>,
    ],
    [
      compareTargetId,
      filterSelected,
      filterTargeted,
      filterUpdated,
      items,
      selectedCount,
      selectedIds,
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
          filterSelected={filterSelected}
          // Items...
          items={items}
          getItemText={getItemText}
          RenderItem={CmpQuestion}
          updateItems={updateItems}
          updateReordered={updateReordered}
          // State...
          updatedIds={updatedIds}
          reorderedIds={reorderedIds}
          selectedIds={selectedIds}
          setSelectedId={setSelectedId}
          compareTargetId={compareTargetId}
          setCompareTargetId={setCompareTargetId}
        />
      </ScrollArea>
    </div>
  );
}
