'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { defaultAiClientType } from '@/lib/ai';
import { getErrorText } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useRouteChanging } from '@/hooks/next-router/useRouteChanging';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BusySplash, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, defaultAIGenerationTemperature } from '@/config';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import {
  createGenerateQuestionAnswersMessages,
  parseGeneratedQuestionAnswers,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import { TAIQuerDebugDataId, TAITextQueryData } from '@/features/ai/types';
import {
  answersGenerationTypes,
  TGenerateQuestionAnswersParams,
} from '@/features/ai/types/GenerateAnswersTypes';
import { deleteAnswers } from '@/features/answers/actions';
import { addMultipleAnswers } from '@/features/answers/actions/addMultipleAnswers';
import { useAnswersBreadcrumbsItems } from '@/features/answers/components/AnswersBreadcrumbs';
import { TAvailableAnswer, TNewAnswer } from '@/features/answers/types';
import { logJsonData } from '@/features/logger/server-actions';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useAvailableTopicById,
  useDocumentTitle,
  useGoBack,
  useSessionData,
} from '@/hooks';

import { ContentSkeleton, InnerContentSkeleton } from './ContentSkeleton';
import { EditScreen } from './EditScreen';
import { GenerateAnswersForm } from './GenerateAnswersForm';
import { GeneratedScreen } from './GeneratedScreen';
import { SavedScreen } from './SavedScreen';
import { formSchema, TFormData } from './types';

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'answers-query-data-01';

/** Show debug data to test answers editing */
const __debugGenerated = isDev && false;
const __debugGeneratedAnswers: TNewAnswer[] | undefined = __debugGenerated
  ? [
      {
        questionId: 'xxx',
        text: 'Answer _markdown_ text',
        explanation: 'Explanation markdown text...',
        isCorrect: false,
        isGenerated: true,
      },
      {
        questionId: 'yyy',
        text: '**Second answer** with much longer text for test purposes and visual issues detection',
        explanation: 'Explanation markdown text...',
        isCorrect: true,
        isGenerated: true,
      },
    ]
  : undefined;

const __now = new Date();

/** Show debug data to test saved questions */
const __debugSaved = isDev && false;
const __debugSavedAnswers: TAvailableAnswer[] | undefined = __debugSaved
  ? [
      // DEBUG: Test data
      {
        id: 'aaa',
        order: undefined,
        questionId: 'zzz',
        createdAt: __now,
        updatedAt: __now,
        isGenerated: true,
        text: 'Sample answer',
        explanation: 'Sample explanation',
        isCorrect: true,
        // isSaved: true,
      },
    ]
  : undefined;

interface GenerateAnswersPageWrapperProps {
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}

export function GenerateAnswersPageWrapper({
  scope,
  topicId,
  questionId,
}: GenerateAnswersPageWrapperProps) {
  const { user, loading: isSessionLoading } = useSessionData();
  const { isRouteChanging } = useRouteChanging();

  const isAdmin = user?.role === 'ADMIN';

  const [isEditing, setEditing] = React.useState<boolean>(false && __debugGenerated);

  const [generatedAnswers, setGeneratedAnswers] = React.useState<TNewAnswer[] | undefined>(
    __debugGeneratedAnswers,
  );
  const [savedAnswers, setSavedAnswers] = React.useState<TAvailableAnswer[] | undefined>(
    __debugSavedAnswers,
  );
  const [error, setError] = React.useState<string | undefined>();

  const [isLeaving, setLeaving] = React.useState(false);

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'GenerateAnswersPageWrapper',
  });
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = aiGenerationsStatusQuery;

  const userAIRequest = useUserAIRequest();
  const t = useT();
  const queryClient = useQueryClient();

  // Calculate paths
  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  const goBack = useGoBack(answersListRoutePath);

  const isPreparing = isSessionLoading || aiGenerationsLoading;

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched: isTopicFetched, isFetching: isTopicFetching } = availableTopicQuery;
  const isTopicPending = !isTopicFetched || isTopicFetching;

  const availableQuestionQuery = useAvailableQuestionById({ id: questionId });
  const {
    question,
    isFetched: isQuestionFetched,
    isFetching: isQuestionFetching,
  } = availableQuestionQuery;
  const isQuestionPending = !isQuestionFetched || isQuestionFetching;

  const availableAnswersQuery = useAvailableAnswers({ itemsLimit: null, questionId });
  const {
    allAnswers: answers,
    isFetching: isAnswersFetching,
    isFetched: isAnswersFetched,
  } = availableAnswersQuery;
  const isAnswersPending = !isAnswersFetched || isAnswersFetching;

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  // Using different titles depending on the current status
  const title = isEditing
    ? t('GenerateAnswersModal.EditingAnswers')
    : savedAnswers
      ? t('GenerateAnswersModal.AnswersSaved')
      : generatedAnswers
        ? t('GenerateAnswersModal.AnswersGeneratedStatus')
        : t('GenerateAnswersModal.Title');
  useDocumentTitle(title);

  const generateAnswersMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort('Cleaned up');
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const abortPromise = new Promise<never>((_, rej) => (controller.signal.onabort = rej));

      const topic = question?.topic;
      const questionText = question?.text || '';
      const topicText = topic?.name || '';
      const topicDescription = topic?.description || '';
      const topicKeywords = topic?.keywords || '';
      const params: TGenerateQuestionAnswersParams = {
        ...formData,
        topicText,
        topicDescription,
        topicKeywords,
        langName: topic?.langName || undefined,
        langCode: topic?.langCode || undefined,
        questionText,
        existedAnswers: answers?.map(({ isCorrect, explanation, text }: TAvailableAnswer) => ({
          isCorrect,
          explanation: explanation || null,
          text,
        })),
      };
      const { debugData } = formData;

      const messages = createGenerateQuestionAnswersMessages(params);

      const queryData: TAITextQueryData = await Promise.race([
        abortPromise,
        userAIRequest(messages, {
          topicId,
          debugData: debugData ? debugDataId : undefined,
        }),
      ]);

      return queryData;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const saveAnswersMutation = useMutation<TAvailableAnswer[], Error, TNewAnswer[]>({
    mutationFn: async (newAnswers) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort('Cleaned up');
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const abortPromise = new Promise<never>((_, rej) => (controller.signal.onabort = rej));

      const savePromise = addMultipleAnswers(newAnswers);

      // Handle aborted operation and clean up...
      savePromise.then((savedAnswers) => {
        if (controller.signal.aborted) {
          const answerIdsToRemove = savedAnswers?.map(({ id }) => id);
          // eslint-disable-next-line no-console
          console.warn('[GenerateAnswersPageWrapper:saveAnswersMutation:aborted]', {
            answerIdsToRemove,
            savedAnswers,
            newAnswers,
            controller,
          });
          // Cleanup: remove added answers (if any)...
          if (answerIdsToRemove?.length) {
            /* await: Don't wait for result */
            deleteAnswers(answerIdsToRemove);
          }
        }
      });

      const savedAnswers = await Promise.race([abortPromise, savePromise]);
      return savedAnswers;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const resetOperations = React.useCallback(() => {
    abortControllerRef.current?.abort();
    queryClient.cancelQueries({
      queryKey: [
        // All used query keys...
        availableTopicQuery.queryKey,
        availableAnswersQuery.queryKey,
        availableQuestionQuery.queryKey,
      ].filter(Boolean),
    });
    if (generateAnswersMutation.isPending) {
      generateAnswersMutation.reset();
    }
    if (saveAnswersMutation.isPending) {
      saveAnswersMutation.reset();
    }
  }, [
    queryClient,
    availableTopicQuery.queryKey,
    availableAnswersQuery.queryKey,
    availableQuestionQuery.queryKey,
    generateAnswersMutation,
    saveAnswersMutation,
  ]);

  const generateCallback = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!questionId) {
          toast.error(t('GenerateAnswersModal.NoQuestionIdDefined'));
          return;
        }
        const queryPromise = generateAnswersMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateAnswersModal.GeneratingAnswers'),
          success: t('GenerateAnswersModal.AnswersGenerated'),
          cancel: {
            label: t('Cancel'),
            onClick: resetOperations,
          },
        });

        const queryData = await queryPromise;
        const answers = parseGeneratedQuestionAnswers(queryData);
        const newAnswers: TNewAnswer[] | undefined = answers?.map((answer) => ({
          ...answer,
          questionId,
          isGenerated: true,
        }));

        if (!newAnswers || !newAnswers.length) {
          throw new Error(t('GenerateAnswersModal.NoAnswersGeneratedError'));
        }

        const __debugData = {
          newAnswers,
          queryData,
          topicId,
          questionId,
          formData,
        };
        const message = 'Parsed generated answers';
        const __idMsg = '[GenerateAnswersPageWrapper:generateCallback]';
        // eslint-disable-next-line no-console
        console.log(__idMsg, message, __debugData);
        logJsonData(__idMsg, { formData, topicId, questionId }, __debugData); // NOTE: Not awaiting and catching!

        setGeneratedAnswers(newAnswers);
      } catch (error) {
        const isAborted =
          (error instanceof Event && error.type === 'abort') ||
          (error as Error).name === 'AbortError';
        const message = isAborted
          ? t('GenerateAnswersModal.GenerationAborted')
          : t('GenerateAnswersModal.GenerationErrorOccured');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        generateAnswersMutation.reset();

        if (isAborted) {
          // eslint-disable-next-line no-console
          console.warn('[GenerateAnswersPageWrapper:generateCallback] Aborted:', comboMsg, {
            details,
            error,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('[GenerateAnswersPageWrapper:generateCallback] ❌', comboMsg, {
            details,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(comboMsg);
          setError(comboMsg);
        }
      }
    },
    [generateAnswersMutation, topicId, questionId, resetOperations, t],
  );

  const saveCallback = React.useCallback(async () => {
    try {
      if (!questionId) {
        throw new Error(t('GenerateAnswersModal.NoQuestionIdDefined'));
      }
      if (!generatedAnswers?.length) {
        throw new Error('No answers has been generated');
      }

      const newAnswers: TNewAnswer[] = generatedAnswers;
      const addAnswersPromise = saveAnswersMutation.mutateAsync(newAnswers);
      toast.promise(addAnswersPromise, {
        loading: t('GenerateAnswersModal.AddingAnswers'),
        success: t('GenerateAnswersModal.AnswersAdded'),
        // error: t('GenerateAnswersModal.AnswersAddingError'),
        cancel: {
          label: t('Cancel'),
          onClick: resetOperations,
        },
      });

      const savedAnswers = await addAnswersPromise;
      setSavedAnswers(savedAnswers);

      const invalidatePrefixes = [
        ['available-question', questionId],
        ['available-answers-for-question', questionId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
    } catch (error) {
      const isAborted =
        (error instanceof Event && error.type === 'abort') ||
        (error as Error).name === 'AbortError';
      const message = isAborted
        ? t('GenerateAnswersModal.SavingAnswersAborted')
        : t('GenerateAnswersModal.SavingAnswersErrorOccured');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      saveAnswersMutation.reset();

      if (isAborted) {
        // eslint-disable-next-line no-console
        console.warn('[GenerateAnswersPageWrapper:saveCallback] Aborted:', comboMsg, {
          details,
          error,
        });
      } else {
        // eslint-disable-next-line no-console
        console.error('[GenerateAnswersPageWrapper:saveCallback] ❌', comboMsg, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        setError(comboMsg);
      }
    }
  }, [saveAnswersMutation, generatedAnswers, queryClient, questionId, t, resetOperations]);

  /** Hide modal & cancel all pending operations */
  const cancelAndGoBack = React.useCallback(() => {
    setLeaving(true);
    resetOperations();
    goBack();
  }, [goBack, resetOperations]);

  const startOverCallback = React.useCallback(() => {
    resetOperations();
    setEditing(false);
    setGeneratedAnswers(undefined);
    setSavedAnswers(undefined);
  }, [resetOperations]);

  const areMutationsPending = generateAnswersMutation.isPending || saveAnswersMutation.isPending;
  const isBusy =
    isPreparing || isTopicPending || isQuestionPending || isAnswersPending || areMutationsPending;

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: cancelAndGoBack,
      },
      {
        id: 'AddNewQuestion',
        content: t('AddNewQuestion'),
        icon: Icons.Add,
        visibleFor: 'xl',
        href: `${topicRoutePath}/questions/add`,
      },
      {
        id: 'AddNewTopic',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        href: `${topicsListRoutePath}/add`,
      },
      {
        id: 'GoToTheTopic',
        content: t('GoToTheTopic'),
        icon: Icons.ArrowRight,
        href: topicRoutePath,
      },
      {
        id: 'GoToTheQuestions',
        content: t('GoToTheQuestions'),
        icon: Icons.ArrowRight,
        href: questionsListRoutePath,
      },
      {
        id: 'ToTraining',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        href: `${availableTopicsRoute}/${topicId}/workout`,
        hidden: !allowedTraining,
      },
    ],
    [
      t,
      cancelAndGoBack,
      topicRoutePath,
      topicsListRoutePath,
      questionsListRoutePath,
      topicId,
      allowedTraining,
    ],
  );

  const breadcrumbs = useAnswersBreadcrumbsItems({
    scope,
    topic: topic || undefined,
    question: question || undefined,
    lastItem: { content: t('Generation') },
  });

  const __showSkeleton = false;
  if (__showSkeleton) {
    return <ContentSkeleton />;
  }

  return (
    <>
      <DashboardHeader
        heading={title}
        className={cn(
          isDev && '__GenerateAnswersPageWrapper_DashboardHeader', // DEBUG
          'mx-6 transition',
          (isRouteChanging || isLeaving) && 'disabled',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <ScrollArea
        className={cn(isDev && '__GenerateAnswersPageWrapper_Scroll')}
        viewportClassName={cn(
          isDev && '__GenerateAnswersPageWrapper_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:gap-6 [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        {isPreparing ? (
          <InnerContentSkeleton className="px-6" />
        ) : error ? (
          <PageError
            title={t('GenerateAnswersModal.ErrorOccured')}
            error={error}
            extraActions={
              <Button onClick={startOverCallback} className="content-truncate flex gap-2">
                <Icons.Refresh className="size-4 shrink-0" />
                <span className="truncate">{t('StartOver')}</span>
              </Button>
            }
          />
        ) : !aiGenerationsAllowed ? (
          <PageError
            title={t('NoAiGenrationsAvailable')}
            explanation={<AIGenerationsStatusInfo className="justify-center" />}
          />
        ) : savedAnswers ? (
          <SavedScreen
            className="px-6"
            startOverCallback={startOverCallback}
            scope={scope}
            topicId={topicId}
            questionId={questionId}
            savedAnswers={savedAnswers}
          />
        ) : generatedAnswers && isEditing ? (
          <EditScreen
            className="px-6"
            startOverCallback={startOverCallback}
            topicId={topicId}
            questionId={questionId}
            isSaving={saveAnswersMutation.isPending}
            handleCancel={resetOperations}
            generatedAnswers={generatedAnswers}
            saveAnswers={saveCallback}
          />
        ) : generatedAnswers ? (
          <GeneratedScreen
            className="px-6"
            handleCancel={resetOperations}
            startOverCallback={startOverCallback}
            isSaving={saveAnswersMutation.isPending}
            topicId={topicId}
            questionId={questionId}
            generatedAnswers={generatedAnswers}
            saveAnswers={saveCallback}
            /* // TODO: Issue #80: Implement simple answers editing
             * editAnswers={() => {
             *   if (!generatedAnswers?.length) {
             *     toast.error(t('GenerateAnswersModal.NoAnswersGenerated'));
             *   } else {
             *     setEditing(true);
             *   }
             * }}
             */
          />
        ) : (
          <GenerateAnswersForm
            form={form}
            generateCallback={generateCallback}
            handleCancel={resetOperations}
            className="px-6"
            isGenerating={generateAnswersMutation.isPending}
            isPending={isBusy}
            topicId={topicId}
            questionId={questionId}
          />
        )}

        {/* Leaving splash */}
        <BusySplash
          className={cn(
            isDev && '__GenerateAnswersPageWrapper_BusySplash', // DEBUG
          )}
          isBusy={isRouteChanging || isLeaving}
        />
      </ScrollArea>
    </>
  );
}
