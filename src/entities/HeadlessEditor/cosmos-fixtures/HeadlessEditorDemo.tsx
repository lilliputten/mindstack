import React from 'react';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Textarea } from '@/components/ui/Textarea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { TNewOrOldQuestion } from '@/features/questions/types';

import { HeadlessEditor, TRenderItemProps } from '../HeadlessEditor';
import { TCmpItemId } from '../types';

const topicId = 'test-topic';

type T = TNewOrOldQuestion;

const demoItems: T[] = [
  {
    id: '__spec1',
    topicId,
    text: 'Specific question',
  },
  {
    id: '__spec2',
    topicId,
    text: 'following accurately describes the flow',
  },
  {
    id: '__new1',
    isNew: true,
    topicId,
    text: 'Following accurately describes',
  },
  {
    id: '__new2',
    isNew: true,
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop',
  },
  {
    id: 'old1',
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop, considering both microtasks and macrotasks?',
    answers: [
      {
        text: 'Microtasks are executed before macrotasks.',
        explanation:
          'This statement is true because microtasks, such as those from Promises and setImmediate, are processed first within each cycle of the event loop before macrotasks, such as setTimeout and I/O operations.',
        isCorrect: true,
      },
      {
        text: 'Macrotasks are always executed before microtasks.',
        explanation:
          'This statement is false because microtasks are processed before macrotasks in each event loop cycle.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'old2',
    topicId,
    text: 'Second comparsion cluster',
  },
  {
    id: '__new3',
    topicId,
    text: 'Another comparsion cluster',
  },
];

function RenderItem(props: TRenderItemProps<T>) {
  const { className, item, updateItem } = props;
  const {
    id, // Required unique id
    text = '', // "Question markdown text",
    _count,
    answers,
  } = item;

  const t = useT();

  const count = answers?.length || _count?.answers;

  // const [editMode, setEditMode] = React.useState(false);
  const [editText, setEditText] = React.useState<string | undefined>();
  const isEditMode = editText != undefined;
  const isEdited = isEditMode && editText !== text;

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const menuItems = React.useMemo(() => {
    return [
      /* // TODO: There will be a context menu
       * !isEditMode && (
       *   <Button
       *     className="content-truncate flex items-center justify-start gap-2"
       *     variant="theme"
       *     onClick={() => {
       *       setDropdownOpen(false);
       *       setEditMode(true);
       *     }}
       *   >
       *     <Icons.Edit className="size-3 shrink-0" />
       *     <span className="truncate">{t('Edit')}</span>
       *   </Button>
       * ),
       */
    ].filter(Boolean);
  }, []);

  return (
    <div
      data-item-id={id}
      data-testid="__RenderItem"
      className={cn(
        isDev && '__RenderItem', // DEBUG
        // 'content-truncate',
        'relative flex w-full items-start gap-2 text-left',
        className,
      )}
    >
      {/* // An item bullet dot sample
      <div
        className={cn(
          'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full',
          'bg-theme-500/50 opacity-20',
        )}
      >
        <Icon className="size-3 text-white" />
      </div>
      */}
      <div
        className={cn(
          isDev && '__RenderItem_Content', // DEBUG
          'relative flex flex-1 flex-col gap-4 text-left',
        )}
      >
        {isEditMode ? (
          <Textarea
            placeholder="Edit text"
            value={editText}
            onChange={(ev) => {
              const { target } = ev;
              const value = target.value || '';
              setEditText(value);
            }}
            className={cn(
              isDev && '__RenderItem_ContentInput', // DEBUG
              'h-32 w-full',
            )}
          />
        ) : (
          <MarkdownText
            className={cn(
              isDev && '__RenderItem_Text', // DEBUG
              'content-truncate',
              'w-full',
            )}
          >
            {text}
          </MarkdownText>
        )}
      </div>
      {!isEditMode && (
        <div
          className={cn(
            isDev && '__RenderItem_Info', // DEBUG
            'mt-1.5',
            'flex h-4 w-8 shrink-0 items-center justify-center rounded-md',
            'bg-theme-500/50 text-xs text-white opacity-50',
          )}
        >
          {count ? <span className="truncate">{count}</span> : <Icons.Dot className="size-3" />}
        </div>
      )}
      <div
        className={cn(
          isDev && '__RenderItem_Extra', // DEBUG
          'flex shrink-0 items-center justify-center gap-1',
        )}
      >
        {!!updateItem && !isEditMode && (
          <Button
            className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
            variant="ghost"
            title={t('Edit')}
            onClick={() => setEditText(text)}
          >
            <Icons.Edit className="size-3.5 shrink-0" />
          </Button>
        )}
        {isEditMode && (
          <Button
            className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
            variant={isEdited ? 'success' : 'ghost'}
            title={t('Save')}
            disabled={!isEdited}
            onClick={() => {
              // Update an item with the new text...
              if (updateItem) {
                const newItem: T = { ...item, text: editText || '' };
                updateItem(newItem);
              }
              setEditText(undefined);
            }}
          >
            <Icons.Save className="size-4 shrink-0" />
          </Button>
        )}
        {isEditMode && (
          <Button
            className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
            variant="ghost"
            title={t('CancelEditing')}
            onClick={() => setEditText(undefined)}
          >
            <Icons.X className="size-4 shrink-0" />
          </Button>
        )}
        {!!menuItems.length && (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            {(() => {
              return (
                <DropdownMenuTrigger
                  asChild
                  aria-label="Show Menu"
                  className={cn(
                    isDev && '__AllowedUsersPage_DropdownMenuTrigger', // DEBUG
                  )}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    title={t('ShowMenu')}
                    className={cn(
                      isDev && '__AllowedUsersPage_DropdownMenuToggle', // DEBUG
                      'size-6 p-0',
                      'active:bg-theme active:text-theme-foreground',
                      'ring-offset-background',
                      // 'focus:ring-1',
                      // 'focus:ring-ring',
                      // 'focus:ring-offset-2',
                      'data-[state=open]:bg-theme/20',
                      'data-[state=open]:ring-1',
                      // 'data-[state=open]:ring-offset-2',
                      'data-[state=open]:ring-theme/50',
                    )}
                  >
                    <Icons.MenuVertical className="size-4 transition-all" />
                    <span className="sr-only">{t('ShowMenu')}</span>
                  </Button>
                </DropdownMenuTrigger>
              );
            })()}
            <DropdownMenuContent
              align="end"
              className={cn(
                isDev && '__DashboardActions_DropdownMenuContent', // DEBUG
                'mt-2 rounded-lg bg-popover',
                'flex w-full flex-col gap-1',
              )}
            >
              {menuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

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

// const HeadlessEditor = HeadlessEditorFactory<T>();

export function HeadlessEditorDemo(props: TProps) {
  const {
    className,
    // Locale for comparator
    locale = 'en',
    // Compare using ngrams for large texts or with just tokens otherwise
    largeTexts = false,
  } = props;

  const [items, setItems] = React.useState(() => demoItems);

  const updateItem = React.useCallback((it: T) => {
    setItems((items) => {
      const { id } = it;
      return items.map((old) => (old.id === id ? it : old));
    });
  }, []);

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
          RenderItem={RenderItem}
          updateItem={updateItem}
          // State...
          selectedIds={selectedIds}
          setSelectedId={setSelectedId}
          compareTargetId={compareTargetId}
          setCompareTargetId={setCompareTargetId}
        />
      </ScrollArea>
    </div>
  );
}
