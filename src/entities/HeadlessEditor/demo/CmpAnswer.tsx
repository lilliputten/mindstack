'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormatter } from 'next-intl';
import { useForm, useFormState } from 'react-hook-form';
import * as z from 'zod';

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
import {
  maxTextLength,
  minTextLength,
} from '@/components/pages/ManageTopicQuestionAnswers/constants';
import * as Icons from '@/components/shared/Icons';
import { isDev, TRoutePath } from '@/config';
import { EditAnswerForm, TFormData } from '@/features/answers/components/EditAnswerForm';
import { TNewOrOldAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import { useAvailableQuestionById, useGoToTheRoute, useMediaMinDevices } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { newItemIdPrefix } from '../constants';
import { TCmpItemProps } from '../types';

const showEditAsAction = true;
const showExplanation = false;

const formDataSchema = z.object({
  text: z.string().min(minTextLength).max(maxTextLength),
  explanation: z.string().optional(),
  isCorrect: z.boolean().optional(),
  isGenerated: z.boolean().optional(),
});

type TItem = TNewOrOldAnswer & {
  question?: { id: TQuestionId; topicId?: TTopicId };
};

type TCmpAnswerExtraParams = Pick<TItem, 'question'>;

export function CmpAnswer(props: TCmpItemProps<TItem>) {
  const { className, item, updateItem, hasChanges, compact, extraParams } = props;
  const {
    id,
    text = '',
    explanation = '',
    isCorrect = false,
    isGenerated = false,
    questionId,
    // question, // NOTE: Using the question data from `useAvailableQuestionById` or from the `extraParams`, see below
  } = item;

  // Extract question from extraParams if provided by a parent CmpQuestion
  const extraQuestion = (extraParams as TCmpAnswerExtraParams | undefined)?.question ?? null;
  const isNewQuestion = questionId.startsWith(newItemIdPrefix);

  // TODO: Detect compact mode depending on the container element width
  const { mediaWidths } = useMediaMinDevices();
  const isCompact = compact || !mediaWidths.includes('lg');

  const t = useT();
  const format = useFormatter();
  const goToTheRoute = useGoToTheRoute();

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId,
    traceId: 'CmpAnswer',
    enabled: !extraQuestion && !isNewQuestion,
  });
  const {
    question: fetchedQuestion,
    isFetched: isQuestionFetched,
    isFetching: isQuestionFetching,
  } = availableQuestionQuery;

  const question = extraQuestion ?? fetchedQuestion;
  const isReady = extraQuestion ? true : isQuestionFetched && !isQuestionFetching;

  const topicId = question?.topicId;

  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = topicId ? `${topicsListRoutePath}/${topicId}` : undefined;
  const questionsListRoutePath = topicRoutePath ? `${topicRoutePath}/questions` : undefined;
  const questionRoutePath = questionsListRoutePath
    ? `${questionsListRoutePath}/${questionId}`
    : undefined;
  const answersListRoutePath = questionRoutePath ? `${questionRoutePath}/answers` : undefined;
  const answerRoutePath = answersListRoutePath ? `${answersListRoutePath}/${id}` : undefined;

  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      text: text || '',
      explanation: explanation || '',
      isCorrect,
      isGenerated,
    },
  });

  const { isDirty } = useFormState({ control: form.control });
  const formIsCorrect = form.watch('isCorrect');

  const [viewInfo, setViewInfo] = React.useState(false);

  const [editedItem, setEditedItem] = React.useState<TItem | undefined>();
  const isEditMode = editedItem != undefined;
  const isEdited = isEditMode && isDirty;

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const openEditor = React.useCallback(() => {
    form.reset({
      text: text || '',
      explanation: explanation || '',
      isCorrect,
      isGenerated,
    });
    setEditedItem(item);
  }, [form, text, explanation, isCorrect, isGenerated, item]);

  React.useEffect(() => {
    if (isEditMode) {
      return;
    }
    form.reset(
      {
        text: text || '',
        explanation: explanation || '',
        isCorrect,
        isGenerated,
      },
      { keepDirtyValues: false },
    );
  }, [form, id, text, explanation, isCorrect, isGenerated, isEditMode]);

  const confirmActionCallback = React.useCallback(
    (action: () => void) => {
      return () => {
        setDropdownOpen(false);
        if (hasChanges) {
          setConfirmAction(() => action);
        } else {
          action();
        }
      };
    },
    [hasChanges],
  );

  const dropdownActionCallback = React.useCallback((action?: () => void) => {
    return () => {
      setDropdownOpen(false);
      action?.();
    };
  }, []);

  const confirmGoToTheRouteCallback = React.useCallback(
    (route?: string) => {
      if (!route) return () => {};
      return confirmActionCallback(() => goToTheRoute(route as TRoutePath));
    },
    [confirmActionCallback, goToTheRoute],
  );

  const getEditedItem = React.useCallback(
    (formData: TFormData) => {
      const next: TItem = {
        ...item,
        text: formData.text,
        explanation: formData.explanation,
        isCorrect: formData.isCorrect,
        isGenerated: formData.isGenerated,
      };
      return next;
    },
    [item],
  );

  const handleFormSubmit = React.useCallback(
    (formData: TFormData) => {
      setEditedItem(getEditedItem(formData));
    },
    [getEditedItem],
  );

  const handleSave = React.useCallback(() => {
    if (!updateItem) {
      return;
    }
    const formData: TFormData = form.getValues();
    setEditedItem(undefined);
    updateItem(getEditedItem(formData));
  }, [form, getEditedItem, updateItem]);

  const toggleCorrectness = React.useCallback(() => {
    if (!updateItem || isEditMode) {
      return;
    }
    const current = form.getValues('isCorrect') ?? false;
    form.setValue('isCorrect', !current, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    updateItem(getEditedItem(form.getValues()));
  }, [updateItem, isEditMode, form, getEditedItem]);

  const actionItems = React.useMemo(() => {
    return [
      // ApplyChanges
      !isCompact && isEditMode && !!updateItem && (
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
      !isCompact && !!updateItem && !isEditMode && (
        <Button
          key="Correctness"
          type="button"
          variant="ghost"
          className={cn(
            isDev && '__CmpAnswer_Correctness', // DEBUG
            'flex size-6 shrink-0 items-center justify-center rounded-md p-0',
            (formIsCorrect ?? false)
              ? 'bg-green-600/25 text-green-600 hover:bg-green-600/40 hover:text-green-700'
              : 'bg-red-600/20 text-red-500 hover:bg-red-600/35 hover:text-red-600',
          )}
          title={
            formIsCorrect
              ? t('EditAnswerFormFields.AnswerIsCorrect')
              : t('EditAnswerFormFields.AnswerIsIncorrect')
          }
          onClick={toggleCorrectness}
        >
          {formIsCorrect ? (
            <Icons.CircleCheck className="size-4 shrink-0" />
          ) : (
            <Icons.CircleAlert className="size-4 shrink-0" />
          )}
        </Button>
      ),
      !isCompact && !!updateItem && !isEditMode && showEditAsAction && (
        <Button
          key="Edit"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant="ghost"
          title={t('Edit')}
          onClick={openEditor}
        >
          <Icons.Edit className="size-3.5 shrink-0" />
        </Button>
      ),
      !isCompact && !isEditMode && (
        <Button
          key="ViewInfo"
          className="content-truncate flex size-6 items-center justify-center gap-2 p-0"
          variant={viewInfo ? 'theme' : 'ghost'}
          title={t('ViewInfo')}
          onClick={() => setViewInfo((v) => !v)}
        >
          <Icons.Info className="size-3.5 shrink-0" />
        </Button>
      ),
    ].filter(Boolean);
  }, [
    isCompact,
    isEditMode,
    updateItem,
    isEdited,
    t,
    handleSave,
    formIsCorrect,
    viewInfo,
    openEditor,
    toggleCorrectness,
  ]);

  const menuItems = React.useMemo(() => {
    return [
      // ApplyChanges
      isCompact && isEditMode && !!isEdited && !!updateItem && (
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
      isCompact && !!updateItem && !isEditMode && (
        <Button
          key="Correctness"
          type="button"
          variant="ghost"
          className={cn(
            isDev && '__CmpAnswer_Correctness', // DEBUG
            'content-truncate flex items-center justify-start gap-2 text-left',
            // 'flex size-6 shrink-0 items-center justify-center rounded-md p-0',
            (formIsCorrect ?? false)
              ? 'bg-green-600/25 text-green-600 hover:bg-green-600/40 hover:text-green-700'
              : 'bg-red-600/20 text-red-500 hover:bg-red-600/35 hover:text-red-600',
          )}
          onClick={dropdownActionCallback(toggleCorrectness)}
        >
          {formIsCorrect ? (
            <Icons.CircleCheck className="size-4 shrink-0" />
          ) : (
            <Icons.CircleAlert className="size-4 shrink-0" />
          )}
          <span className="truncate">
            {formIsCorrect
              ? t('EditAnswerFormFields.AnswerIsCorrect')
              : t('EditAnswerFormFields.AnswerIsIncorrect')}
          </span>
        </Button>
      ),
      // Edit
      isCompact && !!updateItem && !isEditMode && showEditAsAction && (
        <Button
          key="Edit"
          className="content-truncate flex items-center justify-start gap-2 text-left"
          variant="ghost"
          onClick={dropdownActionCallback(openEditor)}
        >
          <Icons.Edit className="size-3.5 shrink-0" />
          <span className="truncate">{t('Edit')}</span>
        </Button>
      ),
      // ViewInfo
      isCompact && !isEditMode && (
        <Button
          key="ViewInfo"
          className="content-truncate flex items-center justify-start gap-2 text-left"
          variant={viewInfo ? 'theme' : 'ghost'}
          onClick={dropdownActionCallback(() => setViewInfo((v) => !v))}
        >
          <Icons.Info className="size-3.5 shrink-0" />
          <span className="truncate">{t('ViewInfo')}</span>
        </Button>
      ),
      answersListRoutePath && (
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
        </Button>
      ),
      answerRoutePath && (
        <Button
          key="GoToTheAnswer"
          className="content-truncate flex items-center justify-start gap-2"
          variant="ghost"
          onClick={confirmGoToTheRouteCallback(answerRoutePath)}
        >
          <Link
            href={answerRoutePath as TRoutePath}
            className="content-truncate flex items-center justify-start gap-2"
            onClick={(ev) => ev.preventDefault()}
          >
            <Icons.ChevronRight className="size-3 shrink-0" />
            <span className="truncate">{t('EditAnswer')}</span>
          </Link>
        </Button>
      ),
    ].filter(Boolean);
  }, [
    isCompact,
    isEditMode,
    isEdited,
    updateItem,
    handleSave,
    t,
    dropdownActionCallback,
    formIsCorrect,
    toggleCorrectness,
    openEditor,
    viewInfo,
    answersListRoutePath,
    confirmGoToTheRouteCallback,
    answerRoutePath,
  ]);

  return (
    <div
      data-item-id={id}
      data-testid="__CmpAnswer"
      className={cn(
        isDev && '__CmpAnswer', // DEBUG
        'relative flex w-full items-start gap-2 text-left transition',
        !isReady && 'opacity-50',
        className,
      )}
      onDoubleClick={() => openEditor()}
    >
      <div
        className={cn(
          isDev && '__CmpAnswer_Content',
          'content-truncate relative flex flex-1 flex-col gap-4 rounded-md text-left',
        )}
        title={[item.order && `[${item.order}]`, item.id].filter(Boolean).join(' ')}
      >
        {isEditMode ? (
          <EditAnswerForm
            className={cn(isDev && '__CmpAnswer_Form')}
            fieldsClassName="p-1"
            form={form}
            handleFormSubmit={handleFormSubmit}
            isPending={false}
            // noSections={isCompact}
          />
        ) : (
          <MarkdownText className={cn(isDev && '__CmpAnswer_Text', 'content-truncate w-full')}>
            {text}
          </MarkdownText>
        )}
        {!isEditMode && showExplanation && !!explanation && (
          <div
            className={cn(
              isDev && '__CmpAnswer_Explanation',
              'content-truncate rounded-md bg-muted/30 p-2 text-sm opacity-80',
            )}
          >
            <MarkdownText className="content-truncate">{explanation}</MarkdownText>
          </div>
        )}
        {viewInfo && (
          <div
            className={cn(
              isDev && '__CmpAnswer_Info',
              'content-truncate flex flex-wrap gap-4 gap-y-2 text-sm',
            )}
          >
            <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
              <span className="flex gap-2 truncate opacity-50">
                <Icons.CalendarDays className="hidden size-4 shrink-0 sm:flex" />
                <span className="truncate">{t('Created')}:</span>
              </span>
              <span className="truncate">
                {item.createdAt ? getFormattedRelativeDate(format, item.createdAt) : '—'}
              </span>
            </div>
            {!!item.updatedAt &&
              !!item.createdAt &&
              !!compareDates(item.updatedAt, item.createdAt) && (
                <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
                  <span className="flex gap-2 truncate opacity-50">
                    <Icons.Edit className="hidden size-4 shrink-0 sm:flex" />
                    <span className="truncate">{t('Modified')}:</span>
                  </span>
                  <span className="truncate">
                    {getFormattedRelativeDate(format, item.updatedAt)}
                  </span>
                </div>
              )}
          </div>
        )}
      </div>
      <div
        className={cn(
          isDev && '__CmpAnswer_Extra', // DEBUG
          'flex shrink-0 items-center justify-center gap-1',
          isCompact && 'flex-col', // NOTE: Show in compact mode
        )}
      >
        {actionItems}
        {!!menuItems.length && (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              aria-label="Show Menu"
              className={cn(
                isDev && '__CmpAnswer_DropdownMenuTrigger', // DEBUG
                isCompact && 'order-first', // NOTE: Show in compact mode
              )}
            >
              <Button
                size="sm"
                variant="ghost"
                title={t('ShowMenu')}
                className={cn(
                  isDev && '__CmpAnswer_DropdownMenuToggle', // DEBUG
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
            <DropdownMenuContent
              align="end"
              className={cn(
                isDev && '__CmpAnswer_DropdownMenuContent', // DEBUG
                'mt-2 rounded-lg bg-popover',
                'flex w-full flex-col gap-1',
              )}
              viewportClassName={cn(
                isDev && '__CmpAnswer_DropdownMenuContentViewport', // DEBUG
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
