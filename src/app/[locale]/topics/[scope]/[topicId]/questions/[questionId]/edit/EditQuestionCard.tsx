'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormState, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorText, removeNullUndefinedValues } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useAvailableQuestionById } from '@/hooks/react-query/useAvailableQuestionById';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { Card } from '@/components/ui/Card';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { updateQuestion } from '@/features/questions/actions';
import {
  EditQuestionForm,
  questionFormDataSchema,
  TFormData,
} from '@/features/questions/components/EditQuestionForm';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TAvailableQuestion, TQuestionData, TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack, useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TEditQuestionCardProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableQuestionQuery: ReturnType<typeof useAvailableQuestionById>;
}

export function EditQuestionCard(props: TEditQuestionCardProps) {
  const {
    topicId,
    questionId,
    availableTopicQuery,
    availableQuestionsQuery,
    availableQuestionQuery,
  } = props;
  const { manageScope } = useManageTopicsStore();
  const t = useT();

  const [form, setForm] = React.useState<UseFormReturn<TFormData> | undefined>();
  const [isDirty, setIsDirty] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);

  const setFormState = React.useCallback((formState: FormState<TFormData>) => {
    setIsDirty(formState.isDirty);
    setIsValid(formState.isValid);
  }, []);

  const queryClient = useQueryClient();

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const {
    topic,
    // isFetched: isTopicFetched,
    // isLoading: isTopicLoading,
  } = availableTopicQuery;

  const {
    question,
    // isFetched: isQuestionFetched,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;

  if (!topic) {
    throw new Error(t('NoTopicFound'));
  }
  if (!question) {
    throw new Error(t('NoQuestionFound'));
  }

  const [isPending, startTransition] = React.useTransition();

  const isSubmitEnabled = !isPending && !!isDirty && !!isValid;

  const handleFormSubmit = React.useCallback(
    (formData: TFormData) => {
      const editedQuestion: TQuestionData = {
        ...question,
        // id: question.id,
        order: question.order || undefined,
        // topicId: question.topicId,
        text: formData.text,
        extraQuery: formData.extraQuery,
        answersCountRandom: formData.answersCountRandom,
        answersCountMin: formData.answersCountMin,
        answersCountMax: formData.answersCountMax,
        isGenerated: formData.isGenerated,
      };
      startTransition(async () => {
        try {
          const promise = updateQuestion(editedQuestion);
          toast.promise(promise, {
            loading: t('EditQuestionCard.SavingQuestionData'),
            success: t('EditQuestionCard.SuccessfullySavedQuestion'),
            error: t('EditQuestionCard.CannotSaveQuestionData'),
          });
          const _updatedQuestion = await promise;
          // Invalidate all possible question data...
          const invalidatePrefixes = [
            ['available-question', editedQuestion.id],
            '["available-questions', // All available question queries
          ].map(makeQueryKeyPrefix);
          invalidateKeysByPrefixes(queryClient, invalidatePrefixes);

          // Update the item to the cached react-query data
          availableQuestionsQuery.updateQuestion({ ...question, ...editedQuestion });
          // TODO: Update or invalidate all other possible AvailableQuestion and AvailableQuestions cached data
          // Invalidate all other keys...
          availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
          // Reset form to the current data
          form?.reset(form?.getValues());
          // TODO: Convert `updatedQuestion` to the form data & reset form to these values?
        } catch (error) {
          const details = getErrorText(error);
          const message = t('EditQuestionCard.CannotSaveQuestionData');
          // eslint-disable-next-line no-console
          console.error('[EditQuestionCard]', [message, details].join(': '), {
            error,
            questionId: editedQuestion.id,
          });
          debugger; // eslint-disable-line no-debugger
        }
      });
    },
    [availableQuestionsQuery, form, queryClient, question, t],
  );

  const handleReload = React.useCallback(() => {
    availableQuestionQuery
      .refetch()
      .then((res) => {
        const question: TAvailableQuestion | undefined | null = res.data;
        if (question) {
          // Convert question to the FormData, see example `src/app/[locale]/topics/[scope]/[topicId]/edit/EditTopicPage.tsx`
          const cleanedQuestion = removeNullUndefinedValues(
            question as unknown as Record<string, unknown>,
          );
          const convertedQuestion = questionFormDataSchema.parse(cleanedQuestion);
          // Set form data
          form?.reset(convertedQuestion);
          // Add the created item to the cached react-query data
          availableQuestionsQuery.updateQuestion(question);
          // Invalidate all other keys...
          availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
        }
      })
      .catch((error) => {
        const details = getErrorText(error);
        const message = t('EditQuestionCard.CannotUpdateQuestionData');
        // eslint-disable-next-line no-console
        console.error('[EditQuestionCard:handleReload]', [message, details].join(': '), {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
      });
  }, [availableQuestionQuery, form, availableQuestionsQuery, t]);

  const handleSubmit = form?.handleSubmit(handleFormSubmit);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: t('Reload'),
        title: t('EditQuestionCard.ReloadDataFromServer'),
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: availableQuestionQuery.isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Reset',
        content: t('ResetChanges'),
        icon: Icons.Close,
        visibleFor: 'lg',
        onClick: () => form?.reset(),
        hidden: !isDirty,
      },
      {
        id: 'Add New Question',
        content: t('AddNewQuestion'),
        icon: Icons.Add,
        onClick: () => goToTheRoute(`${questionsListRoutePath}/add`),
      },
      {
        id: 'Delete Question',
        content: t('DeleteQuestion'),
        variant: 'destructive',
        icon: Icons.Trash,
        onClick: () => goToTheRoute(`${questionsListRoutePath}/delete?questionId=${questionId}`),
      },
      {
        id: 'Save',
        content: t('EditQuestionCard.Save'),
        variant: 'success',
        icon: Icons.Check,
        visibleFor: 'sm',
        disabled: !isSubmitEnabled,
        pending: isPending,
        onClick: handleSubmit,
        hidden: !handleSubmit,
      },
    ],
    [
      t,
      goBack,
      availableQuestionQuery.isRefetching,
      handleReload,
      isDirty,
      isSubmitEnabled,
      isPending,
      handleSubmit,
      form,
      goToTheRoute,
      questionsListRoutePath,
      questionId,
    ],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope: manageScope,
    isLoading: !topic || !question,
    topic: topic,
    question: question,
  });

  return (
    <>
      <DashboardHeader
        heading={t('EditQuestionCard.EditQuestionProperties')}
        className={cn(
          isDev && '__EditQuestionCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <Card
        className={cn(
          isDev && '__EditQuestionCard_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <EditQuestionForm
          className={cn(
            isDev && '__EditQuestionCard_Form', // DEBUG
          )}
          question={question}
          setForm={setForm}
          setFormState={setFormState}
          handleFormSubmit={handleFormSubmit}
          isPending={isPending}
        />
      </Card>
    </>
  );
}
