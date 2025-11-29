'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { getErrorText, removeNullUndefinedValues } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useAvailableQuestionById } from '@/hooks/react-query/useAvailableQuestionById';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { Card } from '@/components/ui/Card';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { maxTextLength, minTextLength } from '@/components/pages/ManageTopicQuestions/constants';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { updateQuestion } from '@/features/questions/actions';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TAvailableQuestion, TQuestionData, TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack, useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

// import { topicQuestionDeletedEventId } from '../DeleteQuestionModal';
import { EditQuestionForm } from './EditQuestionForm';
import { questionFormDataSchema, TFormData } from './types';

interface TEditQuestionCardProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableQuestionQuery: ReturnType<typeof useAvailableQuestionById>;
}

const formDataSchema = z.object({
  text: z.string().min(minTextLength).max(maxTextLength),
  answersCountRandom: z.boolean().optional(),
  answersCountMin: z.union([z.string().optional(), z.number()]),
  answersCountMax: z.union([z.string().optional(), z.number()]),
  isGenerated: z.boolean().optional(),
});

export function EditQuestionCard(props: TEditQuestionCardProps) {
  const {
    // className,
    topicId,
    questionId,
    availableTopicQuery,
    availableQuestionsQuery,
    availableQuestionQuery,
  } = props;
  const { manageScope } = useManageTopicsStore();

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
    throw new Error('No topic found');
  }
  if (!question) {
    throw new Error('No question found');
  }

  const [isPending, startTransition] = React.useTransition();

  const formSchema = React.useMemo(
    () =>
      formDataSchema.superRefine((data, ctx) => {
        const { answersCountRandom } = data;
        if (answersCountRandom) {
          const answersCountMin = Number(data.answersCountMin);
          const answersCountMax = Number(data.answersCountMax);
          if (!answersCountMin || answersCountMin < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'It should be a positive number.',
              path: ['answersCountMin'],
            });
          }
          if (!answersCountMax || answersCountMax < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'It should be a positive number.',
              path: ['answersCountMax'],
            });
          }
          if (answersCountMin > answersCountMax) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'A minimal value should be less than maximal.',
              path: ['answersCountMin'],
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'A minimal value should be less than maximal.',
              path: ['answersCountMax'],
            });
          }
        }
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(
    () => ({
      text: question.text || '',
      answersCountRandom: question.answersCountRandom || false,
      answersCountMin: question.answersCountMin || undefined,
      answersCountMax: question.answersCountMax || undefined,
      isGenerated: question.isGenerated || false,
    }),
    [question],
  );

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    // @see https://react-hook-form.com/docs/useform
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(formSchema),
    defaultValues, // Default values for the form.
  });

  // @see https://react-hook-form.com/docs/useform/formstate
  const { isDirty, isValid } = form.formState;

  const isSubmitEnabled = !isPending && isDirty && isValid;

  const handleFormSubmit = React.useCallback(
    (formData: TFormData) => {
      const editedQuestion: TQuestionData = {
        id: question.id,
        topicId: question.topicId,
        text: formData.text,
        answersCountRandom: formData.answersCountRandom,
        answersCountMin: formData.answersCountMin,
        answersCountMax: formData.answersCountMax,
        isGenerated: formData.isGenerated,
      };
      startTransition(async () => {
        try {
          const promise = updateQuestion(editedQuestion);
          toast.promise(promise, {
            loading: 'Saving the question data...',
            success: 'Successfully saved the question',
            error: 'Can not save the question data.',
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
          form.reset(form.getValues());
          // TODO: Convert `updatedQuestion` to the form data & reset form to these values?
        } catch (error) {
          const details = getErrorText(error);
          const message = 'Cannot save question data';
          // eslint-disable-next-line no-console
          console.error('[EditQuestionCard]', [message, details].join(': '), {
            error,
            questionId: editedQuestion.id,
          });
          debugger; // eslint-disable-line no-debugger
        }
      });
    },
    [availableQuestionsQuery, form, queryClient, question],
  );

  const handleReload = React.useCallback(() => {
    availableQuestionQuery
      .refetch()
      .then((res) => {
        const question: TAvailableQuestion | undefined = res.data;
        if (question) {
          // Convert question to the FormData, see example `src/app/[locale]/topics/[scope]/[topicId]/edit/EditTopicPage.tsx`
          const cleanedQuestion = removeNullUndefinedValues(
            question as unknown as Record<string, unknown>,
          );
          const convertedQuestion = questionFormDataSchema.parse(cleanedQuestion);
          // Set form data
          form.reset(convertedQuestion);
          // Add the created item to the cached react-query data
          availableQuestionsQuery.updateQuestion(question);
          // Invalidate all other keys...
          availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
        }
      })
      .catch((error) => {
        const details = getErrorText(error);
        const message = 'Cannot update question data';
        // eslint-disable-next-line no-console
        console.error('[EditQuestionCard:handleReload]', [message, details].join(': '), {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
      });
  }, [availableQuestionsQuery, availableQuestionQuery, form]);

  const handleSubmit = form.handleSubmit(handleFormSubmit);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: 'Back',
        // variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: 'Reload',
        title: 'Reload the data from the server',
        // variant: 'ghost',
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: availableQuestionQuery.isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Reset',
        content: 'Reset changes',
        // variant: 'ghost',
        icon: Icons.Close,
        visibleFor: 'lg',
        onClick: () => form.reset(),
        hidden: !isDirty,
      },
      {
        id: 'Add New Question',
        content: 'Add New Question',
        // variant: 'success',
        icon: Icons.Add,
        // visibleFor: 'lg',
        onClick: () => goToTheRoute(`${questionsListRoutePath}/add`),
      },
      {
        id: 'Delete Question',
        content: 'Delete Question',
        variant: 'destructive',
        icon: Icons.Trash,
        // visibleFor: 'lg',
        onClick: () => goToTheRoute(`${questionsListRoutePath}/delete?questionId=${questionId}`),
      },
      {
        id: 'Save',
        content: 'Save',
        variant: 'success',
        icon: Icons.Check,
        visibleFor: 'sm',
        disabled: !isSubmitEnabled,
        pending: isPending,
        onClick: handleSubmit,
      },
    ],
    [
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
        heading="Edit Question Properties"
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
          form={form}
          handleFormSubmit={handleFormSubmit}
          isPending={isPending}
        />
      </Card>
    </>
  );
}
