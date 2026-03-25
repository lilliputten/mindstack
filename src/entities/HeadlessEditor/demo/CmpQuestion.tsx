import React from 'react';
import { useFormatter } from 'next-intl';
import { FormState } from 'react-hook-form';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import * as Icons from '@/components/shared/Icons';
import { isDev, TRoutePath } from '@/config';
import { EditQuestionForm, TFormData } from '@/features/questions/components/EditQuestionForm';
import { useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { TCmpItemProps } from '../types';
import { T } from './types';

/** Show edit button in the actions block or (otherwise) in the dropdown menu */
const showEditAsAction = true;

export function CmpQuestion(props: TCmpItemProps<T>) {
  const { className, item, updateItem, hasChanges } = props;
  const {
    id, // Required an unique id
    text = '', // Question markdown text
    _count,
    answers,
    topicId,
  } = item;

  React.useEffect(() => {
    console.log('[CmpQuestion:DEBUG:item]', item);
  }, [item]);

  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();

  const t = useT();
  const format = useFormatter();

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${id}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  // const goBack = useGoBack(topicRoutePath);
  const goToTheRoute = useGoToTheRoute();

  const count = answers?.length || _count?.answers;

  // Item editing...
  // const [form, setForm] = React.useState<UseFormReturn<TFormData> | undefined>();
  const [isDirty, setIsDirty] = React.useState(false);
  // const [isValid, setIsValid] = React.useState(false);

  const setFormState = React.useCallback((formState: FormState<TFormData>) => {
    setIsDirty(formState.isDirty);
    // setIsValid(formState.isValid);
  }, []);

  const [viewInfo, setViewInfo] = React.useState(false);

  // Data editing support...
  const [editedItem, setEditedItem] = React.useState<T | undefined>();
  // const [editText, setEditText] = React.useState<string | undefined>();
  const isEditMode = editedItem != undefined;
  const isEdited = isEditMode && isDirty; // editText !== text;

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const confirmActionCallback = React.useCallback(
    (action: () => void) => {
      return () => {
        setDropdownOpen(false);
        if (hasChanges) {
          // Set the action for the dialog `handleConfirm` handler...
          setConfirmAction(() => action);
        } else {
          // ...or invoke it immediatelly...
          action();
        }
      };
    },
    [hasChanges],
  );
  const dropdownActionCallback = React.useCallback((action: () => void) => {
    return () => {
      setDropdownOpen(false);
      action();
    };
  }, []);
  const confirmGoToTheRouteCallback = React.useCallback(
    (route: string) => {
      return confirmActionCallback(() => goToTheRoute(route as TRoutePath));
    },
    [confirmActionCallback, goToTheRoute],
  );

  const handleFormSubmit = React.useCallback(
    (formData: TFormData) => {
      const editedItem: T = {
        ...item,
        // id: item.id,
        // topicId: item.topicId,
        // order: undefined,
        text: formData.text,
        extraQuery: formData.extraQuery,
        answersCountRandom: formData.answersCountRandom,
        answersCountMin: formData.answersCountMin,
        answersCountMax: formData.answersCountMax,
        isGenerated: formData.isGenerated,
      };
      setEditedItem(editedItem);
    },
    [item],
  );

  const actionItems = React.useMemo(() => {
    return [
      // Save
      isEditMode && (
        <Button
          key="Save"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant={isEdited ? 'success' : 'ghost'}
          title={t('Save')}
          disabled={!isEdited}
          onClick={() => {
            // Update an item with the new text...
            if (updateItem) {
              // const newItem: T = { ...item, text: editText || '' };
              updateItem(editedItem);
            }
            setEditedItem(undefined);
          }}
        >
          <Icons.Save className="size-4 shrink-0" />
        </Button>
      ),
      // Cancel editing
      isEditMode && (
        <Button
          key="CancelEditing"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant="ghost"
          title={t('CancelEditing')}
          onClick={() => setEditedItem(undefined)}
        >
          <Icons.X className="size-4 shrink-0" />
        </Button>
      ),
      !!count && (
        <div
          // TODO: Add a handler to expand answers section...
          key="Answers"
          className={cn(
            isDev && '__CmpQuestion_Count', // DEBUG
            'flex h-6 min-w-8 shrink-0 items-center justify-center rounded-md px-2',
            'bg-theme-500/10 text-xs text-white opacity-50',
          )}
          title={t('AnswersCount')}
        >
          <span className="truncate">{count}</span>
        </div>
      ),
      // Edit action
      !!updateItem && !isEditMode && showEditAsAction && (
        <Button
          key="Edit"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant="ghost"
          title={t('Edit')}
          onClick={() => setEditedItem(item)}
        >
          <Icons.Edit className="size-3.5 shrink-0" />
        </Button>
      ),
      // View question info
      <Button
        key="ViewInfo"
        className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
        variant={viewInfo ? 'theme' : 'ghost'}
        title={t('View Info')}
        onClick={() => setViewInfo((viewInfo) => !viewInfo)}
      >
        <Icons.Info className="size-3.5 shrink-0" />
      </Button>,
    ].filter(Boolean);
  }, [count, editedItem, viewInfo, isEditMode, isEdited, item, t, updateItem]);

  const menuItems = React.useMemo(() => {
    return [
      !!updateItem && !isEditMode && !showEditAsAction && (
        <Button
          key="Edit"
          className="content-truncate flex items-center justify-start gap-2"
          variant="ghost"
          onClick={dropdownActionCallback(() => setEditedItem(item))}
        >
          <Icons.Edit className="size-3.5 shrink-0" />
          <span className="truncate">{t('Edit')}</span>
        </Button>
      ),
      <Button
        key="GoToTheQuestion"
        className="content-truncate flex items-center justify-start gap-2"
        variant="ghost"
        onClick={confirmGoToTheRouteCallback(questionRoutePath)}
      >
        <Icons.ChevronRight className="size-3 shrink-0" />
        <span className="truncate">{t('GoToTheQuestion')}</span>
      </Button>,
    ].filter(Boolean);
  }, [
    updateItem,
    isEditMode,
    dropdownActionCallback,
    t,
    confirmGoToTheRouteCallback,
    questionRoutePath,
    item,
  ]);

  return (
    <div
      data-item-id={id}
      data-testid="__CmpQuestion"
      className={cn(
        isDev && '__CmpQuestion', // DEBUG
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
          isDev && '__CmpQuestion_Content', // DEBUG
          'content-truncate relative flex flex-1 flex-col gap-4 rounded-md text-left',
        )}
      >
        {isEditMode ? (
          <EditQuestionForm
            className={cn(
              isDev && '__CmpQuestion_Form', // DEBUG
            )}
            fieldsClassName="p-1"
            question={item}
            // setForm={setForm}
            setFormState={setFormState}
            handleFormSubmit={handleFormSubmit}
            // noSections
            // isPending={isPending}
          />
        ) : (
          <MarkdownText
            className={cn(
              isDev && '__CmpQuestion_Text', // DEBUG
              'content-truncate w-full',
            )}
          >
            {text}
          </MarkdownText>
        )}
        {viewInfo && (
          <div
            className={cn(
              isDev && '__CmpQuestion_Info', // DEBUG
              'content-truncate flex flex-wrap gap-4 gap-y-2 text-sm',
            )}
          >
            <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
              <span className="flex gap-2 truncate opacity-50">
                <Icons.CalendarDays className="hidden size-4 shrink-0 sm:flex" />
                <span className="truncate">{t('Created')}:</span>
              </span>
              <span className="truncate">{getFormattedRelativeDate(format, item.createdAt)}</span>
            </div>
            {!!compareDates(item.updatedAt, item.createdAt) && (
              <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
                <span className="flex gap-2 truncate opacity-50">
                  <Icons.Edit className="hidden size-4 shrink-0 sm:flex" />
                  <span className="truncate">{t('Modified')}:</span>
                </span>
                <span className="truncate">{getFormattedRelativeDate(format, item.updatedAt)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={cn(
          isDev && '__CmpQuestion_Extra', // DEBUG
          'flex shrink-0 items-center justify-center gap-1 max-xs:flex-col',
        )}
      >
        {actionItems}
        {!!menuItems.length && (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            {(() => {
              return (
                <DropdownMenuTrigger
                  asChild
                  aria-label="Show Menu"
                  className={cn(
                    isDev && '__CmpQuestion_DropdownMenuTrigger', // DEBUG
                  )}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    title={t('ShowMenu')}
                    className={cn(
                      isDev && '__CmpQuestion_DropdownMenuToggle', // DEBUG
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
                isDev && '__CmpQuestion_DropdownMenuContent', // DEBUG
                'mt-2 rounded-lg bg-popover',
                'flex w-full flex-col gap-1',
              )}
              viewportClassName={cn(
                isDev && '__CmpQuestion_DropdownMenuContentViewport', // DEBUG
                '[&>div]:gap-1',
              )}
            >
              {menuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {!!confirmAction && (
        <ConfirmModal
          isVisible // ={!!confirmAction}
          dialogTitle={t('YouHaveUnsavedChanges')}
          confirmButtonVariant="destructive"
          confirmButtonText={t('Yes')}
          cancelButtonText={t('No')}
          handleClose={() => setConfirmAction(undefined)}
          handleConfirm={() => {
            confirmAction?.();
            setConfirmAction(undefined);
          }}
        >
          {t('Are you sure you want to lose all your modified data?')}
        </ConfirmModal>
      )}
    </div>
  );
}
