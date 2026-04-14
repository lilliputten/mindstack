import React from 'react';
import { useFormatter } from 'next-intl';
import { FormState, UseFormReturn } from 'react-hook-form';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
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
import { newItemIdPrefix, TSaveDataParams } from '@/entities/HeadlessEditor';
import { AnswersEditorCore } from '@/features/answers/components/AnswersEditor';
import { TNewOrOldAnswer } from '@/features/answers/types';
import { EditQuestionForm, TFormData } from '@/features/questions/components/EditQuestionForm';
import { TNewOrOldQuestion, TQuestionId } from '@/features/questions/types';
import { useGoToTheRoute, useMediaMinDevices } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { TCmpItemProps } from './types';

type T = TNewOrOldQuestion;

/** Show edit button in the actions block or (otherwise) in the dropdown menu */
const showEditAsAction = true;
const isActiveAnswersButton = true;
const showEmptyAnswersButton = true;

/**
 * `TNewOrOldQuestion.answers` may list draft shapes (text-only) or full `TAvailableAnswer` rows.
 * The headless answers editor requires stable `id` and `questionId` on every row.
 */
function toHeadlessAnswerRows(
  questionId: TQuestionId,
  raw: T['answers'] | undefined,
): TNewOrOldAnswer[] {
  if (!raw?.length) {
    return [];
  }
  return raw.map((entry, index) => {
    if (
      entry &&
      typeof entry === 'object' &&
      'id' in entry &&
      entry.id != null &&
      'questionId' in entry &&
      entry.questionId != null &&
      'text' in entry
    ) {
      return entry as TNewOrOldAnswer;
    }
    const e = entry as {
      text: string;
      isCorrect?: boolean;
      explanation?: string | null;
    };
    return {
      id: `${newItemIdPrefix}cmp-${String(questionId)}-${String(index)}`,
      questionId,
      text: e.text,
      isCorrect: e.isCorrect,
      explanation: e.explanation,
      isNew: true,
    };
  });
}

export function CmpQuestion(props: TCmpItemProps<T>) {
  const { className, item, updateItem, hasChanges, compact, extraParams } = props;
  const {
    id, // Required an unique id
    text = '', // Question markdown text
    _count,
    answers,
    topicId,
  } = item;

  // TODO: Detect compact mode depending on the container element width
  const { mediaWidths } = useMediaMinDevices();
  const isCompact = compact || !mediaWidths.includes('lg');

  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();

  const t = useT();
  const format = useFormatter();

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${id}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  // const goBack = useGoBack(topicRoutePath);
  const goToTheRoute = useGoToTheRoute();

  const hasAnswersData = answers != undefined;
  const count = answers?.length || _count?.answers;

  // Item editing...
  const [form, setForm] = React.useState<UseFormReturn<TFormData> | undefined>();
  const [isDirty, setIsDirty] = React.useState(false);
  // const [isValid, setIsValid] = React.useState(false);

  const setFormState = React.useCallback((formState: FormState<TFormData>) => {
    setIsDirty(formState.isDirty);
    // setIsValid(formState.isValid);
  }, []);

  const [viewAnswersHasRendered, setViewAnswersHasRendered] = React.useState(false);
  const [viewAnswers, setViewAnswers] = React.useState(false);
  const [viewInfo, setViewInfo] = React.useState(false);

  React.useEffect(() => {
    if (viewAnswers) {
      setViewAnswersHasRendered(true);
    }
  }, [viewAnswers]);

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
  const dropdownActionCallback = React.useCallback((action?: (ev?: React.MouseEvent) => void) => {
    return () => {
      setDropdownOpen(false);
      action?.();
    };
  }, []);
  const confirmGoToTheRouteCallback = React.useCallback(
    (route?: string) => {
      if (!route) return () => {};
      return confirmActionCallback(() => {
        goToTheRoute(route as TRoutePath);
      });
    },
    [confirmActionCallback, goToTheRoute],
  );

  const getEditedItem = React.useCallback(
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
      return editedItem;
    },
    [item],
  );

  const handleFormSubmit = React.useCallback(
    (formData: TFormData) => {
      const editedItem: T = getEditedItem(formData);
      setEditedItem(editedItem);
    },
    [getEditedItem],
  );

  const handleSave = React.useCallback(() => {
    if (!form || !updateItem) {
      // TODO: Throw an error?
      return;
    }
    const formData: TFormData = form.watch();
    const editedItem: T = getEditedItem(formData);
    updateItem(editedItem);
    setEditedItem(undefined);
  }, [getEditedItem, form, updateItem]);

  const clickAnswers = React.useMemo(
    () =>
      hasAnswersData
        ? () => setViewAnswers((viewAnswers) => !viewAnswers)
        : isActiveAnswersButton
          ? confirmGoToTheRouteCallback(questionRoutePath)
          : undefined,
    [confirmGoToTheRouteCallback, hasAnswersData, questionRoutePath],
  );

  const actionItems = React.useMemo(() => {
    return [
      // ApplyChanges
      !isCompact && isEditMode && !!updateItem && !!form && (
        <Button
          key="ApplyChanges"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant={isEdited ? 'success' : 'ghost'}
          title={t('ApplyChanges')}
          disabled={!isEdited}
          onClick={handleSave}
        >
          <Icons.Check className="size-4 shrink-0" />
        </Button>
      ),
      // Cancel editing
      !isCompact && isEditMode && (
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
      // Show answers
      !isCompact && !isEditMode && (showEmptyAnswersButton || !!count) && (
        <Button
          key="Answers"
          // variant={viewAnswers ? 'theme' : 'ghost'}
          className={cn(
            isDev && '__CmpQuestion_Count', // DEBUG
            'flex h-6 min-w-8 shrink-0 items-center justify-center rounded-md px-2',
            viewAnswers
              ? 'bg-theme-500 text-white hover:bg-theme-600'
              : 'bg-theme-500/10 text-foreground hover:bg-theme-500/20',
            'text-xs opacity-80',
            isActiveAnswersButton && 'cursor-pointer transition',
          )}
          onClick={clickAnswers}
          title={
            !hasAnswersData
              ? t('GoToTheAnswers')
              : viewAnswers
                ? t('HideAnswers')
                : t('ShowAnswers')
          }
        >
          <span className="truncate">{count || 0}</span>
        </Button>
      ),
      // Edit action
      !isCompact && !!updateItem && !isEditMode && showEditAsAction && (
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
      !isCompact && !isEditMode && (
        <Button
          key="ViewInfo"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant={viewInfo ? 'theme' : 'ghost'}
          title={t('ViewInfo')}
          onClick={() => setViewInfo((viewInfo) => !viewInfo)}
        >
          <Icons.Info className="size-3.5 shrink-0" />
        </Button>
      ),
    ].filter(Boolean);
  }, [
    isCompact,
    isEditMode,
    updateItem,
    form,
    isEdited,
    t,
    handleSave,
    count,
    viewAnswers,
    clickAnswers,
    hasAnswersData,
    viewInfo,
    item,
  ]);

  const menuItems = React.useMemo(() => {
    return [
      // Edit action
      isCompact && !!updateItem && !isEditMode && showEditAsAction && (
        <Button
          key="Edit"
          className="content-truncate flex items-center justify-start gap-2 text-left"
          variant="ghost"
          title={t('Edit')}
          onClick={dropdownActionCallback(() => setEditedItem(item))}
        >
          <Icons.Edit className="size-3.5 shrink-0" />
          <span className="truncate">{t('Edit')}</span>
        </Button>
      ),
      // ApplyChanges
      isCompact && isEditMode && isEdited && !!updateItem && !!form && (
        <Button
          key="ApplyChanges"
          className="content-truncate flex items-center justify-start gap-2 text-left"
          variant={isEdited ? 'success' : 'ghost'}
          disabled={!isEdited}
          onClick={dropdownActionCallback(handleSave)}
        >
          <Icons.Check className="size-4 shrink-0" />
          <span className="truncate">{t('ApplyChanges')}</span>
        </Button>
      ),
      // Cancel editing
      isCompact && isEditMode && (
        <Button
          key="CancelEditing"
          className="content-truncate flex items-center justify-start gap-2 text-left"
          variant="ghost"
          onClick={dropdownActionCallback(() => setEditedItem(undefined))}
        >
          <Icons.X className="size-4 shrink-0" />
          <span className="truncate">{t('CancelEditing')}</span>
        </Button>
      ),
      // Show answers
      isCompact && !isEditMode && hasAnswersData && (
        <Button
          key="Answers"
          variant={viewAnswers ? 'theme' : 'ghost'}
          className={cn(
            isDev && '__CmpQuestion_Count', // DEBUG
            'content-truncate flex items-center justify-start gap-2 text-left',
            isActiveAnswersButton && 'cursor-pointer transition hover:bg-theme-500/50',
          )}
          onClick={dropdownActionCallback(clickAnswers)}
        >
          <Icons.Answers className="size-3.5 shrink-0" />
          <span className="truncate">
            {hasAnswersData ? t('ShowAnswers') : t('GoToTheAnswers')}
          </span>
          <span className="truncate font-light opacity-50">({count || 0})</span>
        </Button>
      ),
      // View question info
      (isCompact || isEditMode) && (
        <Button
          key="ViewInfo"
          className="content-truncate flex items-center justify-start gap-2"
          variant={viewInfo ? 'theme' : 'ghost'}
          title={t('ViewInfo')}
          onClick={dropdownActionCallback(() => setViewInfo((viewInfo) => !viewInfo))}
        >
          <Icons.Info className="size-3.5 shrink-0" />
          <span className="truncate">{t('ViewInfo')}</span>
        </Button>
      ),
      // Edit
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
      // Go to answers
      <Button
        key="GoToTheAnswers"
        className="content-truncate flex items-center justify-start gap-2"
        variant="ghost"
        onClick={confirmGoToTheRouteCallback(answersListRoutePath)}
      >
        <Link
          href={answersListRoutePath as TRoutePath}
          className="content-truncate flex items-center justify-start gap-2"
          onClick={(ev) => ev.preventDefault()}
        >
          <Icons.ChevronRight className="size-3 shrink-0" />
          <span className="truncate">{t('GoToTheAnswers')}</span>
        </Link>
      </Button>,
      // Go to the question
      <Button
        key="GoToTheQuestion"
        className="content-truncate flex items-center justify-start gap-2"
        variant="ghost"
        onClick={confirmGoToTheRouteCallback(questionRoutePath)}
      >
        <Link
          href={questionRoutePath as TRoutePath}
          className="content-truncate flex items-center justify-start gap-2"
          onClick={(ev) => ev.preventDefault()}
        >
          <Icons.ChevronRight className="size-3 shrink-0" />
          <span className="truncate">{t('GoToTheQuestion')}</span>
        </Link>
      </Button>,
    ].filter(Boolean);
  }, [
    answersListRoutePath,
    clickAnswers,
    confirmGoToTheRouteCallback,
    count,
    dropdownActionCallback,
    form,
    handleSave,
    hasAnswersData,
    isCompact,
    isEditMode,
    isEdited,
    item,
    questionRoutePath,
    t,
    updateItem,
    viewAnswers,
    viewInfo,
  ]);

  // XXX: Is it required?
  const headlessAnswerRows = React.useMemo(() => toHeadlessAnswerRows(id, answers), [id, answers]);

  const saveAnswersData = React.useCallback(
    async (saveParams: TSaveDataParams<TNewOrOldAnswer>): Promise<TNewOrOldAnswer[]> => {
      const { items, updatedItems, deletedIds, addedItems, addedIds } = saveParams;
      const updatedMap = new Map(updatedItems ? [...updatedItems].map((u) => [u.id, u]) : []);
      const newItems = items
        .filter((answer) => !deletedIds?.has(answer.id) && !addedIds?.has(answer.id))
        .map((answer) => updatedMap.get(answer.id) ?? answer)
        .concat(addedItems ? ([...addedItems.values()] as TNewOrOldAnswer[]) : []);
      if (updateItem) {
        updateItem({ ...item, answers: newItems });
      }
      return newItems;
    },
    [item, updateItem],
  );

  return (
    <div
      data-item-id={id}
      data-testid="__CmpQuestion"
      className={cn(
        isDev && '__CmpQuestion', // DEBUG
        'relative flex w-full items-start gap-2 text-left',
        // 'p-1',
        // hasChanges && 'border border-red-500', // DEBUG
        className,
      )}
      onDoubleClick={() => setEditedItem(item)}
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
        title={[item.order && `[${item.order}]`, item.id].filter(Boolean).join(' ')} // DEBUG
      >
        {isEditMode ? (
          <EditQuestionForm
            className={cn(
              isDev && '__CmpQuestion_Form', // DEBUG
            )}
            fieldsClassName="p-1"
            question={item}
            setForm={setForm}
            setFormState={setFormState}
            handleFormSubmit={handleFormSubmit}
            // noSections={isCompact}
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
        {hasAnswersData && (viewAnswers || viewAnswersHasRendered) && (
          <div
            className={cn(
              isDev && '__CmpQuestion_Answers', // DEBUG
              'content-truncate flex flex-col gap-2 text-sm',
              !viewAnswers && 'hidden',
            )}
          >
            {/* TODO: Show sekeleton */}
            <AnswersEditorCore
              topicId={topicId}
              questionId={id}
              answers={headlessAnswerRows}
              isReady
              saveData={saveAnswersData}
              extraParams={{ ...(extraParams as object | undefined), question: item }}
            />
          </div>
        )}
      </div>
      <div
        className={cn(
          isDev && '__CmpQuestion_Extra', // DEBUG
          'flex shrink-0 items-center justify-center gap-1',
          isCompact && 'flex-col', // NOTE: Show in compact mode
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
                    // 'max-lg:order-first',
                    isCompact && 'order-first', // NOTE: Show in compact mode
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
          isVisible
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
          {t('AreYouSureYouWantToLoseData')}
        </ConfirmModal>
      )}
    </div>
  );
}
