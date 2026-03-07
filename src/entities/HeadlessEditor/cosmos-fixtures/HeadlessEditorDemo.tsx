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

  const [onlyTargeted, setOnlyTargeted] = React.useState(false);

  const [items, setItems] = React.useState(() => demoQuestions);
  const [updatedIds, setUpdatedIds] = React.useState<Set<TCmpItemId>>(new Set());

  const updateItems = React.useCallback(
    (its: T[]) => {
      const newIds = new Map(its.map((item) => [item.id, item]));
      const newUpdatedIds = new Set([...updatedIds, ...newIds.keys()]);
      setUpdatedIds(newUpdatedIds);
      setItems((items) => {
        // const { id } = it;
        return items.map((old) => newIds.get(old.id) ?? old);
      });
    },
    [updatedIds],
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

  const selectedCount = selectedIds?.size || 0;

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
          'flex gap-2 px-6',
        )}
      >
        <Button
          onClick={() => setCompareTargetId(undefined)}
          className="content-truncate flex items-center gap-2"
          disabled={!compareTargetId}
        >
          <Icons.Crosshair className="size-5 shrink-0" />
          <span className="truncate">Clear compare target</span>
        </Button>
        <Button
          onClick={() => setOnlyTargeted((onlyTargeted) => !onlyTargeted)}
          className="content-truncate flex items-center gap-2"
          disabled={!compareTargetId}
        >
          <Icons.Target className="size-5 shrink-0" />
          <span className="truncate">Show only targeted</span>
        </Button>
        <Button
          onClick={() => setSelectedIds(new Set(items.map(({ id }) => id)))}
          className="content-truncate flex items-center gap-2"
          disabled={selectedCount === items.length}
        >
          <Icons.CircleCheck className="size-5 shrink-0" />
          <span className="truncate">Select all</span>
        </Button>
        <Button
          onClick={() => setSelectedIds(undefined)}
          className="content-truncate flex items-center gap-2"
          disabled={!selectedCount}
        >
          <Icons.CircleDashed className="size-5 shrink-0" />
          <span className="truncate">Select none</span>
        </Button>
        <Button
          onClick={() => {
            setItems((items) => items.filter(({ id }) => !selectedIds?.has(id)));
            // Update all other saved indices
            setSelectedIds(undefined);
          }}
          className="content-truncate flex items-center gap-2"
          disabled={!selectedCount}
        >
          <Icons.Trash className="size-5 shrink-0" />
          <span className="truncate">Delete selected</span>
        </Button>
      </div>
      <ScrollArea
        className={cn(
          isDev && '__HeadlessEditorDemo_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          // 'bg-theme-500/5',
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
          // Items...
          items={items}
          getItemText={getItemText}
          RenderItem={CmpQuestion}
          // updateItem={updateItem}
          updateItems={updateItems}
          // State...
          updatedIds={updatedIds}
          selectedIds={selectedIds}
          setSelectedId={setSelectedId}
          compareTargetId={compareTargetId}
          setCompareTargetId={setCompareTargetId}
          onlyTargeted={onlyTargeted}
        />
      </ScrollArea>
    </div>
  );
}
