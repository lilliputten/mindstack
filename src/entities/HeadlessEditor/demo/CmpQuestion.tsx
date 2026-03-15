import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Textarea } from '@/components/ui/Textarea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { TCmpItemProps } from '../types';
import { T } from './types';

export function CmpQuestion(props: TCmpItemProps<T>) {
  const {
    className,
    item,
    updateItem,
    // hasChanges,
  } = props;
  const {
    id, // Required an unique id
    text = '', // Question markdown text
    _count,
    answers,
  } = item;

  const t = useT();

  const count = answers?.length || _count?.answers;

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
        'relative flex w-full items-start gap-2 text-left',
        // hasChanges && 'border border-red-500', // DEBUG
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
          'content-truncate relative flex flex-1 flex-col gap-4 text-left',
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
      <div
        className={cn(
          isDev && '__RenderItem_Extra', // DEBUG
          'flex shrink-0 items-center justify-center gap-1 max-xs:flex-col',
        )}
      >
        {!!count && (
          <div
            className={cn(
              isDev && '__RenderItem_Count', // DEBUG
              'flex h-6 min-w-8 shrink-0 items-center justify-center rounded-md px-2',
              'bg-theme-500/10 text-xs text-white opacity-50',
            )}
            title={t('AnswersCount')}
          >
            <span className="truncate">{count}</span>
          </div>
        )}
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
                      'data-[state=open]:bg-theme/20',
                      'data-[state=open]:ring-1',
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
